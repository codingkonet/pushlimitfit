const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/nutrition', require('./routes/nutrition'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Fitness Platform API running on http://localhost:${PORT}`));
