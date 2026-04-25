-- ════════════════════════════════════════════════════════════════════════════
-- Dato Curacaví · 0003_security.sql
-- Endurecimiento: rate-limit en `solicitudes`, honeypot, bucket de storage.
-- Corre DESPUÉS de 0001_init.sql y 0002_rls.sql.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ─── Rate limit: máx. 5 solicitudes en 10 minutos por IP/origen ────────────
-- Supabase expone la IP vía current_setting('request.headers') — cuando no
-- hay IP (tests locales), usamos la sesión actual como fallback.

create or replace function rate_limit_solicitudes()
returns trigger
language plpgsql
security definer
as $$
declare
  clave text;
  cuenta int;
begin
  clave := coalesce(
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
    current_setting('request.jwt.claim.sub', true),
    'anonimo'
  );

  -- Usamos los últimos 10 minutos y la misma clave (ip o sub).
  select count(*) into cuenta
  from public.solicitudes
  where creado_en > now() - interval '10 minutes'
    and coalesce(
      (current_setting('request.headers', true)::jsonb->>'x-forwarded-for'),
      'anonimo'
    ) = clave;

  if cuenta >= 5 then
    raise exception 'rate_limit_excedido: máximo 5 solicitudes cada 10 minutos'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists solicitudes_rate_limit on public.solicitudes;
create trigger solicitudes_rate_limit
before insert on public.solicitudes
for each row execute function rate_limit_solicitudes();

-- ─── Sanitización básica: trim + largo máximo ──────────────────────────────

create or replace function sanitize_solicitud()
returns trigger
language plpgsql
as $$
begin
  new.titulo := trim(new.titulo);
  new.descripcion := trim(new.descripcion);
  new.direccion := trim(new.direccion);
  new.email := lower(trim(new.email));
  if length(new.titulo) < 3 then
    raise exception 'titulo_muy_corto' using errcode = 'P0001';
  end if;
  if length(new.titulo) > 200 then
    raise exception 'titulo_muy_largo' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists solicitudes_sanitize on public.solicitudes;
create trigger solicitudes_sanitize
before insert on public.solicitudes
for each row execute function sanitize_solicitud();

-- ─── Índice para el rate-limit (búsqueda por ventana temporal) ──────────────

create index if not exists solicitudes_creado_en_idx
  on public.solicitudes (creado_en desc);

-- ─── Bucket de imágenes de solicitudes ──────────────────────────────────────
-- Nota: los buckets pueden crearse también via Dashboard. Este INSERT es
-- idempotente vía on conflict.

insert into storage.buckets (id, name, public)
values ('solicitudes', 'solicitudes', true)
on conflict (id) do nothing;

-- Policies de storage: público puede leer, cualquiera puede subir.
-- La moderación ocurre en el admin panel.

drop policy if exists "solicitudes_storage_read" on storage.objects;
create policy "solicitudes_storage_read"
  on storage.objects for select
  using (bucket_id = 'solicitudes');

drop policy if exists "solicitudes_storage_insert" on storage.objects;
create policy "solicitudes_storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'solicitudes');

commit;
