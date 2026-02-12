
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL ERROR: Supabase keys are missing! Check your .env file or Vercel Environment Variables.');
    throw new Error('Supabase configuration is missing. Please contact support.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
