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

## Payments & Admin (optional) — PayPal + Supabase

Real **Pro purchases** (PayPal) and an **admin panel** build on top of cloud
sync, so set up Supabase first (above). Both are optional: without PayPal keys
the Upgrade page falls back to a free demo unlock, and the admin panel only
appears for accounts flagged as admin.

### 1. Database
The schema in [`supabase/schema.sql`](supabase/schema.sql) now also creates
`profiles` (Pro + admin flags, auto-created per user), `payments`, and
`custom_foods`. Re-run it in the SQL Editor — it's idempotent.

### 2. Create the admin account
1. **Authentication → Users → Add user**: email `workout@plfit.net`,
   password `254637` (auto-confirm).
2. In the **SQL Editor**, grant admin:
   ```sql
   update public.profiles set is_admin = true where email = 'workout@plfit.net';
   ```
3. Sign in with that account — an **Admin** item appears in the sidebar
   (users + Pro toggle, payments/revenue, custom-food management).

> Security note: admin access is enforced by Postgres Row Level Security
> (`is_admin` flag), **not** a hard-coded client password — so the credential
> can't be read out of the JS bundle.

### 3. PayPal checkout
1. Create a REST app at [developer.paypal.com](https://developer.paypal.com)
   → copy its **Client ID** and **Secret**.
2. Deploy the Edge Function (it holds the secret, never the browser):
   ```bash
   supabase functions deploy paypal
   supabase secrets set PAYPAL_CLIENT_ID=... PAYPAL_SECRET=... PAYPAL_ENV=sandbox PRO_PRICE=9.99 PRO_CURRENCY=USD
   ```
3. Add the **public** client id to the web/app build env (alongside the
   Supabase keys): `VITE_PAYPAL_CLIENT_ID` and optionally `VITE_PRO_CURRENCY`.
4. Redeploy. The Upgrade page now shows PayPal buttons; a completed payment is
   verified server-side, which flips `is_pro` and records the sale.

Switch `PAYPAL_ENV` to `live` (with live credentials) when you're ready to take
real money.

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
