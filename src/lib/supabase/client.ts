import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return false;
  if (
    url.includes('tu-proyecto.supabase.co') ||
    url.includes('placeholder.supabase.co') ||
    key.endsWith('...') ||
    key === 'placeholder-anon-key'
  ) {
    return false;
  }
  return true;
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
