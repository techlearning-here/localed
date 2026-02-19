-- localed.info: full cleanup — drop all localed tables, policies, and indexes. Idempotent (IF EXISTS).
-- Run in Supabase SQL Editor when you want to remove the localed schema completely.

-- ---------------------------------------------------------------------------
-- 1. Drop RLS policies (must drop before tables)
-- ---------------------------------------------------------------------------

-- localed_contact_submissions
drop policy if exists "Anyone can insert contact submission" on public.localed_contact_submissions;
drop policy if exists "Insert contact for published sites only" on public.localed_contact_submissions;
drop policy if exists "Site owners can read their submissions" on public.localed_contact_submissions;

-- localed_sites
drop policy if exists "Public can read published sites" on public.localed_sites;
drop policy if exists "Users can read own sites" on public.localed_sites;
drop policy if exists "Select own or published sites" on public.localed_sites;
drop policy if exists "Users can insert own sites" on public.localed_sites;
drop policy if exists "Users can update own sites" on public.localed_sites;
drop policy if exists "Users can delete own sites" on public.localed_sites;

-- localed_feature_flags
drop policy if exists "Anyone can read feature flags" on public.localed_feature_flags;

-- ---------------------------------------------------------------------------
-- 2. Drop tables (child first; indexes drop with tables)
-- ---------------------------------------------------------------------------

drop table if exists public.localed_contact_submissions;
drop table if exists public.localed_feature_flags;
drop table if exists public.localed_sites;
