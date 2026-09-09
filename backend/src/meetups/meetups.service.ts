import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { MeetupStatus } from '@prisma/client';
import { ChatGateway } from '../chats/chat.gateway';
import { ChatsService } from '../chats/chats.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import { QueryMeetupsDto } from './dto/query-meetups.dto';
import { MeetupAction, MeetupStateMachine } from './meetup-state.machine';

@Injectable()
export class MeetupsService {
  private readonly logger = new Logger(MeetupsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Create and send a new meetup invitation
   */
  async createMeetup(creatorId: string, dto: CreateMeetupDto) {
    if (creatorId === dto.recipientId) {
      throw new BadRequestException('Cannot invite yourself to a meetup');
    }

    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: dto.recipientId },
      include: { profile: true },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient user not found');
    }

    const resolvedChatId: string =
      dto.chatId ||
      (
        await this.chatsService.createOrGetDirectChat(
          creatorId,
          dto.recipientId,
        )
      ).id;

    // Create Meetup in PENDING state
    const meetup = await this.prisma.meetup.create({
      data: {
        creatorId,
        recipientId: dto.recipientId,
        chatId: resolvedChatId,
        place: dto.place,
        date: dto.date,
        time: dto.time,
        note: dto.note,
        status: MeetupStatus.PENDING,
      },
      include: {
        creator: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
        recipient: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
      },
    });

    // Create an invite message card in the chat thread
    const inviteText = `Meetup Planned: ${dto.place} on ${dto.date} at ${dto.time}`;
    const inviteDetails = {
      meetupId: meetup.id,
      place: dto.place,
      date: dto.date,
      time: dto.time,
      note: dto.note || '',
      status: 'pending',
    };

    try {
      const message = await this.chatsService.sendMessage(resolvedChatId, creatorId, {
        text: inviteText,
        isInvite: true,
        inviteDetails,
      });

      // Broadcast WebSocket events
      const eventPayload = {
        meetupId: meetup.id,
        chatId: resolvedChatId,
        creatorId,
        recipientId: dto.recipientId,
        place: dto.place,
        date: dto.date,
        time: dto.time,
        note: dto.note,
        status: MeetupStatus.PENDING,
        createdAt: meetup.createdAt.toISOString(),
      };

      if (this.chatGateway.server) {
        this.chatGateway.server
          .to(`user_${dto.recipientId}`)
          .emit('meetup_created', eventPayload);
        this.chatGateway.server
          .to(`user_${dto.recipientId}`)
          .emit('meetup:created', eventPayload);
        this.chatGateway.server
          .to(`user_${dto.recipientId}`)
          .emit('meetup:invite', eventPayload);
        this.chatGateway.server
          .to(`user_${dto.recipientId}`)
          .emit('meetup_invite', eventPayload);

        this.chatGateway.server
          .to(`chat_${resolvedChatId}`)
          .emit('meetup_created', eventPayload);
        this.chatGateway.server
          .to(`chat_${resolvedChatId}`)
          .emit('meetup:created', eventPayload);
        this.chatGateway.server
          .to(`chat_${resolvedChatId}`)
          .emit('meetup:invite', eventPayload);
        this.chatGateway.server
          .to(`chat_${resolvedChatId}`)
          .emit('meetup_invite', eventPayload);

        // Also emit message_receive for chat UI
        this.chatGateway.server
          .to(`chat_${resolvedChatId}`)
          .emit('message_receive', {
            chatId: resolvedChatId,
            senderId: creatorId,
            receiverId: dto.recipientId,
            message: JSON.stringify({
              id: message.id,
              text: inviteText,
              isInvite: true,
              inviteDetails,
              time: message.time,
            }),
            data: message,
          });
      }
    } catch (err) {
      this.logger.warn(`Failed to link message for meetup ${meetup.id}: ${err.message}`);
    }

