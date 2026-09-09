import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chats/chat.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Create and persist a notification, and emit real-time WebSocket event
   */
  async createNotification(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        data: dto.data || undefined,
      },
    });

    const payload = {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };

    // Broadcast WebSocket notification to recipient's private user room
    if (this.chatGateway?.server) {
      this.chatGateway.server
        .to(`user_${dto.userId}`)
        .emit('notification:new', payload);
      this.chatGateway.server
        .to(`user_${dto.userId}`)
        .emit('notification_received', payload);
      this.chatGateway.server
        .to(`user_${dto.userId}`)
        .emit('notification', payload);
    }

    this.logger.log(`Dispatched notification [${dto.type}] to user ${dto.userId}: ${dto.title}`);
    return payload;
  }

  /**
   * Get paginated notifications for current user
   */
  async getUserNotifications(userId: string, query: QueryNotificationsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        isRead: n.isRead,
        readAt: n.readAt ? n.readAt.toISOString() : null,
        createdAt: n.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID '${notificationId}' not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You cannot modify another user’s notification');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (this.chatGateway?.server) {
      this.chatGateway.server
        .to(`user_${userId}`)
        .emit('notification:read', { id: notificationId, isRead: true });
    }

    return {
      id: updated.id,
      isRead: updated.isRead,
      readAt: updated.readAt?.toISOString(),
    };
  }

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(userId: string) {
    const now = new Date();
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: now,
      },
    });

    if (this.chatGateway?.server) {
      this.chatGateway.server
        .to(`user_${userId}`)
        .emit('notification:all_read', { count: result.count, readAt: now.toISOString() });
    }

    return {
      success: true,
      updatedCount: result.count,
    };
  }

  /**
   * Get unread notification badge count
   */
  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { unreadCount };
  }
}
