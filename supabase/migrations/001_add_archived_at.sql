-- Add archived_at to localed_sites (for DBs created before this column existed).
-- Run after 000_combined_localed_schema.sql if the table already exists.

alter table public.localed_sites
  add column if not exists archived_at timestamptz;

comment on column public.localed_sites.archived_at is 'When set, site is archived: hidden from public and contact form disabled';

-- Recreate select policy so published-but-archived sites are not visible to anon.
drop policy if exists "Select own or published sites" on public.localed_sites;
create policy "Select own or published sites"
  on public.localed_sites for select
  using (
    (select auth.uid()) = owner_id
    or (published_at is not null and archived_at is null)
  );

-- Recreate contact insert policy so archived sites do not accept submissions.
drop policy if exists "Insert contact for published sites only" on public.localed_contact_submissions;
create policy "Insert contact for published sites only"
  on public.localed_contact_submissions for insert
  with check (
    exists (
      select 1 from public.localed_sites s
      where s.id = site_id and s.published_at is not null and s.archived_at is null
    )
  );
