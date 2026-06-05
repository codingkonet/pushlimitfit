-- PushLIMITfit — Supabase schema
-- Run this once in your Supabase project: SQL Editor → paste → Run.
-- Safe to re-run (idempotent).
--
-- The whole app state (profile, workouts, nutrition, plans, settings) is
-- stored as a single JSON document per user. Row Level Security guarantees
-- each user can only read/write their own row. Pro status, payments, admin
-- access, and managed content live in their own tables (see below).

-- ─────────────────────────────────────────────────────────────────────
-- 1. Per-user app data document (cloud sync)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- One policy covering select/insert/update/delete for the row owner.
drop policy if exists "user_data_owner" on public.user_data;
create policy "user_data_owner"
  on public.user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists user_data_touch on public.user_data;
create trigger user_data_touch
  before update on public.user_data
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 2. Profiles — one row per auth user; holds Pro + admin flags
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  is_pro     boolean not null default false,
  is_admin   boolean not null default false,
  pro_since  timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER helper so policies can check "is the caller an admin?"
-- without recursively triggering profiles RLS.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- A user can read their own profile; admins can read every profile.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

-- is_pro / is_admin must never be self-set by clients, so only admins may
-- update profiles from the client. (The PayPal Edge Function uses the service
-- role key, which bypasses RLS, to flip is_pro after a verified payment.)
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that existed before this migration.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- 3. Payments — recorded by the PayPal Edge Function (service role)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  email      text,
  provider   text not null default 'paypal',
  order_id   text,
  amount     numeric(10,2),
  currency   text default 'USD',
  status     text not null default 'completed',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Users can see their own payments; admins can see all. Inserts come from the
-- Edge Function via the service role key, so no client INSERT policy is needed.
drop policy if exists "payments_select" on public.payments;
create policy "payments_select"
  on public.payments
  for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────────────
-- 4. Custom foods — admin-managed content merged into the nutrition log
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.custom_foods (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  calories   numeric not null default 0,
  protein    numeric not null default 0,
  carbs      numeric not null default 0,
  fat        numeric not null default 0,
  category   text default 'Custom',
  created_at timestamptz not null default now()
);

alter table public.custom_foods enable row level security;

-- Everyone (even anon) may read custom foods; only admins may write them.
drop policy if exists "custom_foods_read" on public.custom_foods;
create policy "custom_foods_read"
  on public.custom_foods
  for select
  using (true);

drop policy if exists "custom_foods_admin_write" on public.custom_foods;
create policy "custom_foods_admin_write"
  on public.custom_foods
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────────────
-- 5. Bootstrap the admin account
-- ─────────────────────────────────────────────────────────────────────
-- After you have created the auth user workout@plfit.net (Authentication →
-- Users → Add user, password 254637), run this once to grant admin rights:
--
--   update public.profiles set is_admin = true
--   where email = 'workout@plfit.net';
--
-- (Kept as a comment so the migration is safe to run before that user exists.)
