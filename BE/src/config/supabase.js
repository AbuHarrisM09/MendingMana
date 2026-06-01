const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined in your environment variables.');
}

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

module.exports = supabase;
