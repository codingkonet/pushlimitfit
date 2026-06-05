import { supabase } from './supabase';

// All calls below are guarded server-side by Row Level Security: only a user
// whose profile has is_admin = true can read every row or write Pro flags.
// A non-admin simply gets their own row / empty results / a permission error.

// ── Users ────────────────────────────────────────────────────────────
export async function listUsers() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, is_pro, is_admin, pro_since, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setUserPro(userId, isPro) {
  if (!supabase) throw new Error('Not configured');
  const patch = isPro
    ? { is_pro: true, pro_since: new Date().toISOString() }
    : { is_pro: false, pro_since: null };
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

// ── Payments ─────────────────────────────────────────────────────────
export async function listPayments() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('payments')
    .select('id, email, provider, order_id, amount, currency, status, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Custom foods (content) ───────────────────────────────────────────
export async function listCustomFoods() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('custom_foods')
    .select('id, name, calories, protein, carbs, fat, category, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCustomFood(food) {
  if (!supabase) throw new Error('Not configured');
  const { error } = await supabase.from('custom_foods').insert({
    name: food.name,
    calories: Number(food.calories) || 0,
    protein: Number(food.protein) || 0,
    carbs: Number(food.carbs) || 0,
    fat: Number(food.fat) || 0,
    category: food.category || 'Custom',
  });
  if (error) throw error;
}

export async function deleteCustomFood(id) {
  if (!supabase) throw new Error('Not configured');
  const { error } = await supabase.from('custom_foods').delete().eq('id', id);
  if (error) throw error;
}
