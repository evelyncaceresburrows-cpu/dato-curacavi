-- 0005_solicitudes_ruta68.sql
--
-- Ruta 68: extender la tabla `solicitudes` para que el form `/socio` pueda
-- guardar la comuna del corredor y el tiempo de visita estimado del negocio.
--
-- Contexto:
--   · 0001_init.sql creó `solicitudes` sin estas columnas.
--   · 0004_dato68.sql agregó `comuna_id` y `tiempo_visita_min` a `comercios`
--     y `eventos`, pero NO a `solicitudes`.
--   · El cliente (src/lib/solicitudesApi.ts) envía `comuna` y
--     `tiempo_visita_min` en el insert; sin esta migration el insert falla con
--     'column "comuna" of relation "solicitudes" does not exist'.
--
-- Idempotente: usa `add column if not exists`. Seguro de re-correr.

begin;

-- ─── 1. Comuna del corredor ─────────────────────────────────────────────────
-- FK a `comunas (id)` para mantener consistencia con comercios/eventos.
-- on delete set null: si un día se borra una comuna del catálogo, las
-- solicitudes históricas no se rompen.

alter table public.solicitudes
  add column if not exists comuna text
    references public.comunas (id) on delete set null;

-- ─── 2. Tiempo de visita (sólo negocios) ────────────────────────────────────
-- Mismo check que `comercios.tiempo_visita_min` para que el admin pueda
-- copiar/pegar al aprobar.

alter table public.solicitudes
  add column if not exists tiempo_visita_min integer
    check (tiempo_visita_min is null
           or (tiempo_visita_min > 0 and tiempo_visita_min <= 600));

-- ─── 3. Índice para reportes admin ──────────────────────────────────────────
-- Permite filtrar pendientes por comuna sin scan completo.

create index if not exists solicitudes_comuna_idx
  on public.solicitudes (comuna)
  where comuna is not null;

commit;
