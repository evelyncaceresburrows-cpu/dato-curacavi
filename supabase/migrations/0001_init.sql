-- ════════════════════════════════════════════════════════════════════════════
-- Dato Curacaví · 0001_init.sql
-- Schema inicial. Refleja el modelo de `src/data/seed.ts`.
-- Toda columna que se muestre al vecino es pública; la parte administrativa
-- se gobierna por RLS en 0002_rls.sql.
-- ════════════════════════════════════════════════════════════════════════════

begin;

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";   -- búsqueda difusa por nombre

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type categoria as enum (
  'picadas',
  'dulces',
  'chicha',
  'panoramas',
  'servicios',
  'tramites',
  'emprendimientos',
  'alojamientos',
  'cultura',
  'emergencias'
);

create type estado_dato as enum (
  'socio_pro',
  'verificado',
  'por_confirmar'
);

create type categoria_evento as enum (
  'musica',
  'gastro',
  'cultura',
  'deporte',
  'naturaleza',
  'tradicional'
);

create type precio_nivel as enum ('$', '$$', '$$$');

create type estado_solicitud as enum (
  'pendiente',
  'en_revision',
  'aprobada',
  'rechazada',
  'publicada'
);

create type tipo_solicitud as enum ('negocio', 'evento');

-- ─── Perfiles (auth.users ↔ profiles) ────────────────────────────────────────

-- Dueños de comercios Socio Pro. Se crea un profile por cada auth.users
-- vía trigger en 0002_rls.sql.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  telefono text,
  rol text not null default 'socio' check (rol in ('socio', 'admin', 'editor')),
  creado_en timestamptz not null default now()
);

-- ─── Comercios ───────────────────────────────────────────────────────────────

create table comercios (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  nombre        text not null,
  categoria     categoria not null,
  subtitulo     text,
  descripcion   text,
  direccion     text,
  telefono      text,
  whatsapp      text,
  web           text,
  email         text,
  precio        precio_nivel,
  rating        numeric(3,2) default 0 check (rating between 0 and 5),
  reviews       integer default 0 check (reviews >= 0),
  estado        estado_dato not null default 'por_confirmar',
  abierto_hasta text,
  imagen        text,                                 -- URL o gradiente CSS
  destacados    text[] default '{}',
  coords_x      numeric(5,2),                         -- posición mapa placeholder
  coords_y      numeric(5,2),
  lat           double precision,
  lng           double precision,
  distancia_km  numeric(5,2),
  owner_id      uuid references profiles (id) on delete set null,
  publicado     boolean not null default true,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index comercios_categoria_idx on comercios (categoria);
create index comercios_estado_idx    on comercios (estado);
create index comercios_publicado_idx on comercios (publicado) where publicado = true;
create index comercios_nombre_trgm   on comercios using gin (nombre gin_trgm_ops);
create index comercios_owner_idx     on comercios (owner_id);

-- ─── Eventos ─────────────────────────────────────────────────────────────────

create table eventos (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  titulo        text not null,
  descripcion   text,
  fecha         date not null,
  hora          time,
  lugar         text,
  comercio_id   uuid references comercios (id) on delete set null,
  categoria     categoria_evento not null,
  tags          text[] default '{}',
  chip_color    text,
  imagen        text,
  estado        estado_dato not null default 'por_confirmar',
  gratis        boolean not null default false,
  precio_texto  text,
  owner_id      uuid references profiles (id) on delete set null,
  publicado     boolean not null default true,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index eventos_fecha_idx      on eventos (fecha);
create index eventos_categoria_idx  on eventos (categoria);
create index eventos_publicado_idx  on eventos (publicado) where publicado = true;
create index eventos_comercio_idx   on eventos (comercio_id);

-- ─── Solicitudes (formulario /publicar) ──────────────────────────────────────

create table solicitudes (
  id            uuid primary key default gen_random_uuid(),
  tipo          tipo_solicitud not null,
  titulo        text not null,
  descripcion   text,
  categoria     text,            -- texto libre; admin la mapea a categoria/categoria_evento
  direccion     text,
  telefono      text,
  whatsapp      text,
  email         text,
  fecha         date,             -- sólo eventos
  hora          time,             -- sólo eventos
  imagen_url    text,
  contacto      text,             -- nombre del vecino
  estado        estado_solicitud not null default 'pendiente',
  notas_admin   text,
  creado_en     timestamptz not null default now(),
  resuelta_en   timestamptz
);

create index solicitudes_estado_idx on solicitudes (estado);
create index solicitudes_tipo_idx   on solicitudes (tipo);

-- ─── Trigger: mantener `actualizado_en` ──────────────────────────────────────

create or replace function set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger comercios_set_actualizado
before update on comercios
for each row execute function set_actualizado_en();

create trigger eventos_set_actualizado
before update on eventos
for each row execute function set_actualizado_en();

commit;
