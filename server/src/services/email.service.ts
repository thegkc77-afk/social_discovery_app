import nodemailer, { Transporter } from 'nodemailer';
import { isSupabaseConfigured, supabase } from '../db/supabase.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  return transporter;
}

export async function sendWelcomeEmail(toEmail: string, displayName: string): Promise<boolean> {
  const cleanEmail = toEmail.trim().toLowerCase();
  const name = displayName.trim() || 'User';

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
  <p>Dear ${name},</p>
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

  try {
    const transport = getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"VibeMatch" <no-reply@vibematch.local>';

    const info = await transport.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[EmailService] Welcome email sent to ${cleanEmail}`);
    if (info.message) {
      console.log(`[EmailService] Preview output generated for ${cleanEmail}`);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('email', cleanEmail);
      } catch {}
    }

    return true;
  } catch (error: any) {
    console.warn(`[EmailService] Could not send welcome email to ${cleanEmail}:`, error?.message || error);
    return false;
  }
}
