import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });

  const fresh = db.findUserById(req.user.id);
  if (!fresh) return res.status(404).json({ success: false, message: 'User not found' });

  const { passwordHash, ...safe } = fresh;
  return res.json({
    success: true,
    data: safe,
  });
});

router.put('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });

  const { name, dateOfBirth, gender, bio, occupation, education, relationshipGoal, avatar, photos } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(name && { name: name.trim() }),
    ...(dateOfBirth && { dateOfBirth }),
    ...(gender && { gender }),
    ...(bio !== undefined && { bio }),
    ...(occupation !== undefined && { occupation }),
    ...(education !== undefined && { education }),
    ...(relationshipGoal !== undefined && { relationshipGoal }),
    ...(avatar && { avatar }),
    ...(Array.isArray(photos) && { photos }),
  });

  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  const { passwordHash, ...safe } = updated;
  return res.json({ success: true, data: safe });
});

router.put('/photos', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const { photos } = req.body;

  if (!Array.isArray(photos)) {
    return res.status(400).json({ success: false, message: 'Photos must be an array' });
  }

  db.setUserPhotos(req.user.id, photos);
  const updated = db.findUserById(req.user.id);
  return res.json({ success: true, data: updated?.photos || [] });
});

router.put('/location', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const { locationName, latitude, longitude } = req.body;

  if (!locationName) {
    return res.status(400).json({ success: false, message: 'locationName required' });
  }

  db.setUserLocation(req.user.id, locationName, latitude, longitude);
  const updated = db.findUserById(req.user.id);
  return res.json({ success: true, data: updated?.location });
});

router.put('/interests', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const { interests } = req.body;

  if (!Array.isArray(interests)) {
    return res.status(400).json({ success: false, message: 'Interests must be an array' });
  }

  db.setUserInterests(req.user.id, interests);
  const updated = db.findUserById(req.user.id);
  return res.json({ success: true, data: updated?.interests || [] });
});

router.put('/intent', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const { intents } = req.body;

  if (!Array.isArray(intents)) {
    return res.status(400).json({ success: false, message: 'Intents must be an array' });
  }

  db.setUserIntents(req.user.id, intents);
  const updated = db.findUserById(req.user.id);
  return res.json({ success: true, data: updated?.intents || [] });
});

router.post('/verify', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const updated = db.updateUser(req.user.id, { isVerified: true });
  return res.json({ success: true, verified: true, user: updated });
});

router.get('/verification-status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const fresh = db.findUserById(req.user.id);
  const isVerified = Boolean(fresh?.isVerified);
  return res.json({
    success: true,
    status: isVerified ? 'VERIFIED' : 'PENDING',
    verified: isVerified,
    message: isVerified ? 'Profile verified successfully.' : 'Verification in progress.',
  });
});

router.get('/completion', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const u = db.findUserById(req.user.id) || req.user;
  const hasPhotos = u.photos && u.photos.length >= 2;
  const hasInterests = u.interests && u.interests.length > 0;
  const completed = Boolean(u.name && u.dateOfBirth && hasPhotos && hasInterests);

  return res.json({
    success: true,
    completed,
    photoCount: u.photos?.length || (u.avatar ? 1 : 0),
  });
});

export default router;
