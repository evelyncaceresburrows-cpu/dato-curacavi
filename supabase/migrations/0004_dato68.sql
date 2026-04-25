-- ════════════════════════════════════════════════════════════════════════════
-- Dato 68 · 0004_dato68.sql
-- Evolución a la Ruta 68: comunas extensibles, tags many-to-many,
-- full-text search en español, planificador "Arma tu Ruta".
--
-- IMPORTANTE — IDIOMA DEL DISEÑO:
--   • `comunas` es una tabla, no una enum. Cualquiera puede agregar nodos.
--   • `tags` es una tabla, no un text[]. Los tags son combinables y
--     evolutivos (mañana se agregará "wifi", "estacionamiento", etc.).
--   • El "eje_ruta_km" es el ordinal lineal sobre la Ruta 68 desde
--     Plaza Italia (km 0). Permite ordenar paradas geográficamente sin
--     cálculo trigonométrico. Acepta valores fuera del corredor: el
--     planificador solo considera comunas con `en_corredor = true`.
--
-- Corre DESPUÉS de 0001_init, 0002_rls, 0003_security.
-- ════════════════════════════════════════════════════════════════════════════

begin;

create extension if not exists "unaccent";

-- ─── 1. Tabla `comunas` (extensible) ───────────────────────────────────────

create table if not exists comunas (
  id            text primary key,                    -- slug: 'curacavi', 'casablanca'
  nombre        text not null,                       -- "Curacaví", "Casablanca"
  region        text not null default 'Valparaíso',  -- "Metropolitana", "Valparaíso"
  eje_ruta_km   numeric(6,2),                        -- km desde Plaza Italia por R68
  lat           double precision,
  lng           double precision,
  en_corredor   boolean not null default true,       -- false = comuna periférica fuera del eje
  activa        boolean not null default true,       -- soft-delete sin perder histórico
  descripcion   text,
  creado_en     timestamptz not null default now()
);

create index if not exists comunas_eje_idx on comunas (eje_ruta_km)
  where en_corredor = true and activa = true;

-- ─── 2. Tabla `tags` (combinables, evolutivos) ─────────────────────────────

create table if not exists tags (
  id            text primary key,                    -- slug: 'pet_friendly', 'romantico'
  label         text not null,                       -- "Pet friendly", "Romántico"
  grupo         text,                                -- "publico", "presupuesto", "experiencia", "logistica"
  descripcion   text,
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

create index if not exists tags_grupo_idx on tags (grupo) where activo = true;

-- ─── 3. Pivots many-to-many ────────────────────────────────────────────────

create table if not exists comercio_tags (
  comercio_id   uuid not null references comercios (id) on delete cascade,
  tag_id        text not null references tags (id) on delete cascade,
  primary key (comercio_id, tag_id)
);

create index if not exists comercio_tags_tag_idx on comercio_tags (tag_id);

create table if not exists evento_tags (
  evento_id     uuid not null references eventos (id) on delete cascade,
  tag_id        text not null references tags (id) on delete cascade,
  primary key (evento_id, tag_id)
);

create index if not exists evento_tags_tag_idx on evento_tags (tag_id);

-- ─── 4. Columnas nuevas en `comercios` ─────────────────────────────────────

alter table comercios
  add column if not exists comuna_id          text references comunas (id) on delete set null,
  add column if not exists eje_ruta_km        numeric(6,2),
  add column if not exists tiempo_visita_min  integer check (tiempo_visita_min > 0 and tiempo_visita_min <= 600),
  add column if not exists precio_clp_aprox   integer check (precio_clp_aprox >= 0),
  add column if not exists search_doc         tsvector;

create index if not exists comercios_comuna_idx on comercios (comuna_id);
create index if not exists comercios_eje_idx
  on comercios (eje_ruta_km) where publicado = true;
create index if not exists comercios_search_idx on comercios using gin (search_doc);

-- ─── 5. Columnas nuevas en `eventos` ───────────────────────────────────────

alter table eventos
  add column if not exists comuna_id          text references comunas (id) on delete set null,
  add column if not exists eje_ruta_km        numeric(6,2),
  add column if not exists tiempo_visita_min  integer check (tiempo_visita_min > 0 and tiempo_visita_min <= 600),
  add column if not exists precio_clp_aprox   integer check (precio_clp_aprox >= 0),
  add column if not exists search_doc         tsvector;

create index if not exists eventos_comuna_idx on eventos (comuna_id);
create index if not exists eventos_search_idx on eventos using gin (search_doc);

-- ─── 6. Trigger: mantener `search_doc` actualizado ─────────────────────────
-- Compone el documento de búsqueda con peso A (nombre/título), B (subtítulo),
-- C (descripción + tags + comuna). Usa diccionario español + unaccent
-- para que "café" y "cafe" matcheen igual.

create or replace function refresh_comercio_search_doc(c_id uuid)
returns void
language plpgsql
as $$
declare
  doc tsvector;
begin
  select
    setweight(to_tsvector('spanish', unaccent(coalesce(c.nombre, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(c.subtitulo, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(c.descripcion, ''))), 'C') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(string_agg(t.label, ' '), ''))), 'C') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(co.nombre, ''))), 'C')
  into doc
  from comercios c
  left join comercio_tags ct on ct.comercio_id = c.id
  left join tags t on t.id = ct.tag_id
  left join comunas co on co.id = c.comuna_id
  where c.id = c_id
  group by c.id, co.nombre;

  update comercios set search_doc = doc where id = c_id;
