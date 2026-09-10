-- Plantidex: remote species table (Supabase/Postgres) with PostGIS for the
-- community map. Run this once in the Supabase SQL Editor for your project
-- (Project → SQL Editor → New query → paste → Run).

create extension if not exists postgis;

create table if not exists public.species (
  id uuid primary key,
  common_name text not null,
  scientific_name text not null,
  description text,
  conservation_status text not null,
  location geography(Point, 4326) not null,
  photo_url text,
  author_id uuid references auth.users (id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists species_location_idx on public.species using gist (location);
create index if not exists species_author_idx on public.species (author_id);

alter table public.species enable row level security;

drop policy if exists "Species are publicly readable" on public.species;
create policy "Species are publicly readable" on public.species for select using (deleted_at is null);

drop policy if exists "Users can insert their own species" on public.species;
create policy "Users can insert their own species" on public.species for insert
  with check (auth.uid() = author_id);

drop policy if exists "Users can update their own species" on public.species;
create policy "Users can update their own species" on public.species for update
  using (auth.uid() = author_id);

-- Upsert/soft-delete run through RPCs (instead of raw REST inserts) so the
-- geography point is built server-side from plain lat/lng floats, and
-- ownership is enforced consistently.
create or replace function public.upsert_species(
  p_id uuid,
  p_common_name text,
  p_scientific_name text,
  p_description text,
  p_conservation_status text,
  p_latitude float,
  p_longitude float,
  p_photo_url text,
  p_created_at timestamptz,
  p_updated_at timestamptz
) returns void
language plpgsql
security invoker
as $$
begin
  insert into public.species (
    id, common_name, scientific_name, description, conservation_status,
    location, photo_url, author_id, created_at, updated_at
  ) values (
    p_id, p_common_name, p_scientific_name, p_description, p_conservation_status,
    ST_MakePoint(p_longitude, p_latitude)::geography, p_photo_url, auth.uid(), p_created_at, p_updated_at
  )
  on conflict (id) do update set
    common_name = excluded.common_name,
    scientific_name = excluded.scientific_name,
    description = excluded.description,
    conservation_status = excluded.conservation_status,
    location = excluded.location,
    photo_url = coalesce(excluded.photo_url, public.species.photo_url),
    updated_at = excluded.updated_at
  where public.species.author_id = auth.uid();
end;
$$;

create or replace function public.soft_delete_species(p_id uuid)
returns void
language sql
security invoker
as $$
  update public.species set deleted_at = now() where id = p_id and author_id = auth.uid();
$$;

-- Community map query: species reports within radius_m meters of (lat, lng).
create or replace function public.nearby_species(lat float, lng float, radius_m int default 50000)
returns setof public.species
language sql
stable
as $$
  select *
  from public.species
  where deleted_at is null
    and ST_DWithin(location, ST_MakePoint(lng, lat)::geography, radius_m)
  order by created_at desc
  limit 500;
$$;

-- Species photos storage bucket.
insert into storage.buckets (id, name, public)
values ('species-photos', 'species-photos', true)
on conflict (id) do nothing;

drop policy if exists "Species photos are publicly readable" on storage.objects;
create policy "Species photos are publicly readable" on storage.objects for select
  using (bucket_id = 'species-photos');

drop policy if exists "Authenticated users can upload species photos" on storage.objects;
create policy "Authenticated users can upload species photos" on storage.objects for insert
  with check (bucket_id = 'species-photos' and auth.uid() is not null);

-- Realtime: broadcast changes on the species table to subscribed clients
-- (used to refresh the community map when someone else adds a report).
alter publication supabase_realtime add table public.species;
