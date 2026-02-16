-- Add country to localed_sites (ISO 3166-1 alpha-2, e.g. IN, US).
alter table public.localed_sites add column if not exists country text;
comment on column public.localed_sites.country is 'Business country (ISO 3166-1 alpha-2); e.g. IN, US';
