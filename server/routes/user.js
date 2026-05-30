const express = require('express');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function calcMacros(weight_kg, calories) {
  const proteinG = Math.round(weight_kg * 1.8);
  const fatG = Math.round((calories * 0.28) / 9);
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);
  return { proteinG, fatG, carbsG };
}

function calcCalories(age, gender, height_cm, weight_kg, activity_level, goal) {
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
  const activityMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const tdee = bmr * (activityMap[activity_level] || 1.55);
  let daily_calories;
  if (goal === 'lose') daily_calories = Math.round(tdee - 500);
  else if (goal === 'gain') daily_calories = Math.round(tdee + 300);
  else daily_calories = Math.round(tdee);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), daily_calories };
}

router.get('/profile', (req, res) => {
  const user = db.prepare('SELECT id, username, email, age, gender, height_cm, weight_kg, activity_level, goal, bmr, tdee, daily_calories, protein_g, carbs_g, fat_g FROM users WHERE id = ?').get([req.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/profile', (req, res) => {
  const { age, gender, height_cm, weight_kg, activity_level, goal } = req.body;
  let extras = {};
  if (age && gender && height_cm && weight_kg && activity_level && goal) {
    const { bmr, tdee, daily_calories } = calcCalories(Number(age), gender, Number(height_cm), Number(weight_kg), activity_level, goal);
    const { proteinG, fatG, carbsG } = calcMacros(Number(weight_kg), daily_calories);
    extras = { bmr, tdee, daily_calories, protein_g: proteinG, carbs_g: carbsG, fat_g: fatG };
  }

  const fields = { age, gender, height_cm, weight_kg, activity_level, goal, ...extras };
  const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = [...keys.map(k => fields[k]), req.userId];
  db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(values);
  const updated = db.prepare('SELECT id, username, email, age, gender, height_cm, weight_kg, activity_level, goal, bmr, tdee, daily_calories, protein_g, carbs_g, fat_g FROM users WHERE id = ?').get([req.userId]);
  res.json(updated);
});

router.post('/calculate', (req, res) => {
  const { age, gender, height_cm, weight_kg, activity_level, goal } = req.body;
  if (!age || !gender || !height_cm || !weight_kg || !activity_level || !goal)
    return res.status(400).json({ error: 'All fields required' });
  const { bmr, tdee, daily_calories } = calcCalories(Number(age), gender, Number(height_cm), Number(weight_kg), activity_level, goal);
  const { proteinG, fatG, carbsG } = calcMacros(Number(weight_kg), daily_calories);
  res.json({ bmr, tdee, daily_calories, protein_g: proteinG, carbs_g: carbsG, fat_g: fatG });
});

router.get('/measurements', (req, res) => {
  const rows = db.prepare('SELECT * FROM body_measurements WHERE user_id = ? ORDER BY date DESC LIMIT 30').all([req.userId]);
  res.json(rows);
});

router.post('/measurements', (req, res) => {
  const { date, weight_kg, body_fat_pct, notes } = req.body;
  const result = db.prepare('INSERT INTO body_measurements (user_id, date, weight_kg, body_fat_pct, notes) VALUES (?, ?, ?, ?, ?)').run([req.userId, date, weight_kg, body_fat_pct, notes]);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
