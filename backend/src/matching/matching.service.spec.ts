import { MatchingService } from './matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompatibilityService } from './services/compatibility.service';
import { MatchingQueueService } from './services/matching-queue.service';
import { MatchingGateway } from './matching.gateway';

describe('MatchingService Algorithm & Scoring', () => {
  let service: MatchingService;
  let mockPrisma: any;
  let compatibilityService: CompatibilityService;
  let queueService: MatchingQueueService;
  let mockGateway: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      match: {
        findFirst: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn().mockResolvedValue({ id: 'match-123', user1Id: 'u1', user2Id: 'u2' }),
      },
      chat: {
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'chat-1' }),
      },
      chatMember: {
        createMany: jest.fn(),
      },
    };
    compatibilityService = new CompatibilityService();
    queueService = new MatchingQueueService();
    mockGateway = {
      server: { to: jest.fn().mockReturnThis(), emit: jest.fn() },
      notifyMatchFound: jest.fn(),
    };

    service = new MatchingService(
      mockPrisma as unknown as PrismaService,
      compatibilityService,
      queueService,
      mockGateway as unknown as MatchingGateway,
    );
  });

  describe('Compatibility Score & Queue Matching', () => {
    it('computes high score for matching topic and close distance', async () => {
      const user1 = {
        id: 'u1',
        phoneNumber: '+919876543210',
        profile: {
          name: 'Aanya',
          intent: 'Chatting & Fun',
          isAvailable: true,
          avatarUrl: 'https://avatar1.jpg',
        },
        location: { latitude: 12.9716, longitude: 77.5946 },
        userInterests: [{ interest: { name: 'Gaming' } }, { interest: { name: 'Tech' } }],
      };

      const user2 = {
        id: 'u2',
        phoneNumber: '+919876543211',
        profile: {
          name: 'Priya',
          intent: 'Chatting & Fun',
          isAvailable: true,
          avatarUrl: 'https://avatar2.jpg',
        },
        location: { latitude: 12.9750, longitude: 77.5980 }, // ~0.5 km away
        userInterests: [{ interest: { name: 'Gaming' } }, { interest: { name: 'Music' } }],
      };

      mockPrisma.user.findUnique.mockImplementation(({ where }: any) => {
        if (where.id === 'u1') return Promise.resolve(user1);
        if (where.id === 'u2') return Promise.resolve(user2);
        return Promise.resolve(null);
      });

      mockPrisma.match.findFirst.mockResolvedValue(null);
      mockPrisma.match.create.mockResolvedValue({
        id: 'match-123',
        user1Id: 'u1',
        user2Id: 'u2',
        matchedAt: new Date(),
      });

      // User 1 joins queue
      const res1 = await service.joinTalkNow('u1', 'Gaming');
      expect(res1.status).toBe('searching');

      // User 2 joins queue and pairs with User 1
      const res2 = await service.joinTalkNow('u2', 'Gaming');
      expect(res2.status).toBe('matched');
      expect(res2.partner?.name).toBe('Aanya');
      expect(res2.score).toBeGreaterThan(0.7);
    });

    it('cancels queue membership cleanly', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        profile: { name: 'Aanya' },
        userInterests: [],
      });

      await service.joinTalkNow('u1', 'Coding');
      const cancelRes = await service.cancelTalkNow('u1');
      expect(cancelRes.cancelled).toBe(true);

      const status = await service.getStatus('u1');
      expect(status.status).toBe('idle');
    });
  });
});