end;
$$;

create or replace function comercios_search_trigger()
returns trigger
language plpgsql
as $$
begin
  perform refresh_comercio_search_doc(new.id);
  return new;
end;
$$;

drop trigger if exists comercios_search_refresh on comercios;
create trigger comercios_search_refresh
  after insert or update of nombre, subtitulo, descripcion, comuna_id on comercios
  for each row execute function comercios_search_trigger();

-- Cuando cambian los tags también hay que refrescar
create or replace function comercio_tags_search_trigger()
returns trigger
language plpgsql
as $$
begin
  perform refresh_comercio_search_doc(coalesce(new.comercio_id, old.comercio_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists comercio_tags_search_refresh on comercio_tags;
create trigger comercio_tags_search_refresh
  after insert or delete on comercio_tags
  for each row execute function comercio_tags_search_trigger();

-- Mismo patrón para eventos
create or replace function refresh_evento_search_doc(e_id uuid)
returns void
language plpgsql
as $$
declare
  doc tsvector;
begin
  select
    setweight(to_tsvector('spanish', unaccent(coalesce(e.titulo, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(e.descripcion, ''))), 'C') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(string_agg(t.label, ' '), ''))), 'C') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(co.nombre, ''))), 'C') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(e.lugar, ''))), 'C')
  into doc
  from eventos e
  left join evento_tags et on et.evento_id = e.id
  left join tags t on t.id = et.tag_id
  left join comunas co on co.id = e.comuna_id
  where e.id = e_id
  group by e.id, co.nombre;

  update eventos set search_doc = doc where id = e_id;
end;
$$;

create or replace function eventos_search_trigger()
returns trigger
language plpgsql
as $$
begin
  perform refresh_evento_search_doc(new.id);
  return new;
end;
$$;

drop trigger if exists eventos_search_refresh on eventos;
create trigger eventos_search_refresh
  after insert or update of titulo, descripcion, comuna_id, lugar on eventos
  for each row execute function eventos_search_trigger();

