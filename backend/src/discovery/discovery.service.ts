import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscoveryQueryDto } from './dto/discovery-query.dto';

export interface SafePublicProfile {
  id: string;
  name: string;
  username?: string;
  age: number;
  avatar: string;
  detailImage?: string;
  distance: string;
  location: string;
  online: boolean;
  vibes: string[];
  bio: string;
  likes: number;
  commentsCount: number;
  hasLiked: boolean;
  verificationStatus: string;
  intent?: string;
  isAvailable: boolean;
  photos: { id: string; url: string; order: number; isMain: boolean }[];
}

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates geodesic distance in kilometers between two GPS coordinates using the Haversine formula.
   */
  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private formatSafeDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return '< 1 km away';
    }
    return `${distanceKm.toFixed(1)} km away`;
  }

  async getNearbyUsers(
    currentUserId: string,
    query: DiscoveryQueryDto,
  ): Promise<SafePublicProfile[]> {
    // 1. Fetch current user location and preferences if available
    const [currentUserLocation, currentUserPrefs, userLikes] = await Promise.all([
      this.prisma.location.findUnique({ where: { userId: currentUserId } }),
      this.prisma.userPreference.findUnique({ where: { userId: currentUserId } }),
      this.prisma.like.findMany({
        where: { fromUserId: currentUserId },
        select: { toUserId: true },
      }),
    ]);

    const likedUserIds = new Set(userLikes.map((l) => l.toUserId));

    const originLat = query.latitude ?? currentUserLocation?.latitude ?? 12.9716; // default Bangalore
    const originLon = query.longitude ?? currentUserLocation?.longitude ?? 77.5946;

    const maxDistanceKm =
      query.maxDistanceKm ?? currentUserPrefs?.maxDistanceKm ?? 50;
    const minAge = query.minAge ?? currentUserPrefs?.minAge ?? 18;
    const maxAge = query.maxAge ?? currentUserPrefs?.maxAge ?? 99;

    // 2. Fetch candidates from database (active, excluding self)
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isActive: true,
        profile: {
          age: { gte: minAge, lte: maxAge },
          ...(query.gender ? { gender: query.gender } : {}),
          ...(query.intent ? { intent: query.intent } : {}),
        },
      },
      include: {
        profile: true,
        location: true,
        photos: { orderBy: { order: 'asc' } },
        userInterests: { include: { interest: true } },
      },
      take: (query.limit || 20) * 2, // overfetch slightly for post-filtering by distance
    });

    // 3. Filter by distance & interest, compute safe public profiles
    const results: SafePublicProfile[] = [];

    for (const candidate of candidates) {
      if (!candidate.profile) continue;

      const candLat = candidate.location?.latitude ?? originLat + 0.01;
      const candLon = candidate.location?.longitude ?? originLon + 0.01;

      const distanceKm = this.calculateDistanceKm(originLat, originLon, candLat, candLon);
      if (distanceKm > maxDistanceKm) continue;

      const vibes = candidate.userInterests.map((ui) => ui.interest.name);
      if (query.interest && !vibes.includes(query.interest)) {
        continue;
      }

      const mainAvatar =
        candidate.profile.avatarUrl ||
        candidate.photos[0]?.url ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80';

      results.push({
        id: candidate.id,
        name: candidate.profile.name,
        username: candidate.profile.username || undefined,
        age: candidate.profile.age || 24,
        avatar: mainAvatar,
        detailImage: candidate.profile.coverPhotoUrl || mainAvatar,
        distance: this.formatSafeDistance(distanceKm),
        location: candidate.profile.locationName || candidate.location?.city || 'Bangalore, India',
        online: candidate.profile.online,
        vibes,
        bio: candidate.profile.bio || '',
        likes: candidate.profile.likesCount,
        commentsCount: candidate.profile.commentsCount,
        hasLiked: likedUserIds.has(candidate.id),
        verificationStatus: candidate.profile.verificationStatus.toLowerCase(),
        intent: candidate.profile.intent || undefined,
        isAvailable: candidate.profile.isAvailable,
        photos: candidate.photos.map((p) => ({
          id: p.id,
          url: p.url,
          order: p.order,
          isMain: p.isMain,
        })),
      });

      if (results.length >= (query.limit || 20)) {
        break;
      }
    }

    return results;
  }

  async likeUser(fromUserId: string, targetUserId: string) {
    if (fromUserId === targetUserId) {
      throw new BadRequestException('You cannot like your own profile');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });

    if (!targetUser) {
      throw new NotFoundException(`User with ID '${targetUserId}' not found`);
    }

    // 1. Create or update Like record
    const like = await this.prisma.like.upsert({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId: targetUserId,
        },
      },
      update: {},
      create: {
        fromUserId,
        toUserId: targetUserId,
      },
    });

    // 2. Increment profile likes count
    await this.prisma.profile.updateMany({
      where: { userId: targetUserId },
      data: { likesCount: { increment: 1 } },
    });

    // 3. Check for mutual like
    const reciprocalLike = await this.prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: targetUserId,
          toUserId: fromUserId,
        },
      },
    });

    let isMutualMatch = false;
    let match = null;

    if (reciprocalLike) {
      isMutualMatch = true;
      const [u1, u2] = [fromUserId, targetUserId].sort();

      match = await this.prisma.match.upsert({
        where: {
          user1Id_user2Id: {
            user1Id: u1,
            user2Id: u2,
          },
        },
        update: { isActive: true },
        create: {
          user1Id: u1,
          user2Id: u2,
          isActive: true,
        },
      });

      this.logger.log(`🎉 Mutual match created between '${fromUserId}' and '${targetUserId}'`);
    }

    return {
      success: true,
      liked: true,
      isMutualMatch,
      match: match || undefined,
      targetUserId,
    };
  }

  async unlikeUser(fromUserId: string, targetUserId: string) {
    await this.prisma.like.deleteMany({
      where: {
        fromUserId,
        toUserId: targetUserId,
      },
    });

    await this.prisma.profile.updateMany({
      where: { userId: targetUserId, likesCount: { gt: 0 } },
      data: { likesCount: { decrement: 1 } },
    });

    const [u1, u2] = [fromUserId, targetUserId].sort();
    await this.prisma.match.updateMany({
      where: { user1Id: u1, user2Id: u2 },
      data: { isActive: false },
    });

    return { success: true, unliked: true };
  }

  async getMatches(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        isActive: true,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          include: {
            profile: true,
            photos: { where: { isMain: true } },
            userInterests: { include: { interest: true } },
          },
        },
        user2: {
          include: {
            profile: true,
            photos: { where: { isMain: true } },
            userInterests: { include: { interest: true } },
          },
        },
      },
      orderBy: { matchedAt: 'desc' },
    });

    return matches.map((m) => {
      const partner = m.user1Id === userId ? m.user2 : m.user1;
      return {
        matchId: m.id,
        matchedAt: m.matchedAt,
        partner: {
          id: partner.id,
          name: partner.profile?.name || 'Anonymous',
          avatar: partner.profile?.avatarUrl || partner.photos[0]?.url,
          bio: partner.profile?.bio,
          intent: partner.profile?.intent,
          vibes: partner.userInterests.map((ui) => ui.interest.name),
        },
      };
    });
  }

  async getSentLikes(userId: string) {
    return this.prisma.like.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          include: { profile: true },
        },
      },
    });
  }

  async getReceivedLikes(userId: string) {
    return this.prisma.like.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          include: { profile: true },
        },
      },
    });
  }
}
