import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { initSocketIO } from './socket/index.js';

import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import usersRoutes from './routes/users.routes.js';
import talkNowRoutes from './routes/talkNow.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import socialRoutes from './routes/social.routes.js';

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ENV.CLIENT_ORIGIN === '*' ? true : ENV.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

initSocketIO(server, ENV.CLIENT_ORIGIN);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', database: 'sqlite', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', catalogRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/talk-now', talkNowRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/social', socialRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ServerError]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

import { isSupabaseConfigured, supabase } from './db/supabase.js';
import { isEmailConfigured } from './services/email.service.js';
import { isSmsConfigured } from './services/sms.service.js';

server.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`🚀 VibeMatch Server running on http://0.0.0.0:${ENV.PORT}`);

  if (isEmailConfigured()) {
    console.log('✅ [EmailService] Welcome email delivery configured.');
  } else {
    console.log('⚠️  [EmailService] SMTP / Resend not configured. Set SMTP_USER/SMTP_PASS or RESEND_API_KEY in server/.env.local to send welcome emails.');
  }

  let directSmsReady = isSmsConfigured();
  if (directSmsReady) {
    console.log('✅ [SmsService] Direct SMS OTP provider configured.');
  }

  if (isSupabaseConfigured() && supabase) {
    console.log(`📡 Connected to Supabase at: ${ENV.SUPABASE_URL}`);
    supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        if (error && error.code === 'PGRST205') {
          console.log('⚡ [Supabase Notice] Tables not created yet in Supabase schema.');
          console.log('👉 Run "server/supabase/migrations/20261110_init.sql" in your Supabase SQL Editor.');
        } else if (!error) {
          console.log('✅ [Supabase] Connected and database schema verified.');
        }
      });

    fetch(`${ENV.SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: ENV.SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(4000),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((settings: any) => {
        const phoneEnabled = Boolean(settings?.external?.phone);
        if (phoneEnabled) {
          console.log('✅ [Supabase Auth] Phone SMS provider enabled.');
        } else if (!directSmsReady) {
          console.log('⚠️  [SmsService] Supabase Phone Auth is disabled and no Twilio/Fast2SMS keys are set. Enable Phone Auth in Supabase Dashboard or add TWILIO_*/FAST2SMS_API_KEY in server/.env.local.');
        }
      })
      .catch(() => {
        if (!directSmsReady) {
          console.log('⚠️  [SmsService] No Twilio/Fast2SMS keys set; SMS OTP relies on Supabase Phone Auth.');
        }
      });
  } else if (!directSmsReady) {
    console.log('⚠️  [SmsService] No SMS provider configured. OTP codes will only print in server logs.');
  }
});
