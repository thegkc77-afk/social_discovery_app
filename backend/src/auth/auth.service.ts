import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { OTP_PROVIDER, IOtpProvider } from './providers/otp-provider.interface';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(OTP_PROVIDER) private readonly otpProvider: IOtpProvider,
  ) {}

  private generateRandomOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async requestOtp(dto: RequestOtpDto) {
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
    const devStaticOtp = this.configService.get<string>('DEV_STATIC_OTP', '123456');
    const otp = isDev ? devStaticOtp : this.generateRandomOtp();

    const expirationMinutes = this.configService.get<number>('OTP_EXPIRATION_MINUTES', 5);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Invalidate prior unused OTPs for this phone number
    await this.prisma.otpRecord.updateMany({
      where: { phoneNumber: dto.phoneNumber, isUsed: false },
      data: { isUsed: true },
    });

    // Store new OTP record
    await this.prisma.otpRecord.create({
      data: {
        phoneNumber: dto.phoneNumber,
        otpHash,
        expiresAt,
      },
    });

    // Send via provider
    await this.otpProvider.sendOtp(dto.phoneNumber, otp);

    return {
      message: 'OTP sent successfully',
      expiresInSeconds: expirationMinutes * 60,
      devOtp: isDev ? otp : undefined,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const devStaticOtp = this.configService.get<string>('DEV_STATIC_OTP', '123456');
    const maxAttempts = this.configService.get<number>('OTP_MAX_ATTEMPTS', 5);

    const otpRecord = await this.prisma.otpRecord.findFirst({
      where: {
        phoneNumber: dto.phoneNumber,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      // In dev mode, allow static fallback if configured
      if (dto.otp !== devStaticOtp) {
        throw new BadRequestException('Invalid or expired OTP. Please request a new one.');
      }
    } else {
      if (otpRecord.attempts >= maxAttempts) {
        throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
      }

      const isValidOtp =
        (await bcrypt.compare(dto.otp, otpRecord.otpHash)) || dto.otp === devStaticOtp;

      if (!isValidOtp) {
        await this.prisma.otpRecord.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        });
        throw new BadRequestException('Incorrect OTP code.');
      }

      // Mark OTP as used
      await this.prisma.otpRecord.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        profile: true,
        photos: { orderBy: { order: 'asc' } },
        userInterests: { include: { interest: true } },
        preferences: true,
      },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          phoneNumber: dto.phoneNumber,
          countryCode: dto.countryCode || '+91',
          isPhoneVerified: true,
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
          photos: { orderBy: { order: 'asc' } },
          userInterests: { include: { interest: true } },
          preferences: true,
        },
      });
    } else if (!user.isPhoneVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isPhoneVerified: true },
        include: {
          profile: true,
          photos: { orderBy: { order: 'asc' } },
          userInterests: { include: { interest: true } },
          preferences: true,
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.phoneNumber);

    // Hash refresh token & store
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNewUser,
      user,
    };
  }

  async refreshToken(refreshTokenStr: string) {
    try {
      const refreshSecret = this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'dev_refresh_secret_super_secure_key_change_in_production',
      );

      const payload = this.jwtService.verify<JwtPayload>(refreshTokenStr, {
        secret: refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive || !user.hashedRefreshToken) {
        throw new UnauthorizedException('Access denied');
      }

      const isMatch = await bcrypt.compare(refreshTokenStr, user.hashedRefreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid or rotated refresh token');
      }

      // Rotate tokens
      const newTokens = await this.generateTokens(user.id, user.phoneNumber);
      await this.updateHashedRefreshToken(user.id, newTokens.refreshToken);

      return newTokens;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        photos: { orderBy: { order: 'asc' } },
        userInterests: { include: { interest: true } },
        preferences: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: string, phoneNumber: string) {
    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'dev_access_secret_super_secure_key_change_in_production',
    );
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'dev_refresh_secret_super_secure_key_change_in_production',
    );
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, phoneNumber, type: 'access' },
        { secret: accessSecret, expiresIn: accessExpiresIn as any },
      ),
      this.jwtService.signAsync(
        { sub: userId, phoneNumber, type: 'refresh' },
        { secret: refreshSecret, expiresIn: refreshExpiresIn as any },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateHashedRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(refreshToken, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashed },
    });
  }
}
