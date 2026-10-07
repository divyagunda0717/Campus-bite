import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wfaxdtfoyrokfjddhivw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmYXhkdGZveXJva2ZqZGRoaXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzI1OTEsImV4cCI6MjEwNjk0ODU5MX0.fYs6RDmZB-TnEZ1BIvIQNgAqoXC9AIhIo_q67agifJE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
