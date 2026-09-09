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

  async completeOnboarding(userId: string, dto: import('./dto/complete-onboarding.dto').CompleteOnboardingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const calculatedAge = this.calculateAge(dto.birthdate);
    const mainAvatar = dto.photos.length > 0 ? dto.photos[0] : undefined;

    // 1. Upsert Profile
    await this.prisma.profile.upsert({
      where: { userId },
      update: {
        name: dto.name,
        username: dto.username,
        birthdate: new Date(dto.birthdate),
        age: calculatedAge,
        gender: dto.gender,
        bio: dto.bio,
        locationName: dto.locationName || 'Bangalore, India',
        intent: dto.intent,
        avatarUrl: mainAvatar,
        coverPhotoUrl: mainAvatar,
      },
      create: {
        userId,
        name: dto.name,
        username: dto.username,
        birthdate: new Date(dto.birthdate),
        age: calculatedAge,
        gender: dto.gender,
        bio: dto.bio,
        locationName: dto.locationName || 'Bangalore, India',
        intent: dto.intent,
        avatarUrl: mainAvatar,
        coverPhotoUrl: mainAvatar,
      },
    });

    // 2. Sync Photos
    if (dto.photos && dto.photos.length > 0) {
      await this.prisma.photo.deleteMany({ where: { userId } });
      await this.prisma.photo.createMany({
        data: dto.photos.map((url, index) => ({
          userId,
          url,
          order: index,
          isMain: index === 0,
        })),
      });
    }

    // 3. Sync Interests
    if (dto.interests && dto.interests.length > 0) {
      const resolved = await this.prisma.interest.findMany({
        where: {
          OR: [{ id: { in: dto.interests } }, { name: { in: dto.interests } }],
        },
      });

      const foundNames = new Set(resolved.map((i) => i.name.toLowerCase()));
      const allInterestIds = [...resolved.map((i) => i.id)];

      for (const item of dto.interests) {
        if (!foundNames.has(item.toLowerCase())) {
          const created = await this.prisma.interest.create({ data: { name: item } });
          allInterestIds.push(created.id);
          foundNames.add(item.toLowerCase());
        }
      }

      await this.prisma.userInterest.deleteMany({ where: { userId } });
      await this.prisma.userInterest.createMany({
        data: allInterestIds.map((interestId) => ({ userId, interestId })),
        skipDuplicates: true,
      });
    }

    // 4. Update Preferences Intent
    await this.prisma.userPreference.upsert({
      where: { userId },
      update: {
        preferredIntents: [dto.intent],
      },
      create: {
        userId,
        preferredIntents: [dto.intent],
      },
    });

    return this.findByUserId(userId);
  }
}
