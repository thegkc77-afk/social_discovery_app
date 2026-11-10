import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/store.js';
import { sqlite } from '../db/sqlite.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { notifyTalkMatch } from '../socket/index.js';

const router = Router();

router.post('/join', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });

  const userId = req.user.id;
  const { topic = 'General', lat, lng } = req.body;
  const sanitizedTopic = topic.trim() || 'General';

  const matchResult = db.findTalkNowMatch(userId, sanitizedTopic);

  if (matchResult) {
    const candidate = matchResult.candidate;
    const match = db.createMatch(userId, candidate.id, sanitizedTopic);

    if (matchResult.candidateSessionId) {
      sqlite
        .prepare("UPDATE talk_now_sessions SET status = 'matched', matched_at = ? WHERE id = ?")
        .run(new Date().toISOString(), matchResult.candidateSessionId);
    }

    notifyTalkMatch(candidate.id, {
      matchId: match.id,
      userId: req.user.id,
      topic: sanitizedTopic,
    });

    notifyTalkMatch(userId, {
      matchId: match.id,
      userId: candidate.id,
      topic: sanitizedTopic,
    });

    return res.json({
      success: true,
      matched: true,
      match: {
        matchId: match.id,
        userId: candidate.id,
        topic: sanitizedTopic,
      },
    });
  }

  const session = db.createTalkNowSession({
    id: uuidv4(),
    userId,
    topic: sanitizedTopic,
    status: 'searching',
    latitude: lat,
    longitude: lng,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });

  return res.json({
    success: true,
    matched: false,
    data: session,
    message: 'Searching for nearby vibe matches...',
  });
});

router.delete('/leave', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const cancelled = db.cancelTalkNowSession(req.user.id);
  return res.json({ success: true, cancelled });
});

router.get('/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const active = db.getActiveSession(req.user.id);
  return res.json({
    success: true,
    data: active ? { searching: true, session: active } : { searching: false },
  });
});

export default router;
