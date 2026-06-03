import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sync is optional: if the project isn't configured, the app runs fully
// offline (guest mode) and every cloud call below becomes a safe no-op.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

// Pull the user's full data document from the cloud.
// Returns the stored bundle object, or null if there's no row yet.
export async function pullCloudData(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

// Upsert the user's full data document to the cloud.
export async function pushCloudData(userId, bundle) {
  if (!supabase) return;
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: userId, data: bundle }, { onConflict: 'user_id' });
  if (error) throw error;
}
