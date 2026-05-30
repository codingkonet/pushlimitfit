const express = require('express');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const exercises = require('../data/exercises');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const logs = db.prepare(`
    SELECT w.*, COUNT(e.id) as exercise_count
    FROM workout_logs w
    LEFT JOIN exercise_logs e ON e.workout_log_id = w.id
    WHERE w.user_id = ?
    GROUP BY w.id
    ORDER BY w.date DESC, w.created_at DESC
    LIMIT ? OFFSET ?
  `).all([req.userId, Number(limit), Number(offset)]);
  res.json(logs);
});

router.get('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workout_logs WHERE id = ? AND user_id = ?').get([req.params.id, req.userId]);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  workout.exercises = db.prepare('SELECT * FROM exercise_logs WHERE workout_log_id = ?').all([workout.id]);
  res.json(workout);
});

router.post('/', (req, res) => {
  const { date, name, notes, duration_minutes, exercises: exList } = req.body;
  if (!date || !name) return res.status(400).json({ error: 'Date and name required' });

  const result = db.prepare('INSERT INTO workout_logs (user_id, date, name, notes, duration_minutes) VALUES (?, ?, ?, ?, ?)').run([req.userId, date, name, notes || '', duration_minutes || 0]);
  const workoutId = result.lastInsertRowid;

  if (exList && exList.length > 0) {
    const insertEx = db.prepare('INSERT INTO exercise_logs (workout_log_id, exercise_name, category, sets, reps, weight_kg, duration_minutes, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    db.exec('BEGIN');
    try {
      for (const ex of exList) {
        insertEx.run([workoutId, ex.exercise_name, ex.category || '', ex.sets || 0, ex.reps || 0, ex.weight_kg || 0, ex.duration_minutes || 0, ex.notes || '']);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }

  const workout = db.prepare('SELECT * FROM workout_logs WHERE id = ?').get([workoutId]);
  workout.exercises = db.prepare('SELECT * FROM exercise_logs WHERE workout_log_id = ?').all([workoutId]);
  res.status(201).json(workout);
});

router.put('/:id', (req, res) => {
  const { name, notes, duration_minutes, exercises: exList } = req.body;
  const existing = db.prepare('SELECT id FROM workout_logs WHERE id = ? AND user_id = ?').get([req.params.id, req.userId]);
  if (!existing) return res.status(404).json({ error: 'Workout not found' });

  db.prepare('UPDATE workout_logs SET name = ?, notes = ?, duration_minutes = ? WHERE id = ?').run([name, notes || '', duration_minutes || 0, req.params.id]);

  if (exList) {
    db.prepare('DELETE FROM exercise_logs WHERE workout_log_id = ?').run([req.params.id]);
    const insertEx = db.prepare('INSERT INTO exercise_logs (workout_log_id, exercise_name, category, sets, reps, weight_kg, duration_minutes, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    db.exec('BEGIN');
    try {
      for (const ex of exList) {
        insertEx.run([req.params.id, ex.exercise_name, ex.category || '', ex.sets || 0, ex.reps || 0, ex.weight_kg || 0, ex.duration_minutes || 0, ex.notes || '']);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }

  const workout = db.prepare('SELECT * FROM workout_logs WHERE id = ?').get([req.params.id]);
  workout.exercises = db.prepare('SELECT * FROM exercise_logs WHERE workout_log_id = ?').all([req.params.id]);
  res.json(workout);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM workout_logs WHERE id = ? AND user_id = ?').run([req.params.id, req.userId]);
  if (!result.changes) return res.status(404).json({ error: 'Workout not found' });
  res.json({ success: true });
});

router.get('/meta/exercises', (req, res) => {
  const { category, q } = req.query;
  let filtered = exercises;
  if (category) filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
  if (q) filtered = filtered.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
  res.json(filtered);
});

router.get('/meta/stats', (req, res) => {
  const totalWorkouts = db.prepare('SELECT COUNT(*) as count FROM workout_logs WHERE user_id = ?').get([req.userId]).count;
  const totalDuration = db.prepare('SELECT COALESCE(SUM(duration_minutes), 0) as total FROM workout_logs WHERE user_id = ?').get([req.userId]).total;
  const thisWeek = db.prepare("SELECT COUNT(*) as count FROM workout_logs WHERE user_id = ? AND date >= date('now', '-7 days')").get([req.userId]).count;
  const recentWorkouts = db.prepare('SELECT * FROM workout_logs WHERE user_id = ? ORDER BY date DESC LIMIT 5').all([req.userId]);
  res.json({ totalWorkouts, totalDuration, thisWeek, recentWorkouts });
});

module.exports = router;