create or replace function evento_tags_search_trigger()
returns trigger
language plpgsql
as $$
begin
  perform refresh_evento_search_doc(coalesce(new.evento_id, old.evento_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists evento_tags_search_refresh on evento_tags;
create trigger evento_tags_search_refresh
  after insert or delete on evento_tags
  for each row execute function evento_tags_search_trigger();

-- ─── 7. Vistas planas para el buscador / planificador ──────────────────────
-- Las vistas resuelven el problema "tags en una columna array" para que el
-- frontend reciba una sola fila por comercio sin hacer N+1 queries.

create or replace view v_comercios_busqueda as
select
  c.id, c.slug, c.nombre, c.subtitulo, c.descripcion, c.categoria,
  c.precio, c.rating, c.reviews, c.estado, c.imagen, c.direccion,
  c.telefono, c.whatsapp, c.web, c.email,
  c.comuna_id, co.nombre as comuna_nombre, co.region as comuna_region,
  c.eje_ruta_km, c.tiempo_visita_min, c.precio_clp_aprox,
  c.lat, c.lng,
  coalesce(array_agg(distinct t.id) filter (where t.id is not null), '{}'::text[]) as tags,
  c.publicado, c.creado_en
from comercios c
left join comunas co on co.id = c.comuna_id
left join comercio_tags ct on ct.comercio_id = c.id
left join tags t on t.id = ct.tag_id and t.activo = true
where c.publicado = true
group by c.id, co.nombre, co.region;

create or replace view v_eventos_busqueda as
select
  e.id, e.slug, e.titulo, e.descripcion, e.fecha, e.hora, e.lugar,
  e.categoria, e.estado, e.imagen, e.gratis, e.precio_texto,
  e.comuna_id, co.nombre as comuna_nombre,
  e.eje_ruta_km, e.tiempo_visita_min, e.precio_clp_aprox,
  coalesce(array_agg(distinct t.id) filter (where t.id is not null), '{}'::text[]) as tags,
  e.publicado, e.creado_en
from eventos e
left join comunas co on co.id = e.comuna_id
left join evento_tags et on et.evento_id = e.id
left join tags t on t.id = et.tag_id and t.activo = true
where e.publicado = true
group by e.id, co.nombre;

-- ─── 8. RLS para tablas nuevas ─────────────────────────────────────────────

alter table comunas        enable row level security;
alter table tags           enable row level security;
alter table comercio_tags  enable row level security;
alter table evento_tags    enable row level security;

-- Lectura pública en todas: comunas y tags son catálogos abiertos.
drop policy if exists "comunas_read"       on comunas;
create policy "comunas_read"       on comunas       for select using (true);

drop policy if exists "tags_read"          on tags;
create policy "tags_read"          on tags          for select using (true);

drop policy if exists "comercio_tags_read" on comercio_tags;
create policy "comercio_tags_read" on comercio_tags for select using (true);

drop policy if exists "evento_tags_read"   on evento_tags;
create policy "evento_tags_read"   on evento_tags   for select using (true);

-- Escritura: solo admin (rol = 'admin' en profiles).
drop policy if exists "comunas_admin_write" on comunas;
create policy "comunas_admin_write" on comunas for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'admin')
  )
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'admin')
  );

drop policy if exists "tags_admin_write" on tags;
create policy "tags_admin_write" on tags for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'admin')
  )
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'admin')
  );

-- Pivots: dueño del comercio puede taguear su negocio; admin puede todo.
drop policy if exists "comercio_tags_owner_write" on comercio_tags;
create policy "comercio_tags_owner_write" on comercio_tags for all
  using (
    exists (
      select 1 from comercios c
      where c.id = comercio_tags.comercio_id
        and (c.owner_id = auth.uid()
             or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'admin'))
    )
  )
  with check (
    exists (
      select 1 from comercios c
      where c.id = comercio_tags.comercio_id
        and (c.owner_id = auth.uid()
             or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'admin'))
    )
  );

drop policy if exists "evento_tags_owner_write" on evento_tags;
create policy "evento_tags_owner_write" on evento_tags for all
  using (
    exists (
      select 1 from eventos e
      where e.id = evento_tags.evento_id
        and (e.owner_id = auth.uid()
             or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'admin'))
    )
  )
  with check (
    exists (
      select 1 from eventos e
      where e.id = evento_tags.evento_id
        and (e.owner_id = auth.uid()
             or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'admin'))
    )
  );

