-- Fix: PostgREST serializes a `geography` column as raw EWKB hex text
-- (Postgres' default type output), not GeoJSON. nearby_species previously
-- returned `setof public.species` (including the raw `location` column),
-- so the client's `row.location.coordinates` access threw. Return explicit
-- latitude/longitude floats instead — no ambiguity, nothing to parse.

drop function if exists public.nearby_species(float, float, int);

create or replace function public.nearby_species(lat float, lng float, radius_m int default 50000)
returns table (
  id uuid,
  common_name text,
  scientific_name text,
  description text,
  conservation_status text,
  latitude float,
  longitude float,
  photo_url text,
  author_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
as $$
  select
    s.id,
    s.common_name,
    s.scientific_name,
    s.description,
    s.conservation_status,
    ST_Y(s.location::geometry) as latitude,
    ST_X(s.location::geometry) as longitude,
    s.photo_url,
    s.author_id,
    s.created_at,
    s.updated_at
  from public.species s
  where s.deleted_at is null
    and ST_DWithin(s.location, ST_MakePoint(lng, lat)::geography, radius_m)
  order by s.created_at desc
  limit 500;
$$;
