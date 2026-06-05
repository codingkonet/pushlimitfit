import { supabase } from './supabase';

// Fetch the signed-in user's profile row { is_pro, is_admin, ... }.
// Returns null when sync isn't configured or nobody is signed in.
export async function getMyProfile() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, is_pro, is_admin, pro_since, created_at')
    .eq('id', user.id)
    .maybeSingle();
  if (error) { console.warn('getMyProfile failed:', error.message); return null; }
  return data;
}
