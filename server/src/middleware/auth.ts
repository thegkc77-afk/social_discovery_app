import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { db, User } from '../db/store.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    const user = db.findUserById(payload.userId);
    if (!user || user.accountStatus !== 'active') {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function verifySocketToken(token: string): User | null {
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    const user = db.findUserById(payload.userId);
    return user && user.accountStatus === 'active' ? user : null;
  } catch {
    return null;
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, ENV.JWT_SECRET, { expiresIn: '30d' });
}

