import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { MatchingService } from './matching.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
})
export class MatchingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MatchingGateway.name);
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    @Inject(forwardRef(() => MatchingService))
    private readonly matchingService: MatchingService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`🔌 WebSocket Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.matchingService.cancelTalkNow(userId);
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);
    }
    this.logger.log(`❌ WebSocket Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('talk_now_join')
  async handleTalkNowJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId?: string; topic?: string; maxDistanceKm?: number },
  ) {
    const userId = data.userId || 'me';
    const topic = data.topic || 'Gaming';

    this.userSockets.set(userId, client.id);
    this.socketUsers.set(client.id, userId);

    this.logger.log(`⚡ [Socket] talk_now_join received from user '${userId}' for topic '${topic}'`);

    const result = await this.matchingService.joinTalkNow(userId, topic, client.id, data.maxDistanceKm);

    if (result.status === 'matched') {
      // Direct emit to client
      client.emit('match_found', {
        matchId: result.matchId,
        topic,
        matchedUser: result.partner,
      });
      client.emit('match:found', {
        matchId: result.matchId,
        topic,
        matchedUser: result.partner,
      });
    }

    return result;
  }

  @SubscribeMessage('talk_now_cancel')
  handleTalkNowCancel(@ConnectedSocket() client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.matchingService.cancelTalkNow(userId);
      client.emit('match_cancelled', { userId });
      client.emit('match:cancelled', { userId });
    }
  }

  notifyMatchFound(socketId: string, payload: any) {
    if (this.server) {
      this.server.to(socketId).emit('match_found', payload);
      this.server.to(socketId).emit('match:found', payload);
    }
  }
}
