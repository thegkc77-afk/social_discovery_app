import { ENV } from '../config/env.js';
import { isSupabaseConfigured, supabase } from '../db/supabase.js';

export interface SmsSendResult {
  delivered: boolean;
  provider: 'supabase' | 'twilio' | 'fast2sms' | 'console';
  reason?: string;
}

export function isSmsConfigured(): boolean {
  const hasTwilio = Boolean(ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN && ENV.TWILIO_PHONE_NUMBER);
  return hasTwilio || Boolean(ENV.FAST2SMS_API_KEY);
}

export async function sendSmsOtp(phone: string, otpCode: string): Promise<SmsSendResult> {
  let supabaseReason: string | undefined;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (!error) {
        console.log(`[SmsService] Verification SMS dispatched via Supabase Auth for ${phone}`);
        return { delivered: true, provider: 'supabase' };
      }
      supabaseReason = error.message;
      console.log('[Supabase OTP Info]', error.message);
    } catch (err: any) {
      supabaseReason = err?.message || String(err);
      console.warn('[Supabase OTP Warn]', supabaseReason);
    }
  }

  if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN && ENV.TWILIO_PHONE_NUMBER) {
    try {
      const credentials = Buffer.from(`${ENV.TWILIO_ACCOUNT_SID}:${ENV.TWILIO_AUTH_TOKEN}`).toString('base64');
      const body = new URLSearchParams({
        To: phone,
        From: ENV.TWILIO_PHONE_NUMBER,
        Body: `Your VibeMatch verification code is ${otpCode}. Valid for 5 minutes.`,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${ENV.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      if (response.ok) {
        console.log(`[SmsService] Verification SMS sent via Twilio to ${phone}`);
        return { delivered: true, provider: 'twilio' };
      }

      const errText = await response.text();
      console.warn(`[SmsService] Twilio error for ${phone}:`, errText);
    } catch (err: any) {
      console.warn(`[SmsService] Twilio request failed for ${phone}:`, err?.message || err);
    }
  }

  if (ENV.FAST2SMS_API_KEY) {
    const digits = phone.replace(/\D/g, '');
    const localNumber = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;

    if (/^[6-9]\d{9}$/.test(localNumber)) {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: ENV.FAST2SMS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otpCode,
            numbers: localNumber,
          }),
        });

        const data = (await response.json()) as { return?: boolean; message?: unknown };
        if (response.ok && data?.return) {
          console.log(`[SmsService] Verification SMS sent via Fast2SMS to ${phone}`);
          return { delivered: true, provider: 'fast2sms' };
        }

        console.warn(`[SmsService] Fast2SMS error for ${phone}:`, data?.message || response.statusText);
      } catch (err: any) {
        console.warn(`[SmsService] Fast2SMS request failed for ${phone}:`, err?.message || err);
      }
    }
  }

  const reason = supabaseReason || 'No SMS provider configured';
  console.log(`\n========================================`);
  console.log(`[OTP SERVICE] SMS NOT DELIVERED (${reason})`);
  console.log(`[OTP SERVICE] Dev verification code for ${phone}: ${otpCode}`);
  console.log(`========================================\n`);

  return { delivered: false, provider: 'console', reason };
}

