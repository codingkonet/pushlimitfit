// All app data stored in localStorage — no backend required

const K = {
  profile: 'plt_profile',
  workouts: 'plt_workouts',
  nutrition: 'plt_nutrition',
  savedPlans: 'plt_saved_plans',
  measurements: 'plt_measurements',
};

function load(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// ── Profile ─────────────────────────────────────────────────────────
export function getProfile() {
  return load(K.profile, {
    username: 'You',
    age: null, gender: 'male', height_cm: null, weight_kg: null,
    activity_level: 'moderate', goal: 'maintain',
    daily_calories: null, protein_g: null, carbs_g: null, fat_g: null,
    bmr: null, tdee: null,
  });
}

export function saveProfile(data) {
  const updated = { ...getProfile(), ...data };
  save(K.profile, updated);
  return updated;
}

// ── Calorie calculation (Mifflin-St Jeor) ──────────────────────────
export function calcNutritionTargets({ age, gender, height_cm, weight_kg, activity_level, goal }) {
  const a = Number(age), h = Number(height_cm), w = Number(weight_kg);
  let bmr = gender === 'male'
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161;
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const tdee = bmr * (mult[activity_level] || 1.55);
  let daily_calories = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;
  daily_calories = Math.round(daily_calories);
  const protein_g = Math.round(w * 1.8);
  const fat_g = Math.round((daily_calories * 0.28) / 9);
  const carbs_g = Math.round((daily_calories - protein_g * 4 - fat_g * 9) / 4);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), daily_calories, protein_g, carbs_g, fat_g };
}

// ── Workouts ─────────────────────────────────────────────────────────
export function getWorkouts(limit = 20) {
  const all = load(K.workouts, []);
  return all.slice(0, limit).map(w => ({ ...w, exercise_count: w.exercises?.length || 0 }));
}

export function getWorkout(id) {
  return load(K.workouts, []).find(w => w.id === id) || null;
}

export function addWorkout(data) {
  const all = load(K.workouts, []);
  const workout = { ...data, id: Date.now(), created_at: new Date().toISOString() };
  save(K.workouts, [workout, ...all]);
  return workout;
}

export function updateWorkout(id, data) {
  const all = load(K.workouts, []);
  const updated = all.map(w => w.id === id ? { ...w, ...data } : w);
  save(K.workouts, updated);
  return updated.find(w => w.id === id);
}

export function deleteWorkout(id) {
  save(K.workouts, load(K.workouts, []).filter(w => w.id !== id));
}

export function getWorkoutStats() {
  const all = load(K.workouts, []);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = all.filter(w => new Date(w.date) >= weekAgo).length;
  const totalDuration = all.reduce((s, w) => s + (w.duration_minutes || 0), 0);
  return { totalWorkouts: all.length, thisWeek, totalDuration, recentWorkouts: all.slice(0, 5) };
}

// ── Nutrition ─────────────────────────────────────────────────────────
export function getNutritionByDate(date) {
  const logs = load(K.nutrition, []).filter(n => n.date === date);
  const totals = logs.reduce(
    (a, n) => ({ calories: a.calories + n.calories, protein_g: a.protein_g + n.protein_g, carbs_g: a.carbs_g + n.carbs_g, fat_g: a.fat_g + n.fat_g }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
  Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k] * 10) / 10; });
  return { logs, totals };
}

export function getNutritionHistory() {
  const all = load(K.nutrition, []);
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
  const byDate = {};
  all.filter(n => new Date(n.date) >= cutoff).forEach(n => {
    if (!byDate[n.date]) byDate[n.date] = { date: n.date, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    byDate[n.date].calories += n.calories;
    byDate[n.date].protein_g += n.protein_g;
    byDate[n.date].carbs_g += n.carbs_g;
    byDate[n.date].fat_g += n.fat_g;
  });
  return Object.values(byDate)
    .map(d => ({ ...d, calories: Math.round(d.calories * 10) / 10 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function addNutritionLog(data) {
  const all = load(K.nutrition, []);
  const entry = { ...data, id: Date.now(), created_at: new Date().toISOString() };
  save(K.nutrition, [...all, entry]);
  return entry;
}

export function deleteNutritionLog(id) {
  save(K.nutrition, load(K.nutrition, []).filter(n => n.id !== id));
}

// ── Workout Plans ────────────────────────────────────────────────────
export function getSavedPlanIds() { return load(K.savedPlans, []); }

export function toggleSavedPlan(planId) {
  const saved = getSavedPlanIds();
  const next = saved.includes(planId) ? saved.filter(id => id !== planId) : [...saved, planId];
  save(K.savedPlans, next);
  return next.includes(planId);
}

// ── Body measurements ────────────────────────────────────────────────
export function getMeasurements() { return load(K.measurements, []); }

export function addMeasurement(data) {
  const all = getMeasurements();
  const m = { ...data, id: Date.now(), created_at: new Date().toISOString() };
  const updated = [m, ...all].slice(0, 30);
  save(K.measurements, updated);
  return updated;
}
