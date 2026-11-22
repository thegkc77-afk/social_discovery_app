import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { isUserOnline } from '../socket/index.js';

const router = Router();

function calculateAge(dob?: string | null): number {
  if (!dob) return 23;
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 18 ? 23 : age;
}

router.get('/discovery', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const users = db.getAllActiveUsers(currentUserId);

  const formatted = users.map((u) => ({
    id: u.id,
    name: u.name,
    age: calculateAge(u.dateOfBirth),
    avatar: u.photos[0] || u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    detailImage: u.photos[1] || u.photos[0] || u.avatar,
    distance: null,
    location: u.location?.name || null,
    online: isUserOnline(u.id),
    vibes: u.interests,
    bio: u.bio || '',
    likes: 0,
    commentsCount: 0,
    hasLiked: false,
    verificationStatus: u.isVerified ? 'verified' : 'not_started',
    verified: u.isVerified,
    isAvailable: db.hasActiveTalkNowSession(u.id),
    messages: [],
  }));

  return res.json({
    success: true,
    data: formatted,
  });
});

export default router;
