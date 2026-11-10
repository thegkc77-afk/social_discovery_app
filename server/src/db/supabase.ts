import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env.js';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    ENV.SUPABASE_URL &&
      ENV.SUPABASE_SERVICE_ROLE_KEY &&
      !ENV.SUPABASE_URL.includes('your-project') &&
      !ENV.SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role')
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

