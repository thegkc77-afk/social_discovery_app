import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or return an existing 1-on-1 direct chat thread between two users
   */
  async createOrGetDirectChat(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot start a chat with yourself');
    }

    // Verify target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        profile: true,
        photos: { where: { isMain: true }, take: 1 },
      },
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Look for existing direct chat with both members
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true,
                photos: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existingChat) {
      return this.formatChatSummary(existingChat, userId);
    }

    // Create new Chat with 2 members
    const newChat = await this.prisma.chat.create({
      data: {
        members: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true,
                photos: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return this.formatChatSummary(newChat, userId);
  }

  /**
   * Retrieve all chat threads for the current user with unread counts and last message previews
   */
  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true,
                photos: { where: { isMain: true }, take: 1 },
                userInterests: { include: { interest: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return Promise.all(chats.map((chat) => this.formatChatSummary(chat, userId)));
  }

  /**
   * Retrieve details and participants of a specific chat
   */
  async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true,
                photos: { where: { isMain: true }, take: 1 },
                userInterests: { include: { interest: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isMember = chat.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    return this.formatChatSummary(chat, userId);
  }

  /**
   * Retrieve paginated message history for a chat
   */
  async getChatMessages(chatId: string, userId: string, query: QueryMessagesDto) {
    await this.verifyMembership(chatId, userId);

    const limit = query.limit || 50;

    let cursorOptions = {};
    if (query.before) {
      const targetMsg = await this.prisma.message.findUnique({
        where: { id: query.before },
      });
      if (targetMsg) {
        cursorOptions = {
          where: {
            chatId,
            createdAt: { lt: targetMsg.createdAt },
          },
        };
      }
    } else {
      cursorOptions = {
        where: { chatId },
      };
    }

    const messages = await this.prisma.message.findMany({
      ...cursorOptions,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });

    return messages.map((msg) => this.formatMessage(msg, userId));
  }

  /**
   * Persist a new message into a chat thread
   */
  async sendMessage(chatId: string, senderId: string, dto: SendMessageDto) {
    await this.verifyMembership(chatId, senderId);

    const message = await this.prisma.$transaction(async (tx) => {
      const newMsg = await tx.message.create({
        data: {
          chatId,
          senderId,
          text: dto.text,
          isInvite: dto.isInvite ?? false,
          inviteDetails: dto.inviteDetails ?? undefined,
        },
        include: {
          sender: {
            include: {
              profile: true,
              photos: { where: { isMain: true }, take: 1 },
            },
          },
        },
      });

      // Update chat's updatedAt timestamp
      await tx.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      // Update sender's lastReadAt so own messages are not counted as unread
      await tx.chatMember.updateMany({
        where: { chatId, userId: senderId },
        data: { lastReadAt: new Date() },
      });

      return newMsg;
    });

    return this.formatMessage(message, senderId);
  }

  /**
   * Mark all unread messages in a chat thread as read for a given user
   */
  async markAsRead(chatId: string, userId: string) {
    await this.verifyMembership(chatId, userId);

    const now = new Date();

    await this.prisma.$transaction([
      // Update user's member lastReadAt
      this.prisma.chatMember.updateMany({
        where: { chatId, userId },
        data: { lastReadAt: now },
      }),
      // Set readAt for all incoming messages
      this.prisma.message.updateMany({
        where: {
          chatId,
          senderId: { not: userId },
          readAt: null,
        },
        data: { readAt: now },
      }),
    ]);

    return {
      success: true,
      chatId,
      userId,
      readAt: now.toISOString(),
    };
  }

  /**
   * Get members of a specific chat (useful for gateway room delivery)
   */
  async getChatMembers(chatId: string) {
    return this.prisma.chatMember.findMany({
      where: { chatId },
      select: { userId: true },
    });
  }

  /**
   * Update user online status
   */
  async setUserOnlineStatus(userId: string, online: boolean) {
    return this.prisma.profile.updateMany({
      where: { userId },
      data: { online },
    });
  }

  /**
   * Helper to verify if user is part of a chat
   */
  private async verifyMembership(chatId: string, userId: string) {
    const member = await this.prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a participant in this chat thread');
    }

    return member;
  }

  /**
   * Format chat entity into client-friendly summary representation
   */
  private async formatChatSummary(chat: any, currentUserId: string) {
    const currentMember = chat.members.find((m: any) => m.userId === currentUserId);
    const otherMember = chat.members.find((m: any) => m.userId !== currentUserId);

    const lastMsg = chat.messages?.[0] || null;

    // Count unread messages (messages sent after user's lastReadAt and not sent by user)
    const unreadCount = await this.prisma.message.count({
      where: {
        chatId: chat.id,
        senderId: { not: currentUserId },
        createdAt: {
          gt: currentMember?.lastReadAt || new Date(0),
        },
      },
    });

    const otherProfile = otherMember?.user?.profile;
    const otherMainPhoto = otherMember?.user?.photos?.[0]?.url;
    const otherInterests = otherMember?.user?.userInterests?.map((ui: any) => ui.interest.name) || [];

    return {
      id: chat.id,
      recipient: otherMember?.user
        ? {
            id: otherMember.user.id,
            name: otherProfile?.name || 'User',
            avatar: otherProfile?.avatarUrl || otherMainPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
            online: otherProfile?.online ?? false,
            bio: otherProfile?.bio || '',
            location: otherProfile?.locationName || 'Nearby',
            vibes: otherInterests,
          }
        : null,
      lastMessage: lastMsg ? this.formatMessage(lastMsg, currentUserId) : null,
      unreadCount,
      updatedAt: chat.updatedAt.toISOString(),
      createdAt: chat.createdAt.toISOString(),
    };
  }

  /**
   * Format message entity matching frontend expectations
   */
  private formatMessage(msg: any, currentUserId: string) {
    const isMe = msg.senderId === currentUserId;
    const date = new Date(msg.createdAt);
    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      id: msg.id,
      chatId: msg.chatId,
      senderId: msg.senderId,
      sender: isMe ? 'me' : 'them',
      text: msg.text,
      isInvite: msg.isInvite,
      inviteDetails: msg.inviteDetails,
      readAt: msg.readAt ? msg.readAt.toISOString() : null,
      time: timeFormatted,
      createdAt: msg.createdAt.toISOString(),
    };
  }
}
