-- Feature flags for admin-controlled rollout. Read by app; only backend (service role) can write.

create table if not exists public.localed_feature_flags (
  key text primary key,
  enabled boolean not null default true,
  description text,
  updated_at timestamptz not null default now()
);

comment on table public.localed_feature_flags is 'Admin-managed feature flags; app reads, only service role writes';

alter table public.localed_feature_flags enable row level security;

-- Anyone can read (anon key); used by app to show/hide features.
drop policy if exists "Anyone can read feature flags" on public.localed_feature_flags;
create policy "Anyone can read feature flags"
  on public.localed_feature_flags for select
  using (true);

-- No policy for insert/update/delete: only service role (backend) can modify.

-- Seed default flags (idempotent: insert only if missing).
insert into public.localed_feature_flags (key, description)
values
  ('archive', 'Archive / unarchive sites'),
  ('business_hours', 'Business hours in editor and public site'),
  ('qr_code', 'QR code generation after publish'),
  ('contact_form', 'Contact form on published site')
on conflict (key) do nothing;
