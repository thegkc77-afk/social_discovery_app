import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterestDto } from './dto/create-interest.dto';

@Injectable()
export class InterestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.interest.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateInterestDto) {
    return this.prisma.interest.upsert({
      where: { name: dto.name },
      update: { category: dto.category, icon: dto.icon },
      create: dto,
    });
  }

  async getUserInterests(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const userInterests = await this.prisma.userInterest.findMany({
      where: { userId },
      include: { interest: true },
      orderBy: { interest: { name: 'asc' } },
    });

    return userInterests.map((ui) => ui.interest);
  }

  async setUserInterests(userId: string, items: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    // Resolve interests by ID or by Name
    const resolvedInterests = await this.prisma.interest.findMany({
      where: {
        OR: [{ id: { in: items } }, { name: { in: items } }],
      },
    });

    // Create any missing interests dynamically if passed as new names
    const foundNames = new Set(resolvedInterests.map((i) => i.name.toLowerCase()));
    const foundIds = new Set(resolvedInterests.map((i) => i.id));
    const allInterestIds: string[] = [...resolvedInterests.map((i) => i.id)];

    for (const item of items) {
      if (!foundIds.has(item) && !foundNames.has(item.toLowerCase())) {
        const created = await this.prisma.interest.create({
          data: { name: item },
        });
        allInterestIds.push(created.id);
        foundNames.add(item.toLowerCase());
      }
    }

    // Atomically replace user interests
    await this.prisma.$transaction([
      this.prisma.userInterest.deleteMany({ where: { userId } }),
      this.prisma.userInterest.createMany({
        data: allInterestIds.map((interestId) => ({
          userId,
          interestId,
        })),
        skipDuplicates: true,
      }),
    ]);

    return this.getUserInterests(userId);
  }
}
