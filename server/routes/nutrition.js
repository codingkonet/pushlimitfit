const express = require('express');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const foods = require('../data/foods');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date required' });

  const logs = db.prepare('SELECT * FROM nutrition_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC').all([req.userId, date]);

  const totals = logs.reduce((acc, log) => {
    acc.calories += log.calories;
    acc.protein_g += log.protein_g;
    acc.carbs_g += log.carbs_g;
    acc.fat_g += log.fat_g;
    return acc;
  }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k] * 10) / 10; });
  res.json({ logs, totals });
});

router.get('/history', (req, res) => {
  const rows = db.prepare(`
    SELECT date,
      ROUND(SUM(calories), 1) as calories,
      ROUND(SUM(protein_g), 1) as protein_g,
      ROUND(SUM(carbs_g), 1) as carbs_g,
      ROUND(SUM(fat_g), 1) as fat_g
    FROM nutrition_logs
    WHERE user_id = ? AND date >= date('now', '-7 days')
    GROUP BY date
    ORDER BY date ASC
  `).all([req.userId]);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { date, meal_type, food_name, calories, protein_g, carbs_g, fat_g, amount_g } = req.body;
  if (!date || !food_name || calories === undefined)
    return res.status(400).json({ error: 'date, food_name, and calories are required' });

  const result = db.prepare('INSERT INTO nutrition_logs (user_id, date, meal_type, food_name, calories, protein_g, carbs_g, fat_g, amount_g) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run([req.userId, date, meal_type || 'snack', food_name, calories, protein_g || 0, carbs_g || 0, fat_g || 0, amount_g || 100]);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM nutrition_logs WHERE id = ? AND user_id = ?').run([req.params.id, req.userId]);
  if (!result.changes) return res.status(404).json({ error: 'Entry not found' });
  res.json({ success: true });
});

router.get('/foods', (req, res) => {
  const { q, category } = req.query;
  let filtered = foods;
  if (q) filtered = filtered.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));
  if (category) filtered = filtered.filter(f => f.category.toLowerCase() === category.toLowerCase());
  res.json(filtered);
});

module.exports = router;
