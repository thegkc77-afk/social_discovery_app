import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (existing) {
      throw new ConflictException('User with this phone number already exists');
    }

    return this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,
        countryCode: dto.countryCode || '+91',
        preferences: {
          create: {
            minAge: 18,
            maxAge: 99,
            maxDistanceKm: 50,
          },
        },
      },
      include: {
        profile: true,
        preferences: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
        photos: { orderBy: { order: 'asc' } },
        userInterests: { include: { interest: true } },
        preferences: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        photos: { orderBy: { order: 'asc' } },
        userInterests: { include: { interest: true } },
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    return user;
  }

  async findByPhoneNumber(phoneNumber: string) {
    return this.prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        profile: true,
        photos: { orderBy: { order: 'asc' } },
        userInterests: { include: { interest: true } },
        preferences: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      include: {
        profile: true,
        preferences: true,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
