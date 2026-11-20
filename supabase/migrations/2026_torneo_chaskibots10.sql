-- Torneo Chaski Bots 10: tablas de categorías, equipos y clave de jueces.
-- Las tres quedan con RLS activado y sin políticas: solo el servidor (service role) las lee y escribe.
create table if not exists torneo_categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  orden int not null default 0,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_curso', 'finalizada')),
  created_at timestamptz not null default now()
);

create table if not exists torneo_equipos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references torneo_categorias(id) on delete cascade,
  numero int not null default 0,
  robot text not null,
  equipo text not null default '',
  integrantes text[] not null default '{}',
  puesto int check (puesto between 1 and 3),
  puntaje text,
  nota text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists torneo_equipos_categoria_idx on torneo_equipos (categoria_id);

create table if not exists torneo_config (
  id int primary key default 1 check (id = 1),
  clave_hash text not null,
  updated_at timestamptz not null default now()
);

alter table torneo_categorias enable row level security;
alter table torneo_equipos enable row level security;
alter table torneo_config enable row level security;

-- Competencia por categoría (tiempos, puntaje, llaves 1 vs 1 o grupos y llaves), guardada como un solo documento.
alter table torneo_categorias add column if not exists competencia jsonb;
