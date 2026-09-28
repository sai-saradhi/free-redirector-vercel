create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  destination text not null,
  enabled boolean not null default true,
  clicks bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists links_slug_idx on public.links(slug);

alter table public.links enable row level security;

-- The Vercel API uses the Supabase service-role key server-side.
-- No public browser access is needed.
