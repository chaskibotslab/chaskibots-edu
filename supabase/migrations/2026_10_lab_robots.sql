-- Laboratorio de Robótica (F3): «Mis robots» guardados en la cuenta.
-- Idempotente: se puede pegar más de una vez en el SQL Editor de Supabase.
-- Deshacer: supabase/migrations/2026_10_lab_robots_down.sql

create table if not exists public.lab_robots (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  nombre text not null default 'Mi robot',
  doc jsonb not null,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

create index if not exists lab_robots_user_idx on public.lab_robots (user_id, actualizado desc);

-- Historial: una copia por cada guardado (la API conserva las últimas 20).
create table if not exists public.lab_robot_versiones (
  id uuid primary key default gen_random_uuid(),
  robot_id uuid not null references public.lab_robots (id) on delete cascade,
  doc jsonb not null,
  creado timestamptz not null default now()
);

create index if not exists lab_robot_versiones_robot_idx on public.lab_robot_versiones (robot_id, creado desc);

-- Igual que el resto de la plataforma: RLS activo, sin políticas y sin acceso
-- para anon/authenticated. Solo el servidor (service role) lee y escribe.
alter table public.lab_robots enable row level security;
alter table public.lab_robot_versiones enable row level security;
revoke all on public.lab_robots from anon, authenticated;
revoke all on public.lab_robot_versiones from anon, authenticated;
