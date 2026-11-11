import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { db, User } from '../db/store.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function resolveUserFromToken(token: string): User | null {
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    const user = db.findUserById(payload.userId);
    return user && user.accountStatus === 'active' ? user : null;
  } catch {
    return null;
  }
}

export function getOptionalAuthUser(req: Request): User | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return resolveUserFromToken(header.split(' ')[1]);
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const user = resolveUserFromToken(header.split(' ')[1]);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  req.user = user;
  next();
}

export function verifySocketToken(token: string): User | null {
  return resolveUserFromToken(token);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, ENV.JWT_SECRET, { expiresIn: '30d' });
}

export function generate2FATempToken(userId: string): string {
  return jwt.sign({ userId, is2FA: true }, ENV.JWT_SECRET, { expiresIn: '10m' });
}

export function verify2FATempToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string; is2FA?: boolean };
    if (!payload || !payload.is2FA || !payload.userId) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

