-- Published site is stored as static files (e.g. R2/CDN). DB stores only path and minimal meta.
-- published_content is no longer populated on publish; artifact path points to CDN.
alter table public.localed_sites add column if not exists published_artifact_path text;
alter table public.localed_sites add column if not exists published_meta jsonb;
comment on column public.localed_sites.published_artifact_path is 'Path prefix for published static files (e.g. sites/{id}); used with CDN base URL';
comment on column public.localed_sites.published_meta is 'Minimal meta for redirect page: title, description, ogImage';