-- ─── 9. Seed: 8 comunas iniciales del corredor ─────────────────────────────
-- Eje en km desde Plaza Italia, ruta 68. Lat/lng son centro comunal aprox.

insert into comunas (id, nombre, region, eje_ruta_km, lat, lng) values
  ('pudahuel',     'Pudahuel',     'Metropolitana',  10.0, -33.4429, -70.7700),
  ('curacavi',     'Curacaví',     'Metropolitana',  43.0, -33.4069, -71.1459),
  ('maria_pinto',  'María Pinto',  'Metropolitana',  56.0, -33.5189, -71.1078),
  ('casablanca',   'Casablanca',   'Valparaíso',     78.0, -33.3208, -71.4108),
  ('algarrobo',    'Algarrobo',    'Valparaíso',    100.0, -33.3667, -71.6667),
  ('quintay',      'Quintay',      'Valparaíso',    110.0, -33.1933, -71.6986),
  ('placilla',     'Placilla',     'Valparaíso',    115.0, -33.1167, -71.5500),
  ('valparaiso',   'Valparaíso',   'Valparaíso',    120.0, -33.0472, -71.6127)
on conflict (id) do nothing;

-- ─── 10. Seed: 16 tags iniciales ───────────────────────────────────────────

insert into tags (id, label, grupo, descripcion) values
  -- público objetivo
  ('ninos',        'Para niños',    'publico', 'Apto familias con menores'),
  ('familia',      'Familia',       'publico', 'Espacios amplios, mesas largas'),
  ('pareja',       'Pareja',        'publico', 'Ambiente íntimo'),
  ('romantico',    'Romántico',     'publico', 'Ideal cita o aniversario'),
  ('pet_friendly', 'Pet friendly',  'publico', 'Aceptan mascotas'),

  -- presupuesto
  ('barato',       'Barato',        'presupuesto', 'Bajo $8.000 por persona'),
  ('premium',      'Premium',       'presupuesto', 'Sobre $25.000 por persona'),

  -- experiencia
  ('vino',         'Vino',          'experiencia', 'Viñas, catas, vinería'),
  ('comida',       'Comida',        'experiencia', 'Restoranes y picadas'),
  ('naturaleza',   'Naturaleza',    'experiencia', 'Aire libre, paisaje'),

  -- logística
  ('de_paso',      'De paso',       'logistica', 'Visita corta (<30 min)'),
  ('rapido',       'Rápido',        'logistica', 'Atención sin esperar'),
  ('bano',         'Baño',          'logistica', 'Tiene baño limpio público'),
  ('lluvia',       'Para lluvia',   'logistica', 'Funciona con mal tiempo'),

  -- contexto temporal
  ('finde',        'Finde',         'temporal',  'Mejor sábado o domingo'),

  -- urgencia
  ('emergencia',   'Emergencia',    'urgencia',  'Servicios de emergencia 24/7')
on conflict (id) do nothing;

-- ─── 11. Backfill: comercios existentes apuntan a curacaví ─────────────────
-- Asumimos que toda la data anterior a esta migration es de Curacaví.

update comercios
   set comuna_id    = coalesce(comuna_id, 'curacavi'),
       eje_ruta_km  = coalesce(eje_ruta_km, 43.0)
 where publicado = true and comuna_id is null;

update eventos
   set comuna_id    = coalesce(comuna_id, 'curacavi'),
       eje_ruta_km  = coalesce(eje_ruta_km, 43.0)
 where publicado = true and comuna_id is null;

-- Reindexa search_doc para todas las filas existentes
update comercios set search_doc = search_doc where id is not null;
update eventos    set search_doc = search_doc where id is not null;

commit;
