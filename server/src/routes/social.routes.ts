import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/feed', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const posts = db.getFeed(currentUserId);
  return res.json({
    success: true,
    data: { posts },
  });
});

router.post('/posts', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const { caption, mediaUrl } = req.body;

  if (!mediaUrl) {
    return res.status(400).json({ success: false, message: 'mediaUrl required' });
  }

  const postId = db.createPost(req.user.id, caption || '', mediaUrl);
  return res.json({ success: true, postId });
});

router.post('/posts/:id/like', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const postId = req.params.id as string;
  const liked = db.toggleLike(postId, req.user.id);
  return res.json({ success: true, liked });
});

router.get('/stories', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const stories = db.getStories();
  return res.json({
    success: true,
    data: stories,
  });
});

export default router;

