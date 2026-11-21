import nodemailer, { Transporter } from 'nodemailer';
import { ENV } from '../config/env.js';
import { isSupabaseConfigured, supabase } from '../db/supabase.js';

export interface EmailSendResult {
  sent: boolean;
  provider: 'resend' | 'smtp' | 'none';
  reason?: string;
}

let transporter: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(ENV.RESEND_API_KEY || (ENV.SMTP_USER && ENV.SMTP_PASS));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getSmtpTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!ENV.SMTP_USER || !ENV.SMTP_PASS) return null;

  const isGmail = ENV.SMTP_USER.toLowerCase().includes('@gmail.com');
  const host = ENV.SMTP_HOST || (isGmail ? 'smtp.gmail.com' : '');
  if (!host) return null;

  const port = process.env.SMTP_PORT ? ENV.SMTP_PORT : (host === 'smtp.gmail.com' ? 465 : 587);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendWelcomeEmail(toEmail: string, displayName?: string): Promise<EmailSendResult> {
  const cleanEmail = toEmail?.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { sent: false, provider: 'none', reason: 'Invalid email address' };
  }

  const name = displayName?.trim() || 'User';
  const safeHtmlName = escapeHtml(name);
  const subject = 'Welcome to VibeMatch';

  const textBody = `Dear ${name},

Thank you for creating your account with VibeMatch.

Your registration has been successfully processed. You can now log in, complete your profile, set your discovery preferences, and connect with people who share your interests.

Security notice: If you did not create this account, please contact our support department immediately.

Best regards,
The VibeMatch Team`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to VibeMatch</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222222; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-bottom: 2px solid #e11d48; padding-bottom: 12px; margin-bottom: 24px;">
    <h2 style="color: #e11d48; margin: 0;">VibeMatch</h2>
  </div>
  <p>Dear ${safeHtmlName},</p>
  <p>Thank you for creating your account with VibeMatch.</p>
  <p>Your registration has been successfully processed. You can now log in, complete your profile, set your discovery preferences, and connect with people who share your interests.</p>
  <div style="background-color: #f8fafc; border-left: 4px solid #e11d48; padding: 12px 16px; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px; color: #475569;">
      Security Notice: If you did not create this account, please contact our support department immediately.
    </p>
  </div>
  <p>Best regards,<br>The VibeMatch Team</p>
</body>
</html>`;

  const syncTimestamp = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('email', cleanEmail);
      } catch {}
    }
  };

  if (ENV.RESEND_API_KEY) {
    try {
      const fromAddress = ENV.SMTP_FROM || 'VibeMatch <onboarding@resend.dev>';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ENV.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [cleanEmail],
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[EmailService] Resend failed for ${cleanEmail}:`, errText);
        return { sent: false, provider: 'resend', reason: errText };
      }

      console.log(`[EmailService] Welcome email sent via Resend to ${cleanEmail}`);
      await syncTimestamp();
      return { sent: true, provider: 'resend' };
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.warn(`[EmailService] Resend error for ${cleanEmail}:`, msg);
      return { sent: false, provider: 'resend', reason: msg };
    }
  }

  const smtpTransport = getSmtpTransporter();
  if (smtpTransport) {
    try {
      const fromAddress = ENV.SMTP_FROM || `"VibeMatch" <${ENV.SMTP_USER}>`;
      await smtpTransport.sendMail({
        from: fromAddress,
        to: cleanEmail,
        subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[EmailService] Welcome email sent via SMTP to ${cleanEmail}`);
      await syncTimestamp();
      return { sent: true, provider: 'smtp' };
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.warn(`[EmailService] SMTP error for ${cleanEmail}:`, msg);
      return { sent: false, provider: 'smtp', reason: msg };
    }
  }

  console.warn(
    `[EmailService] Skipped welcome email to ${cleanEmail}: configure SMTP_USER/SMTP_PASS (or RESEND_API_KEY) in server/.env.local`
  );
  return { sent: false, provider: 'none', reason: 'Email provider not configured' };
}
