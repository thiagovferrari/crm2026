
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bctfvcevyfqcaoejumtu.supabase.co';
const supabaseAnonKey = 'sb_publishable_xtlyD-BDI426kET5Y5iDGQ_220eEg_9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
