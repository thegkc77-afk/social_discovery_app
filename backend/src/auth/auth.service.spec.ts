jest.mock('@nestjs/jwt', () => ({
  JwtService: class {
    signAsync = jest.fn().mockResolvedValue('mocked_signed_jwt');
    verifyAsync = jest.fn();
  },
}));

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwt: any;
  let mockConfig: any;
  let mockOtpProvider: any;

  beforeEach(() => {
    mockPrisma = {
      otpRecord: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    mockJwt = new (JwtService as any)();
    mockConfig = {
      get: jest.fn((key: string, def: any) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'DEV_OTP') return '123456';
        if (key === 'JWT_ACCESS_SECRET') return 'test_secret';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
        return def;
      }),
    };
    mockOtpProvider = {
      sendOtp: jest.fn().mockResolvedValue(true),
    };

    service = new AuthService(
      mockPrisma as unknown as PrismaService,
      mockJwt as unknown as JwtService,
      mockConfig as unknown as ConfigService,
      mockOtpProvider,
    );
  });

  describe('Phone Number Normalization & Request OTP', () => {
    it('normalizes 10 digit Indian numbers and sends OTP', async () => {
      mockPrisma.otpRecord.create.mockResolvedValue({ id: 'otp-1' });

      const res = await service.requestOtp({ phoneNumber: '+919876543210' });
      expect(res.message).toBeDefined();
      expect(res.expiresInSeconds).toBe(300);
      expect(mockOtpProvider.sendOtp).toHaveBeenCalledWith('+919876543210', expect.any(String));
    });

    it('verifies valid OTP and logs user in', async () => {
      const existingUser = {
        id: 'user-uuid-1',
        phoneNumber: '+919876543210',
        profile: { name: 'Test User' },
      };

      mockPrisma.otpRecord.findFirst.mockResolvedValue({
        id: 'otp-rec-1',
        phoneNumber: '+919876543210',
        otpHash: '$2a$10$dummyhash',
        attempts: 0,
        expiresAt: new Date(Date.now() + 60000),
        isUsed: false,
      });

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue(existingUser);

      const res = await service.verifyOtp({
        phoneNumber: '9876543210',
        otp: '123456',
      });

      expect(res.accessToken).toBeDefined();
      expect(res.refreshToken).toBeDefined();
      expect(res.user.id).toBe('user-uuid-1');
      expect(res.isNewUser).toBe(false);
    });
  });
});
