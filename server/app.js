const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.endsWith('.vercel.app') ||
      origin === (process.env.FRONTEND_URL || '')
    ) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/nutrition', require('./routes/nutrition'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

module.exports = app;
