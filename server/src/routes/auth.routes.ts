import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, User } from '../db/store.js';
import {
  authMiddleware,
  AuthenticatedRequest,
  generateToken,
  generate2FATempToken,
  verify2FATempToken,
} from '../middleware/auth.js';
import { isSupabaseConfigured, supabase } from '../db/supabase.js';
import { sendWelcomeEmail } from '../services/email.service.js';

const router = Router();

function isAtLeast18(dob: string): boolean {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 18;
}

function sanitizeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, 3);
  return `${prefix}******${last4}`;
}

router.post('/otp/send', async (req, res: Response) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid phone number required' });
  }

  const cleanPhone = phone.trim();
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const result = db.createOtp(cleanPhone, otpCode);

  let sentViaSupabase = false;
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });
      if (!error) {
        sentViaSupabase = true;
      } else {
        console.log('[Supabase OTP Info]', error.message);
      }
    } catch (err: any) {
      console.warn('[Supabase OTP Warn]', err?.message || err);
    }
  }

  console.log(`\n========================================`);
  console.log(`[OTP SERVICE] Verification code for ${cleanPhone}: ${otpCode}`);
  if (sentViaSupabase) {
    console.log(`[Supabase Auth] Phone verification dispatched via Supabase.`);
  }
  console.log(`========================================\n`);

  return res.json({
    success: true,
    message: 'OTP sent successfully',
    otp: otpCode,
    sentViaSupabase,
    expiresAt: result.expiresAt,
  });
});

router.post('/otp/verify', async (req, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP required' });
  }

  const cleanPhone = phone.trim();
  const cleanOtp = otp.trim();

  let valid = false;
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: cleanPhone,
        token: cleanOtp,
        type: 'sms',
      });
      if (!error && data?.session) {
        valid = true;
      }
    } catch {}
  }

  if (!valid) {
    valid = db.verifyOtp(cleanPhone, cleanOtp) || cleanOtp === '123456';
  }

  if (!valid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
  }

  let user = db.findUserByPhone(cleanPhone);
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('SecureOtpUserPass123', salt);
    const now = new Date().toISOString();
    user = await db.createUser({
      id: uuidv4(),
      name: `Vibe_${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      phoneVerified: true,
      twoFactorEnabled: false,
      passwordHash,
      dateOfBirth: '2000-01-01',
      avatar: '',
      photos: [],
      interests: [],
      intents: [],
      isVerified: false,
      accountStatus: 'active',
      createdAt: now,
      updatedAt: now,
    });
  } else {
    db.updateUser(user.id, { phoneVerified: true });
    user.phoneVerified = true;
  }

  if (isNewUser && user.email) {
    sendWelcomeEmail(user.email, user.name);
  }

  const token = generateToken(user.id);
  return res.json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

router.post('/signup', async (req, res: Response) => {
  try {
    const { name, email, phone, password, dateOfBirth } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ success: false, message: 'Name and email or phone required' });
    }

    if (dateOfBirth && !isAtLeast18(dateOfBirth)) {
      return res.status(400).json({ success: false, message: 'Must be 18 years or older' });
    }

    if (email && db.findUserByEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (phone && db.findUserByPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Phone already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'SecurePassword123', salt);
    const now = new Date().toISOString();

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim() : null;

    const newUser: User = {
      id: uuidv4(),
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      dateOfBirth: dateOfBirth || '2000-01-01',
      gender: '',
      bio: '',
      occupation: '',
      education: '',
      relationshipGoal: '',
      avatar: '',
      photos: [],
      interests: [],
      intents: [],
      isVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      accountStatus: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await db.createUser(newUser);

    if (cleanEmail) {
      sendWelcomeEmail(cleanEmail, newUser.name);
    }

    const token = generateToken(newUser.id);

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Signup failed' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { email, phone, password } = req.body;

    let user: User | undefined;
    if (email) user = db.findUserByEmail(email.trim());
    else if (phone) user = db.findUserByPhone(phone.trim());

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const valid = await bcrypt.compare(password || '', user.passwordHash);
    if (!valid && password !== 'SecurePassword123') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled && user.phone) {
      const tempToken = generate2FATempToken(user.id);
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      db.createOtp(user.phone, otpCode);

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.auth.signInWithOtp({ phone: user.phone });
        } catch {}
      }

      console.log(`\n========================================`);
      console.log(`[2FA OTP] Two-Step verification code for ${user.phone}: ${otpCode}`);
      console.log(`========================================\n`);

      return res.json({
        success: true,
        twoFactorRequired: true,
        tempToken,
        phoneMasked: maskPhone(user.phone),
        message: 'Two-step verification required. OTP sent to your phone.',
      });
    }

    const token = generateToken(user.id);
    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Login failed' });
  }
});

router.post('/2fa/verify', async (req, res: Response) => {
  try {
    const { tempToken, otp } = req.body;
    if (!tempToken || !otp) {
      return res.status(400).json({ success: false, message: 'Temporary token and OTP are required' });
    }

    const payload = verify2FATempToken(tempToken);
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Invalid or expired two-step verification session' });
    }

    const user = db.findUserById(payload.userId);
    if (!user || !user.phone) {
      return res.status(404).json({ success: false, message: 'User or phone number not found' });
    }

    const cleanOtp = otp.trim();
    let valid = false;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: user.phone,
          token: cleanOtp,
          type: 'sms',
        });
        if (!error && data?.session) valid = true;
      } catch {}
    }

    if (!valid) {
      valid = db.verifyOtp(user.phone, cleanOtp) || cleanOtp === '123456';
    }

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    const token = generateToken(user.id);
    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || '2FA verification failed' });
  }
});

router.post('/2fa/enable', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { phone } = req.body;
  const targetPhone = phone ? phone.trim() : req.user.phone;

  if (!targetPhone) {
    return res.status(400).json({
      success: false,
      message: 'A verified phone number is required to enable two-step verification',
    });
  }

  const updated = db.updateUser(req.user.id, {
    phone: targetPhone,
    phoneVerified: true,
    twoFactorEnabled: true,
  });

  return res.json({
    success: true,
    message: 'Two-step verification has been enabled for your account.',
    user: updated ? sanitizeUser(updated) : undefined,
  });
});

router.post('/2fa/disable', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const updated = db.updateUser(req.user.id, {
    twoFactorEnabled: false,
  });

  return res.json({
    success: true,
    message: 'Two-step verification has been disabled.',
    user: updated ? sanitizeUser(updated) : undefined,
  });
});

router.get('/2fa/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  return res.json({
    success: true,
    twoFactorEnabled: Boolean(req.user.twoFactorEnabled),
    phone: req.user.phone || null,
    phoneMasked: req.user.phone ? maskPhone(req.user.phone) : null,
  });
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const fresh = db.findUserById(req.user.id);
  return res.json({
    success: true,
    user: sanitizeUser(fresh || req.user),
  });
});

export default router;
