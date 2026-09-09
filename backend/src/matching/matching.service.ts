import {
  Injectable,
  NotFoundException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CompatibilityService, CandidateEntity } from './services/compatibility.service';
import { MatchingQueueService, QueueEntry } from './services/matching-queue.service';
import { MatchingGateway } from './matching.gateway';

export interface MatchResult {
  status: 'searching' | 'matched';
  requestId?: string;
  matchId?: string;
  partner?: any;
  score?: number;
  message?: string;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly compatibilityService: CompatibilityService,
    private readonly queueService: MatchingQueueService,
    @Inject(forwardRef(() => MatchingGateway))
    private readonly gateway: MatchingGateway,
  ) {}

  private async buildCandidateEntity(userId: string): Promise<CandidateEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        location: true,
        userInterests: { include: { interest: true } },
      },
    });

    if (!user) return null;

    return {
      userId: user.id,
      name: user.profile?.name || 'Anonymous',
      intent: user.profile?.intent || undefined,
      interests: user.userInterests.map((ui) => ui.interest.name),
      latitude: user.location?.latitude,
      longitude: user.location?.longitude,
      isAvailable: user.profile?.isAvailable,
    };
  }

  async joinTalkNow(
    userId: string,
    topic: string,
    socketId?: string,
    maxDistanceKm: number = 50,
  ): Promise<MatchResult> {
    const candidateEntity = await this.buildCandidateEntity(userId);
    const requestId = randomUUID();

    // 1. Check if there are other waiting candidates in queue
    const waitingCandidates = this.queueService.getWaitingCandidates(userId);

    let bestMatch: QueueEntry | null = null;
    let highestScore = 0;

    for (const waiting of waitingCandidates) {
      if (!candidateEntity) continue;

      const comp = this.compatibilityService.calculateCompatibility(
        candidateEntity,
        waiting.candidate,
        topic,
        waiting.topic,
        Math.min(maxDistanceKm, waiting.maxDistanceKm),
      );

      if (comp.isMatchable && comp.totalScore > highestScore) {
        highestScore = comp.totalScore;
        bestMatch = waiting;
      }
    }

    // 2. If a waiting peer matched
    if (bestMatch) {
      this.queueService.removeFromQueue(bestMatch.userId);
      const [u1, u2] = [userId, bestMatch.userId].sort();

      const match = await this.prisma.match.upsert({
        where: {
          user1Id_user2Id: {
            user1Id: u1,
            user2Id: u2,
          },
        },
        update: { isActive: true, matchedAt: new Date() },
        create: {
          user1Id: u1,
          user2Id: u2,
          isActive: true,
        },
      });

      const partnerUser = await this.prisma.user.findUnique({
        where: { id: bestMatch.userId },
        include: {
          profile: true,
          photos: { where: { isMain: true } },
          userInterests: { include: { interest: true } },
        },
      });

      const partnerData = {
        id: partnerUser?.id,
        name: partnerUser?.profile?.name || 'Anonymous',
        age: partnerUser?.profile?.age || 24,
        avatar: partnerUser?.profile?.avatarUrl || partnerUser?.photos[0]?.url,
        distance: '1.2 km away',
        online: true,
        vibes: partnerUser?.userInterests.map((ui) => ui.interest.name) || [topic],
        bio: partnerUser?.profile?.bio || '',
      };

      // Notify the waiting partner via WebSocket if connected
      if (bestMatch.socketId) {
        const currentUserData = {
          id: userId,
          name: candidateEntity?.name || 'Anonymous',
          avatar: partnerUser?.profile?.avatarUrl,
          vibes: candidateEntity?.interests || [topic],
        };

        this.gateway.notifyMatchFound(bestMatch.socketId, {
          matchId: match.id,
          topic,
          matchedUser: currentUserData,
        });
      }

      return {
        status: 'matched',
        matchId: match.id,
        partner: partnerData,
        score: highestScore,
      };
    }

    // 3. If no live peer in queue, check if simulated/seed matching is appropriate
    const otherUsers = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        isActive: true,
        userInterests: { some: { interest: { name: { contains: topic, mode: 'insensitive' } } } },
      },
      include: {
        profile: true,
        photos: { where: { isMain: true } },
        userInterests: { include: { interest: true } },
      },
      take: 1,
    });

    if (otherUsers.length > 0) {
      const matchedPeer = otherUsers[0];
      const [u1, u2] = [userId, matchedPeer.id].sort();

      const match = await this.prisma.match.upsert({
        where: {
          user1Id_user2Id: {
            user1Id: u1,
            user2Id: u2,
          },
        },
        update: { isActive: true, matchedAt: new Date() },
        create: {
          user1Id: u1,
          user2Id: u2,
          isActive: true,
        },
      });

      const partnerData = {
        id: matchedPeer.id,
        name: matchedPeer.profile?.name || 'Priya',
        age: matchedPeer.profile?.age || 24,
        avatar: matchedPeer.profile?.avatarUrl || matchedPeer.photos[0]?.url || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80',
        distance: '1.6 km away',
        online: true,
        vibes: matchedPeer.userInterests.map((ui) => ui.interest.name),
        bio: matchedPeer.profile?.bio || 'Exploring the city & good vibes ☕',
      };

      return {
        status: 'matched',
        matchId: match.id,
        partner: partnerData,
        score: 0.85,
      };
    }

    // 4. Add to waiting queue
    if (candidateEntity) {
      this.queueService.addToQueue({
        requestId,
        userId,
        topic,
        maxDistanceKm,
        candidate: candidateEntity,
        joinedAt: new Date(),
        socketId,
      });
    }

    return {
      status: 'searching',
      requestId,
      message: `Searching for compatible partners interested in '${topic}'`,
    };
  }

  cancelTalkNow(userId: string) {
    const entry = this.queueService.removeFromQueue(userId);
    return {
      cancelled: true,
      userId,
      requestId: entry?.requestId,
    };
  }

  async getStatus(userId: string) {
    const queueEntry = this.queueService.getEntry(userId);
    if (queueEntry) {
      return {
        status: 'searching',
        requestId: queueEntry.requestId,
        topic: queueEntry.topic,
        joinedAt: queueEntry.joinedAt,
      };
    }

    const latestMatch = await this.prisma.match.findFirst({
      where: {
        isActive: true,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } },
      },
      orderBy: { matchedAt: 'desc' },
    });

    if (latestMatch) {
      const partner = latestMatch.user1Id === userId ? latestMatch.user2 : latestMatch.user1;
      return {
        status: 'matched',
        matchId: latestMatch.id,
        matchedAt: latestMatch.matchedAt,
        partner: {
          id: partner.id,
          name: partner.profile?.name,
          avatar: partner.profile?.avatarUrl,
        },
      };
    }

    return { status: 'idle' };
  }
}
