import 'dotenv/config';

export const env = {
  port: process.env.PORT || 3000,
  steamApiKey: process.env.STEAM_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
