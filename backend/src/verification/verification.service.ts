import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VERIFICATION_PROVIDER, IVerificationProvider } from './providers/verification-provider.interface';
import { SubmitVerificationDto } from './dto/submit-verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(VERIFICATION_PROVIDER) private readonly verificationProvider: IVerificationProvider,
  ) {}

  async submitVerification(userId: string, dto: SubmitVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    // Call provider
    const result = await this.verificationProvider.verifyLiveness(userId, dto.selfieUri);

    const status = result.isVerified
      ? VerificationStatus.VERIFIED
      : VerificationStatus.REJECTED;

    const record = await this.prisma.verificationRecord.create({
      data: {
        userId,
        selfieUrl: dto.selfieUri.substring(0, 1000), // store reference safely
        status,
        confidence: result.confidence,
        notes: result.notes,
        reviewedAt: new Date(),
      },
    });

    // Update profile verification status
    await this.prisma.profile.upsert({
      where: { userId },
      update: { verificationStatus: status },
      create: {
        userId,
        name: user.phoneNumber,
        verificationStatus: status,
      },
    });

    return {
      status,
      confidence: result.confidence,
      recordId: record.id,
      notes: result.notes,
    };
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        verificationRecords: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    return {
      status: user.profile?.verificationStatus || VerificationStatus.UNVERIFIED,
      latestRecord: user.verificationRecords[0] || null,
    };
  }
}
