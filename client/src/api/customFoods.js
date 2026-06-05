import { supabase } from './supabase';

// Public, cached read of admin-managed custom foods, shaped to match the
// built-in foods list (string id prefixed to avoid colliding with numeric ids).
let cache = null;

export async function getCustomFoods() {
  if (!supabase) return [];
  if (cache) return cache;
  const { data, error } = await supabase
    .from('custom_foods')
    .select('id, name, calories, protein, carbs, fat, category');
  if (error) { console.warn('getCustomFoods failed:', error.message); return []; }
  cache = (data ?? []).map(f => ({
    id: `cf-${f.id}`,
    name: f.name,
    calories: Number(f.calories) || 0,
    protein: Number(f.protein) || 0,
    carbs: Number(f.carbs) || 0,
    fat: Number(f.fat) || 0,
    category: f.category || 'Custom',
  }));
  return cache;
}

export function clearCustomFoodsCache() { cache = null; }
