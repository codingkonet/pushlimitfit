# PushLIMITfit — Fitness Platform

An offline-first fitness platform. **No accounts, no backend, no sign-up.**
All your data (profile, workouts, nutrition, saved plans) is stored locally
in your browser via `localStorage`.

## Local Development

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000** — that's it. No server to run.

## Deployment (Vercel)

This is now a pure static site, so deployment is trivial:

1. Go to [vercel.com](https://vercel.com), import the `pushlimitfit` repo
2. Vercel auto-detects `vercel.json` — builds `client/` and serves it
3. Deploy. Done.

No environment variables, no database, no serverless functions.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Data | Browser `localStorage` (via `src/api/storage.js`) |
| i18n | English + Arabic with full RTL support |

## Features

- **Dashboard** — calorie ring, macro bars, 7-day chart, recent workouts
- **Calorie Calculator** — BMR & TDEE (Mifflin-St Jeor) + macro targets
- **Workout Tracker** — log exercises with sets/reps/weight
- **Workout Plans** — PPL, Full Body, Upper/Lower, HIIT, Bodyweight
- **Nutrition Log** — 40+ foods, meal-type logging, daily macros
- **Profile** — goals, body-measurement history
- **Bilingual** — English / Arabic (RTL)

## Data & Privacy

Everything stays on your device. Clearing your browser data resets the app.
Nothing is ever sent to a server.
