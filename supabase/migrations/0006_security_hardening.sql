-- 0006_security_hardening.sql
--
-- Hardening tras correr el linter de seguridad de Supabase.
-- Resuelve los 2 ERROR (security definer en views) y 11 WARN (search_path
-- mutable en funciones).
--
-- Idempotente: `alter view ... set` y `alter function ... set` son seguros
-- de re-correr.

begin;

-- ─── 1. Views: respetan RLS del invoker, no del owner ──────────────────────
-- Por defecto Postgres crea views con SECURITY DEFINER. En Supabase eso
-- bypassea la RLS del cliente. Las pasamos a security_invoker para que
-- la consulta corra con el rol del usuario que la lanza.

alter view public.v_comercios_busqueda set (security_invoker = true);
alter view public.v_eventos_busqueda   set (security_invoker = true);

-- ─── 2. Funciones: search_path explícito ───────────────────────────────────
-- Sin esto un atacante autenticado podría crear objetos en su schema
-- personal (si lo tuviera) y manipular el resolver. Pinneamos a public + pg_temp.

alter function public.current_profile_rol()              set search_path = public, pg_temp;
alter function public.handle_new_user()                  set search_path = public, pg_temp;
alter function public.rate_limit_solicitudes()           set search_path = public, pg_temp;
alter function public.sanitize_solicitud()               set search_path = public, pg_temp;
alter function public.set_actualizado_en()               set search_path = public, pg_temp;
alter function public.refresh_comercio_search_doc(uuid)  set search_path = public, pg_temp;
alter function public.comercios_search_trigger()         set search_path = public, pg_temp;
alter function public.comercio_tags_search_trigger()     set search_path = public, pg_temp;
alter function public.refresh_evento_search_doc(uuid)    set search_path = public, pg_temp;
alter function public.eventos_search_trigger()           set search_path = public, pg_temp;
alter function public.evento_tags_search_trigger()       set search_path = public, pg_temp;

commit;

-- ─── Warnings restantes (intencionales, no se modifican aquí) ──────────────
-- · `pg_trgm` y `unaccent` en schema public: mover requiere reescribir cada
--   uso con `extensions.unaccent(...)`. Lo dejamos en public hasta que sea
--   prioridad.
-- · RLS `solicitudes_insert_any` con `with check (true)`: by design — el
--   form /socio permite envíos anónimos. Mitigado por trigger rate-limit
--   (5/10min), honeypot, sanitize, y admin manual review antes de publicar.
-- · Bucket `solicitudes` con SELECT amplio: necesario para que el cliente
--   resuelva URLs de imagen subida en el form anónimo.
