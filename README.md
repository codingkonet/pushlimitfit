# PushLIMITfit — Fitness Platform

An offline-first fitness platform. It works with **no account** — all data
(profile, workouts, nutrition, plans, settings) is stored locally via
`localStorage`. Optionally, **sign in to sync that data across devices**
(phone + web) through Supabase. Sync is entirely opt-in; without it the app
is fully offline.

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

No environment variables required for the offline-only build.

## Cloud Sync (optional) — Supabase

Enables the same data on phone (APK) and web. One Supabase project serves both.

### 1. Create the project & table
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and **Run**.
   (Creates `user_data` with row-level security so each user only sees their own data.)
3. (Optional, smoother UX) **Authentication → Providers → Email**: turn **off**
   "Confirm email" so sign-up logs in immediately.

### 2. Grab your keys
**Settings → API**: copy the **Project URL** and the **anon public** key.
(The anon key is meant for the client; RLS protects the data.)

### 3. Wire them in
- **Local dev:** create `client/.env` from `client/.env.example` and fill both values.
- **Web (Vercel):** Project → Settings → Environment Variables → add
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` → redeploy.
- **Android APK:** add the same two as **GitHub repo secrets**
  (Settings → Secrets and variables → Actions). The APK workflow bakes them in
  at build time. Rebuild via the Actions tab.

That's it — open **Account** in the app to sign in and your data syncs everywhere.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Data | Browser `localStorage` (via `src/api/storage.js`) |
| Cloud sync | Supabase (Postgres + Auth), optional — `src/api/supabase.js` |
| Mobile | Capacitor (Android APK, built via GitHub Actions) |
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

By default everything stays on your device — clearing browser data resets the
app and nothing is sent anywhere. If you sign in (optional), your data is
synced to your own Supabase project and protected by row-level security so only
you can read it.
