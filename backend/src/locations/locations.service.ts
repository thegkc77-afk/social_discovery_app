import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const location = await this.prisma.location.upsert({
      where: { userId },
      update: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        city: dto.city,
        country: dto.country,
      },
      create: {
        userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        city: dto.city,
        country: dto.country,
      },
    });

    if (dto.city) {
      await this.prisma.profile.updateMany({
        where: { userId },
        data: { locationName: dto.city },
      });
    }

    return {
      message: 'Location updated successfully',
      updatedAt: location.updatedAt,
    };
  }

  async getLocation(userId: string) {
    const location = await this.prisma.location.findUnique({
      where: { userId },
    });

    if (!location) {
      throw new NotFoundException(`Location for user '${userId}' not found`);
    }

    return location;
  }
}