    return this.formatMeetup(meetup, creatorId);
  }

  /**
   * List meetups for current user with optional filtering
   */
  async getMeetups(userId: string, query: QueryMeetupsDto) {
    const where: any = {};

    if (query.type === 'created') {
      where.creatorId = userId;
    } else if (query.type === 'received') {
      where.recipientId = userId;
    } else {
      where.OR = [{ creatorId: userId }, { recipientId: userId }];
    }

    if (query.status) {
      where.status = query.status;
    }

    const meetups = await this.prisma.meetup.findMany({
      where,
      include: {
        creator: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
        recipient: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return meetups.map((m) => this.formatMeetup(m, userId));
  }

  /**
   * Retrieve single meetup by ID
   */
  async getMeetupById(meetupId: string, userId: string) {
    const meetup = await this.findMeetupOrThrow(meetupId);

    if (meetup.creatorId !== userId && meetup.recipientId !== userId) {
      throw new ForbiddenException('You are not a participant in this meetup');
    }

    return this.formatMeetup(meetup, userId);
  }

  /**
   * Execute state transition: Accept
   */
  async acceptMeetup(meetupId: string, userId: string) {
    return this.transitionStatus(meetupId, userId, 'accept');
  }

  /**
   * Execute state transition: Decline
   */
  async declineMeetup(meetupId: string, userId: string) {
    return this.transitionStatus(meetupId, userId, 'decline');
  }

  /**
   * Execute state transition: Cancel
   */
  async cancelMeetup(meetupId: string, userId: string) {
    return this.transitionStatus(meetupId, userId, 'cancel');
  }

  /**
   * Execute state transition: Complete
   */
  async completeMeetup(meetupId: string, userId: string) {
    return this.transitionStatus(meetupId, userId, 'complete');
  }

  /**
   * Get meetup status and allowed transitions
   */
  async getMeetupStatus(meetupId: string, userId: string) {
    const meetup = await this.findMeetupOrThrow(meetupId);

    if (meetup.creatorId !== userId && meetup.recipientId !== userId) {
      throw new ForbiddenException('You are not a participant in this meetup');
    }

    const allowedActions = MeetupStateMachine.getAllowedActions(
      meetup.status,
      userId,
      meetup.creatorId,
      meetup.recipientId,
    );

    return {
      meetupId: meetup.id,
      status: meetup.status,
      allowedActions,
      isCreator: meetup.creatorId === userId,
      isRecipient: meetup.recipientId === userId,
      updatedAt: meetup.updatedAt.toISOString(),
      createdAt: meetup.createdAt.toISOString(),
    };
  }

  /**
   * Core state machine transition coordinator
   */
  private async transitionStatus(
    meetupId: string,
    userId: string,
    action: MeetupAction,
  ) {
    const meetup = await this.findMeetupOrThrow(meetupId);

    const targetStatus = MeetupStateMachine.validateTransition(action, {
      userId,
      creatorId: meetup.creatorId,
      recipientId: meetup.recipientId,
      currentStatus: meetup.status,
    });

    const updated = await this.prisma.meetup.update({
      where: { id: meetupId },
      data: {
        status: targetStatus,
        updatedAt: new Date(),
      },
      include: {
        creator: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
        recipient: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
      },
    });

    // Broadcast WebSocket events to notify both parties and chat room
    const otherUserId =
      userId === meetup.creatorId ? meetup.recipientId : meetup.creatorId;

    const eventPayload = {
      meetupId: updated.id,
      chatId: updated.chatId,
      action,
      previousStatus: meetup.status,
      status: targetStatus,
      updatedBy: userId,
      updatedAt: updated.updatedAt.toISOString(),
    };

    if (this.chatGateway.server) {
      const eventNameMap: Record<MeetupAction, string[]> = {
        accept: ['meetup_accepted', 'meetup:accepted'],
        decline: ['meetup_declined', 'meetup:declined'],
        cancel: ['meetup_cancelled', 'meetup:cancelled', 'meetup_canceled', 'meetup:canceled'],
        complete: ['meetup_completed', 'meetup:completed'],
      };

      const eventNames = eventNameMap[action] || [];

      // Direct notifications to user rooms
      for (const eventName of eventNames) {
        this.chatGateway.server.to(`user_${otherUserId}`).emit(eventName, eventPayload);
      }
      this.chatGateway.server
        .to(`user_${otherUserId}`)
        .emit('meetup_status_changed', eventPayload);
      this.chatGateway.server
        .to(`user_${otherUserId}`)
        .emit('meetup:status_changed', eventPayload);

      // Notify active chat room if associated
      if (updated.chatId) {
        for (const eventName of eventNames) {
          this.chatGateway.server.to(`chat_${updated.chatId}`).emit(eventName, eventPayload);
        }
        this.chatGateway.server
          .to(`chat_${updated.chatId}`)
          .emit('meetup_status_changed', eventPayload);
        this.chatGateway.server
          .to(`chat_${updated.chatId}`)
          .emit('meetup:status_changed', eventPayload);
      }
    }

    return this.formatMeetup(updated, userId);
  }

  /**
   * Helper to fetch meetup or 404
   */
  private async findMeetupOrThrow(meetupId: string) {
    const meetup = await this.prisma.meetup.findUnique({
      where: { id: meetupId },
      include: {
        creator: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
        recipient: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
      },
    });

    if (!meetup) {
      throw new NotFoundException(`Meetup with ID "${meetupId}" not found`);
    }

    return meetup;
  }

  /**
   * Format meetup entity for API response
   */
  private formatMeetup(meetup: any, currentUserId: string) {
    const isCreator = meetup.creatorId === currentUserId;
    const otherUser = isCreator ? meetup.recipient : meetup.creator;
    const otherProfile = otherUser?.profile;
    const otherMainPhoto = otherUser?.photos?.[0]?.url;

    const allowedActions = MeetupStateMachine.getAllowedActions(
      meetup.status,
      currentUserId,
      meetup.creatorId,
      meetup.recipientId,
    );

    return {
      id: meetup.id,
      chatId: meetup.chatId,
      place: meetup.place,
      date: meetup.date,
      time: meetup.time,
      note: meetup.note,
      status: meetup.status,
      isCreator,
      creator: {
        id: meetup.creator.id,
        name: meetup.creator.profile?.name || 'User',
        avatar: meetup.creator.profile?.avatarUrl || meetup.creator.photos?.[0]?.url || '',
      },
      recipient: {
        id: meetup.recipient.id,
        name: meetup.recipient.profile?.name || 'User',
        avatar: meetup.recipient.profile?.avatarUrl || meetup.recipient.photos?.[0]?.url || '',
      },
      partner: {
        id: otherUser.id,
        name: otherProfile?.name || 'User',
        avatar: otherProfile?.avatarUrl || otherMainPhoto || '',
      },
      allowedActions,
      createdAt: meetup.createdAt.toISOString(),
      updatedAt: meetup.updatedAt.toISOString(),
    };
  }
}
