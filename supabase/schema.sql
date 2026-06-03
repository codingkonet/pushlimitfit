-- PushLIMITfit — Supabase schema
-- Run this once in your Supabase project: SQL Editor → paste → Run.
--
-- The whole app state (profile, workouts, nutrition, plans, settings) is
-- stored as a single JSON document per user. Row Level Security guarantees
-- each user can only read/write their own row.

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
