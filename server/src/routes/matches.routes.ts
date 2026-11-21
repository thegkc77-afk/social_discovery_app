import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/store.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const userId = req.user.id;

  const matches = db.getMatchesForUser(userId);
  const conversations = matches.map((m) => {
    const otherId = m.userAId === userId ? m.userBId : m.userAId;
    const otherUser = db.findUserById(otherId);
    const lastMsg = db.getLastMessageForMatch(m.id);

    return {
      id: m.id,
      matchId: m.id,
      otherUser: {
        id: otherId,
        name: otherUser?.name || 'VibeMatch User',
        avatar: otherUser?.photos[0] || otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
      },
      lastMessage: lastMsg ? lastMsg.content : `Connected via Talk Now (${m.topic})`,
      lastMessageTime: lastMsg
        ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
      updatedAt: lastMsg ? lastMsg.createdAt : m.createdAt,
    };
  });

  return res.json({
    success: true,
    data: conversations,
  });
});

router.get('/:id/messages', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const matchId = req.params.id as string;
  const limit = parseInt((req.query.limit as string) || '50', 10);

  const messages = db.getMessagesForMatch(matchId, limit).map((m) => ({
    _id: m.id,
    id: m.id,
    matchId: m.matchId,
    senderId: m.senderId,
    content: m.content,
    createdAt: m.createdAt,
  }));

  return res.json({
    success: true,
    data: messages,
  });
});

router.patch('/:id/end', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const matchId = req.params.id as string;
  const ended = db.endMatch(matchId);
  return res.json({ success: ended });
});

router.post('/:id/block', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const matchId = req.params.id as string;
  const match = db.findMatchById(matchId);

  if (match) {
    const otherId = match.userAId === req.user.id ? match.userBId : match.userAId;
    db.blockUser(req.user.id, otherId);
    db.endMatch(matchId);
  }

  return res.json({ success: true, message: 'User blocked' });
});

router.post('/:id/invite', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const matchId = req.params.id as string;
  const { recipientId, place, date, time, note } = req.body;

  const proposal = db.createMeetProposal({
    id: uuidv4(),
    matchId,
    proposedBy: req.user.id,
    recipientId: recipientId || 'recipient',
    place: place || 'Local Cafe',
    date: date || 'Tomorrow',
    time: time || '5:00 PM',
    note: note || '',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  });

  const inviteText = `📍 Meetup Invite: ${proposal.place} on ${proposal.date} at ${proposal.time}`;
  db.createMessage(matchId, req.user.id, inviteText);

  return res.json({
    success: true,
    data: proposal,
  });
});

export default router;

