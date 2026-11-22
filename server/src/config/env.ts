import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '../..');

const candidatePaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(serverRoot, '.env.local'),
  path.resolve(serverRoot, '.env'),
];

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, override: false });
  }
}

const clientOrigin = (() => {
  const origin = process.env.CLIENT_ORIGIN || '*';
  if (process.env.NODE_ENV === 'production') {
    if (origin === '*') {
      throw new Error('CLIENT_ORIGIN must be set to the app origin in production; wildcard CORS with credentials is not allowed');
    }
    if (!origin.startsWith('https://')) {
      console.warn('[ENV] CLIENT_ORIGIN is not HTTPS. Terminate TLS in front of the server in production.');
    }
  }
  return origin;
})();

const jwtSecret = (() => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('[ENV] JWT_SECRET is not set; using a random development secret. Set JWT_SECRET in .env to keep sessions valid across restarts.');
  return crypto.randomBytes(32).toString('hex');
})();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: jwtSecret,
  CLIENT_ORIGIN: clientOrigin,
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY || '',
};
