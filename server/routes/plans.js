const express = require('express');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const workoutPlans = require('../data/workoutPlans');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const saved = db.prepare('SELECT plan_id FROM saved_plans WHERE user_id = ?').all([req.userId]).map(r => r.plan_id);
  const plans = workoutPlans.map(p => ({ ...p, saved: saved.includes(p.id) }));
  res.json(plans);
});

router.get('/:id', (req, res) => {
  const plan = workoutPlans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  const saved = !!db.prepare('SELECT id FROM saved_plans WHERE user_id = ? AND plan_id = ?').get([req.userId, req.params.id]);
  res.json({ ...plan, saved });
});

router.post('/:id/save', (req, res) => {
  const plan = workoutPlans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  db.prepare('INSERT OR IGNORE INTO saved_plans (user_id, plan_id) VALUES (?, ?)').run([req.userId, req.params.id]);
  res.json({ saved: true });
});

router.delete('/:id/save', (req, res) => {
  db.prepare('DELETE FROM saved_plans WHERE user_id = ? AND plan_id = ?').run([req.userId, req.params.id]);
  res.json({ saved: false });
});

module.exports = router;
