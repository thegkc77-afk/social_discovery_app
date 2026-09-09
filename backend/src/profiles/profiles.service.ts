import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateAge(birthdateStr: string): number {
    const birthDate = new Date(birthdateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(18, age);
  }

  async upsert(userId: string, dto: CreateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    if (dto.username) {
      const existingWithUsername = await this.prisma.profile.findFirst({
        where: {
          username: dto.username,
          NOT: { userId },
        },
      });
      if (existingWithUsername) {
        throw new ConflictException(`Username '${dto.username}' is already taken`);
      }
    }

    const calculatedAge =
      dto.age ?? (dto.birthdate ? this.calculateAge(dto.birthdate) : undefined);

    const data = {
      ...dto,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      age: calculatedAge,
    };

    return this.prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
      include: {
        user: {
          include: {
            photos: { orderBy: { order: 'asc' } },
            userInterests: { include: { interest: true } },
            preferences: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            photos: { orderBy: { order: 'asc' } },
            userInterests: { include: { interest: true } },
            preferences: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user '${userId}' not found`);
    }

    return profile;
  }

  async update(userId: string, dto: UpdateProfileDto) {
    await this.findByUserId(userId);

    if (dto.username) {
      const existingWithUsername = await this.prisma.profile.findFirst({
        where: {
          username: dto.username,
          NOT: { userId },
        },
      });
      if (existingWithUsername) {
        throw new ConflictException(`Username '${dto.username}' is already taken`);
      }
    }

    const calculatedAge =
      dto.age ?? (dto.birthdate ? this.calculateAge(dto.birthdate) : undefined);

    const data = {
      ...dto,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      age: calculatedAge,
    };

    return this.prisma.profile.update({
      where: { userId },
      data,
      include: {
        user: {
          include: {
            photos: { orderBy: { order: 'asc' } },
            userInterests: { include: { interest: true } },
            preferences: true,
          },
        },
      },
    });
  }
}
