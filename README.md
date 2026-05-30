# PushLIMITfit - Fitness Platform

## Quick Start

### 1. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the platform

```bash
# Option A: Use the batch script (Windows)
start.bat

# Option B: Run manually in two terminals
# Terminal 1 - Backend
cd server && node index.js

# Terminal 2 - Frontend
cd client && npm run dev
```

### 3. Open in browser
Navigate to **http://localhost:3000**

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Overview of calories, macros, and recent workouts |
| **Calorie Calculator** | BMR + TDEE using Mifflin-St Jeor equation |
| **Workout Tracker** | Log workouts with exercises, sets, reps, and weight |
| **Workout Plans** | 5 pre-built programs (PPL, Full Body, Upper/Lower, HIIT, Bodyweight) |
| **Nutrition Log** | Log meals by type with calories and macros |
| **Profile** | Set goals, track body measurements |

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT tokens
