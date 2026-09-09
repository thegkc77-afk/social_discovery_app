import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Map of userId -> Set of active socket IDs
  private readonly userSockets = new Map<string, Set<string>>();
  // Map of socketId -> userId
  private readonly socketToUser = new Map<string, string>();

  constructor(private readonly chatsService: ChatsService) {}

  handleConnection(client: Socket) {
    const userId =
      (client.handshake.query.userId as string) ||
      (client.handshake.auth?.userId as string);

    if (userId) {
      this.registerUserSocket(userId, client);
    }

    this.logger.log(`Socket connected: ${client.id} (user: ${userId || 'anonymous'})`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);

    if (userId) {
      this.socketToUser.delete(client.id);
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          // Mark user offline in database & notify followers / chats
          this.chatsService.setUserOnlineStatus(userId, false).catch((err) => {
            this.logger.warn(`Failed to set user ${userId} offline: ${err.message}`);
          });

          this.server.emit('user_status', { userId, online: false });
          this.server.emit('user:status', { userId, online: false });
          this.logger.log(`User ${userId} went offline`);
        }
      }
    }

    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  /**
   * Explicit user registration upon client connection/login
   */
  @SubscribeMessage('user:register')
  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      this.registerUserSocket(data.userId, client);
      return { status: 'registered', userId: data.userId };
    }
  }

  /**
   * Join a specific chat room to listen for live messages
   */
  @SubscribeMessage('chat:join')
  @SubscribeMessage('join_chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!data?.chatId) return;
    const roomName = `chat_${data.chatId}`;
    client.join(roomName);
    this.logger.log(`Socket ${client.id} joined room ${roomName}`);
    return { status: 'joined', room: roomName };
  }

  /**
   * Leave a chat room
   */
  @SubscribeMessage('chat:leave')
  @SubscribeMessage('leave_chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!data?.chatId) return;
    const roomName = `chat_${data.chatId}`;
    client.leave(roomName);
    this.logger.log(`Socket ${client.id} left room ${roomName}`);
    return { status: 'left', room: roomName };
  }

  /**
   * Real-time message dispatching with database persistence
   */
  @SubscribeMessage('message_send')
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      chatId?: string;
      senderId?: string;
      receiverId?: string;
      text?: string;
      message?: string; // Support stringified JSON or plain text
      isInvite?: boolean;
      inviteDetails?: any;
    },
  ) {
    try {
      const senderId =
        data.senderId ||
        this.socketToUser.get(client.id) ||
        (client.handshake.query.userId as string);

      if (!senderId) {
        return { error: 'Sender identity could not be verified' };
      }

      // Parse payload text/isInvite if payload is in stringified format
      let text = data.text || '';
      let isInvite = data.isInvite ?? false;
      let inviteDetails = data.inviteDetails;

      if (data.message && !data.text) {
        try {
          const parsed = JSON.parse(data.message);
          text = parsed.text || data.message;
          isInvite = parsed.isInvite ?? false;
          inviteDetails = parsed.inviteDetails;
        } catch {
          text = data.message;
        }
      }

      let chatId = data.chatId;

      // If no chatId provided but receiverId is provided, resolve direct chat
      if (!chatId && data.receiverId) {
        const chatSummary = await this.chatsService.createOrGetDirectChat(
          senderId,
          data.receiverId,
        );
        chatId = chatSummary.id;
      }

      if (!chatId) {
        return { error: 'Chat ID or receiverId is required' };
      }

      // Persist to database
      const savedMsg = await this.chatsService.sendMessage(chatId, senderId, {
        text,
        isInvite,
        inviteDetails,
      });

      const messagePayload = {
        chatId,
        senderId,
        receiverId: data.receiverId,
        message: JSON.stringify({
          id: savedMsg.id,
          text: savedMsg.text,
          isInvite: savedMsg.isInvite,
          inviteDetails: savedMsg.inviteDetails,
          time: savedMsg.time,
        }),
        data: savedMsg,
      };

      // Broadcast to all participants in chat room
      this.server.to(`chat_${chatId}`).emit('message_receive', messagePayload);
      this.server.to(`chat_${chatId}`).emit('message:new', savedMsg);

      // If receiver is registered in personal user room, also notify directly
      if (data.receiverId) {
        this.server
          .to(`user_${data.receiverId}`)
          .emit('message_receive', messagePayload);
        this.server.to(`user_${data.receiverId}`).emit('message:new', savedMsg);
      }

      return { status: 'sent', message: savedMsg };
    } catch (err) {
      this.logger.error(`Failed to handle message_send: ${err.message}`);
      return { error: err.message };
    }
  }

  /**
   * Real-time typing indicators
   */
  @SubscribeMessage('typing:start')
  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; userId?: string },
  ) {
    const userId = data?.userId || this.socketToUser.get(client.id);
    if (data?.chatId && userId) {
      client.to(`chat_${data.chatId}`).emit('typing_status', {
        chatId: data.chatId,
        userId,
        isTyping: true,
      });
      client.to(`chat_${data.chatId}`).emit('typing:status', {
        chatId: data.chatId,
        userId,
        isTyping: true,
      });
    }
  }

  @SubscribeMessage('typing:stop')
  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; userId?: string },
  ) {
    const userId = data?.userId || this.socketToUser.get(client.id);
    if (data?.chatId && userId) {
      client.to(`chat_${data.chatId}`).emit('typing_status', {
        chatId: data.chatId,
        userId,
        isTyping: false,
      });
      client.to(`chat_${data.chatId}`).emit('typing:status', {
        chatId: data.chatId,
        userId,
        isTyping: false,
      });
    }
  }

  /**
   * Real-time read receipt notifications
   */
  @SubscribeMessage('message:read')
  @SubscribeMessage('message_read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; userId?: string },
  ) {
    const userId = data?.userId || this.socketToUser.get(client.id);
    if (data?.chatId && userId) {
      try {
        const result = await this.chatsService.markAsRead(data.chatId, userId);
        this.server.to(`chat_${data.chatId}`).emit('messages_read', result);
        this.server.to(`chat_${data.chatId}`).emit('message:read', result);
        return result;
      } catch (err) {
        this.logger.warn(`Failed to mark read: ${err.message}`);
      }
    }
  }

  /**
   * Helper to register socket to user
   */
  private registerUserSocket(userId: string, client: Socket) {
    this.socketToUser.set(client.id, userId);

    let sockets = this.userSockets.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.userSockets.set(userId, sockets);
      // Mark online in database & broadcast status
      this.chatsService.setUserOnlineStatus(userId, true).catch((err) => {
        this.logger.warn(`Failed to set user ${userId} online: ${err.message}`);
      });
      this.server.emit('user_status', { userId, online: true });
      this.server.emit('user:status', { userId, online: true });
      this.logger.log(`User ${userId} is now online`);
    }
    sockets.add(client.id);

    // Join user-specific notification room
    client.join(`user_${userId}`);
  }
}
