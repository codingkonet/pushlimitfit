# PushLIMITfit - Fitness Platform

Full-stack fitness platform with calorie calculator, workout tracker, workout plans, nutrition logging, and Arabic/English support.

## Local Development

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Run both servers
```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && node index.js

# Terminal 2 — Frontend (http://localhost:3000)
cd client && npm run dev
```

---

## Deployment (Vercel + Render)

The app is split into two parts:
- **Frontend** → [Vercel](https://vercel.com) (free)
- **Backend** → [Render](https://render.com) (free)

### Step 1 — Deploy the backend to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New → Web Service**
3. Connect the `pushlimitfit` GitHub repo
4. Set these options:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Add environment variable:
   - `JWT_SECRET` → any long random string (e.g. `openssl rand -hex 32`)
6. Click **Deploy** — wait for it to go live
7. Copy your Render URL (e.g. `https://pushlimitfit-api.onrender.com`)

### Step 2 — Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project** and import `pushlimitfit`
3. Vercel will auto-detect the `vercel.json` — no extra build config needed
4. Add this **Environment Variable** in Vercel:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-render-url.onrender.com/api`
5. Click **Deploy**

### Step 3 — Update CORS on Render

After Vercel gives you a URL (e.g. `https://pushlimitfit.vercel.app`), go back to Render and update:
- `FRONTEND_URL` → your Vercel URL

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| Database | SQLite (node-sqlite3-wasm — no native deps) |
| Auth | JWT tokens |
| i18n | Custom context — English + Arabic (RTL) |

## Features

- **Dashboard** — calorie ring, macro bars, 7-day chart
- **Calorie Calculator** — BMR & TDEE (Mifflin-St Jeor), macro targets
- **Workout Tracker** — log exercises with sets/reps/weight
- **Workout Plans** — PPL, Full Body, Upper/Lower, HIIT, Bodyweight
- **Nutrition Log** — 40+ foods, meal-type logging, daily macros
- **Profile** — goals, body measurements log
- **Landing Page** — public marketing page
- **Bilingual** — English / Arabic with full RTL layout
