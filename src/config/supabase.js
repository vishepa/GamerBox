import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { env } from './env.js';

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  realtime: { transport: ws },
});
