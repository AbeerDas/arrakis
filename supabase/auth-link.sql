-- Supabase-specific linkage between public.profiles and auth.users.
--
-- Run ONCE in the Supabase SQL Editor (or psql) AFTER `pnpm db:migrate`.
-- It is kept out of the Drizzle migrations because it references the Supabase
-- `auth` schema, which only exists on a Supabase database.
--
-- profiles.id already equals auth.users.id (set by syncProfile on first sign-in).
-- This FK enforces that and cascades a profile delete when the auth user is
-- deleted.

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;
