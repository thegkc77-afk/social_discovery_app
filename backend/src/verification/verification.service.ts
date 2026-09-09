import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chats/chat.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import {
  VERIFICATION_PROVIDER,
  IVerificationProvider,
} from './providers/verification-provider.interface';
import { SubmitVerificationDto } from './dto/submit-verification.dto';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(VERIFICATION_PROVIDER)
    private readonly verificationProvider: IVerificationProvider,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Submit selfie photo for identity and liveness verification
   */
  async submitVerification(userId: string, dto: SubmitVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    // Call abstract verification provider
    const result = await this.verificationProvider.verifyLiveness(
      userId,
      dto.selfieUri,
    );

    const status = result.isVerified
      ? VerificationStatus.VERIFIED
      : VerificationStatus.REJECTED;

    // Create verification record log
    const record = await this.prisma.verificationRecord.create({
      data: {
        userId,
        selfieUrl: dto.selfieUri.substring(0, 1000),
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

    const eventPayload = {
      userId,
      status,
      confidence: result.confidence,
      recordId: record.id,
      notes: result.notes,
      reviewedAt: record.reviewedAt?.toISOString(),
    };

    // Emit real-time WebSocket verification events
    if (this.chatGateway?.server) {
      this.chatGateway.server
        .to(`user_${userId}`)
        .emit('verification:status_changed', eventPayload);
      this.chatGateway.server
        .to(`user_${userId}`)
        .emit('verification_status_changed', eventPayload);
    }

    // Persist notification for the user
    try {
      if (status === VerificationStatus.VERIFIED) {
        await this.notificationsService.createNotification({
          userId,
          type: 'VERIFICATION',
          title: 'Profile Verified! ✓',
          body: 'Your selfie verification passed. A verified badge is now active on your profile.',
          data: { verificationRecordId: record.id, status },
        });
      } else {
        await this.notificationsService.createNotification({
          userId,
          type: 'VERIFICATION',
          title: 'Verification Incomplete',
          body: 'We could not verify your identity. Please take a clear, well-lit selfie to try again.',
          data: { verificationRecordId: record.id, status },
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to create verification notification: ${err.message}`);
    }

    this.logger.log(`User ${userId} verification outcome: ${status} (confidence: ${result.confidence})`);
    return eventPayload;
  }

  /**
   * Get current verification status and latest record
   */
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
      isVerified: user.profile?.verificationStatus === VerificationStatus.VERIFIED,
      latestRecord: user.verificationRecords[0] || null,
    };
  }

  /**
   * Get all verification submission history records for a user
   */
  async getRecords(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const records = await this.prisma.verificationRecord.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      records: records.map((r) => ({
        id: r.id,
        status: r.status,
        confidence: r.confidence,
        notes: r.notes,
        submittedAt: r.submittedAt.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString() || null,
      })),
      total: records.length,
    };
  }
}
