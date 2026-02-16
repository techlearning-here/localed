-- localed.info: combined schema (tables + RLS). Idempotent: safe for fresh install or existing DB.
-- Run in Supabase SQL Editor once.

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

create table if not exists public.localed_sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  business_type text not null,
  template_id text not null default 'default',
  plan text not null default 'free' check (plan in ('free', 'paid')),
  languages text[] not null default array['en'],
  published_at timestamptz,
  archived_at timestamptz,
  draft_content jsonb not null default '{}',
  published_content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_localed_sites_owner on public.localed_sites(owner_id);
create index if not exists idx_localed_sites_slug on public.localed_sites(slug);
create index if not exists idx_localed_sites_published on public.localed_sites(published_at) where published_at is not null;

comment on table public.localed_sites is 'localed.info business sites; prefix localed_ per SUPABASE_REUSE';

create table if not exists public.localed_contact_submissions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.localed_sites(id) on delete cascade,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_localed_contact_submissions_site on public.localed_contact_submissions(site_id);

-- ---------------------------------------------------------------------------
-- 2. RLS: localed_sites (only if table exists)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'localed_sites') then
    -- Ensure archived_at exists (table may have been created before this column was added).
    alter table public.localed_sites add column if not exists archived_at timestamptz;

    alter table public.localed_sites enable row level security;

    drop policy if exists "Public can read published sites" on public.localed_sites;
    drop policy if exists "Users can read own sites" on public.localed_sites;
    drop policy if exists "Select own or published sites" on public.localed_sites;
    create policy "Select own or published sites"
      on public.localed_sites for select
      using (
        (select auth.uid()) = owner_id
        or (published_at is not null and archived_at is null)
      );

    drop policy if exists "Users can insert own sites" on public.localed_sites;
    create policy "Users can insert own sites"
      on public.localed_sites for insert
      with check ((select auth.uid()) = owner_id);

    drop policy if exists "Users can update own sites" on public.localed_sites;
    create policy "Users can update own sites"
      on public.localed_sites for update
      using ((select auth.uid()) = owner_id);

    drop policy if exists "Users can delete own sites" on public.localed_sites;
    create policy "Users can delete own sites"
      on public.localed_sites for delete
      using ((select auth.uid()) = owner_id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. RLS: localed_contact_submissions (only if table exists)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'localed_contact_submissions') then
    alter table public.localed_contact_submissions enable row level security;

    drop policy if exists "Site owners can read their submissions" on public.localed_contact_submissions;
    create policy "Site owners can read their submissions"
      on public.localed_contact_submissions for select
      using (
        exists (
          select 1 from public.localed_sites s
          where s.id = site_id and s.owner_id = (select auth.uid())
        )
      );

    drop policy if exists "Anyone can insert contact submission" on public.localed_contact_submissions;
    drop policy if exists "Insert contact for published sites only" on public.localed_contact_submissions;
    create policy "Insert contact for published sites only"
      on public.localed_contact_submissions for insert
      with check (
        exists (
          select 1 from public.localed_sites s
          where s.id = site_id and s.published_at is not null and s.archived_at is null
        )
      );
  end if;
end $$;
