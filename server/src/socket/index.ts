import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifySocketToken } from '../middleware/auth.js';
import { db } from '../db/store.js';

let ioInstance: SocketIOServer | null = null;
const userSockets = new Map<string, string[]>();

export function initSocketIO(server: HTTPServer, _corsOrigin: string) {
  ioInstance = new SocketIOServer(server, {
    cors: {
      origin: (_origin, callback) => callback(null, true),
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
  });

  ioInstance.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn('[Socket] Connection rejected: No token provided');
      return next(new Error('Authentication token required'));
    }

    const user = verifySocketToken(token);
    if (!user) {
      console.warn('[Socket] Connection rejected: Invalid or expired token');
      return next(new Error('Invalid token'));
    }

    (socket as any).user = user;
    next();
  });

  ioInstance.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    const userId = user.id;

    const existing = userSockets.get(userId) || [];
    userSockets.set(userId, [...existing, socket.id]);

    socket.on('chat:join', ({ matchId }: { matchId: string }) => {
      if (matchId) socket.join(`match:${matchId}`);
    });

    socket.on(
      'chat:send_message',
      ({ matchId, receiverId, content }: { matchId: string; receiverId?: string; content: string }) => {
        if (!content || !content.trim()) return;

        let targetMatchId = matchId;
        if (!targetMatchId && receiverId) {
          const match = db.createMatch(userId, receiverId, 'General');
          targetMatchId = match.id;
        }

        const msg = db.createMessage(targetMatchId, userId, content.trim());
        const payload = {
          _id: msg.id,
          id: msg.id,
          matchId: targetMatchId,
          senderId: userId,
          content: msg.content,
          createdAt: msg.createdAt,
        };

        ioInstance?.to(`match:${targetMatchId}`).emit('chat:receive_message', payload);

        if (receiverId) {
          const recipientSockets = userSockets.get(receiverId) || [];
          recipientSockets.forEach((sId) => {
            ioInstance?.to(sId).emit('chat:receive_message', payload);
          });
        }
      }
    );

    socket.on('disconnect', () => {
      const current = userSockets.get(userId) || [];
      const filtered = current.filter((id) => id !== socket.id);
      if (filtered.length > 0) userSockets.set(userId, filtered);
      else userSockets.delete(userId);
    });
  });

  return ioInstance;
}

export function notifyTalkMatch(
  userId: string,
  matchData: { matchId: string; userId: string; topic: string; name?: string; avatar?: string }
) {
  if (!ioInstance) return;
  const sockets = userSockets.get(userId) || [];
  sockets.forEach((sId) => {
    ioInstance?.to(sId).emit('talk:matched', matchData);
  });
}
