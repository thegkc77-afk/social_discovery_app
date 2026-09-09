import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { ReorderPhotosDto } from './dto/reorder-photos.dto';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    return this.prisma.photo.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async addPhoto(userId: string, dto: CreatePhotoDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const existingPhotosCount = await this.prisma.photo.count({ where: { userId } });
    const isFirstPhoto = existingPhotosCount === 0;
    const shouldBeMain = dto.isMain ?? isFirstPhoto;

    if (shouldBeMain && !isFirstPhoto) {
      // Unset previous main photo
      await this.prisma.photo.updateMany({
        where: { userId, isMain: true },
        data: { isMain: false },
      });
    }

    const nextOrder = dto.order ?? existingPhotosCount;

    const photo = await this.prisma.photo.create({
      data: {
        userId,
        url: dto.url,
        order: nextOrder,
        isMain: shouldBeMain,
      },
    });

    if (shouldBeMain) {
      await this.prisma.profile.updateMany({
        where: { userId },
        data: { avatarUrl: dto.url },
      });
    }

    return photo;
  }

  async setMainPhoto(photoId: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException(`Photo with ID '${photoId}' not found`);
    }

    await this.prisma.$transaction([
      this.prisma.photo.updateMany({
        where: { userId: photo.userId },
        data: { isMain: false },
      }),
      this.prisma.photo.update({
        where: { id: photoId },
        data: { isMain: true },
      }),
      this.prisma.profile.updateMany({
        where: { userId: photo.userId },
        data: { avatarUrl: photo.url },
      }),
    ]);

    return this.prisma.photo.findUnique({ where: { id: photoId } });
  }

  async removePhoto(photoId: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException(`Photo with ID '${photoId}' not found`);
    }

    await this.prisma.photo.delete({ where: { id: photoId } });

    // If deleted photo was main, set the first remaining photo as main
    if (photo.isMain) {
      const nextPhoto = await this.prisma.photo.findFirst({
        where: { userId: photo.userId },
        orderBy: { order: 'asc' },
      });

      if (nextPhoto) {
        await this.prisma.photo.update({
          where: { id: nextPhoto.id },
          data: { isMain: true },
        });
        await this.prisma.profile.updateMany({
          where: { userId: photo.userId },
          data: { avatarUrl: nextPhoto.url },
        });
      } else {
        await this.prisma.profile.updateMany({
          where: { userId: photo.userId },
          data: { avatarUrl: null },
        });
      }
    }

    return { deleted: true, id: photoId };
  }

  async reorder(userId: string, dto: ReorderPhotosDto) {
    const updates = dto.photos.map((item) =>
      this.prisma.photo.updateMany({
        where: { id: item.id, userId },
        data: { order: item.order },
      }),
    );

    await this.prisma.$transaction(updates);
    return this.findByUserId(userId);
  }
}
