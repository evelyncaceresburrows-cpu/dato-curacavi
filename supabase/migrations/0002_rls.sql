-- ════════════════════════════════════════════════════════════════════════════
-- Dato Curacaví · 0002_rls.sql
-- Row Level Security. Modelo simple:
--   · Público anónimo: lee comercios y eventos publicados.
--   · Vecino autenticado: puede crear solicitudes (insert).
--   · Socio dueño: edita sus propios comercios/eventos.
--   · Admin: todo.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ─── Helper: rol actual ──────────────────────────────────────────────────────

create or replace function current_profile_rol()
returns text
language sql
stable
security definer
as $$
  select rol from public.profiles where id = auth.uid()
$$;

-- ─── Auto-alta de profile al registrarse ─────────────────────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ─── Activar RLS ────────────────────────────────────────────────────────────

alter table profiles     enable row level security;
alter table comercios    enable row level security;
alter table eventos      enable row level security;
alter table solicitudes  enable row level security;

-- ─── profiles ────────────────────────────────────────────────────────────────

create policy profiles_self_read
  on profiles for select
  using (id = auth.uid() or current_profile_rol() = 'admin');

create policy profiles_self_update
  on profiles for update
  using (id = auth.uid() or current_profile_rol() = 'admin')
  with check (id = auth.uid() or current_profile_rol() = 'admin');

-- ─── comercios ───────────────────────────────────────────────────────────────

-- Lectura pública de comercios publicados.
create policy comercios_read_public
  on comercios for select
  using (publicado = true);

-- Dueño lee también sus no publicados.
create policy comercios_read_owner
  on comercios for select
  using (owner_id = auth.uid() or current_profile_rol() = 'admin');

-- Dueño crea/edita sus propios comercios. Admin hace todo.
create policy comercios_insert_owner
  on comercios for insert
  with check (
    owner_id = auth.uid() or current_profile_rol() = 'admin'
  );

create policy comercios_update_owner
  on comercios for update
  using (owner_id = auth.uid() or current_profile_rol() = 'admin')
  with check (owner_id = auth.uid() or current_profile_rol() = 'admin');

create policy comercios_delete_admin
  on comercios for delete
  using (current_profile_rol() = 'admin');

-- ─── eventos ─────────────────────────────────────────────────────────────────

create policy eventos_read_public
  on eventos for select
  using (publicado = true);

create policy eventos_read_owner
  on eventos for select
  using (owner_id = auth.uid() or current_profile_rol() = 'admin');

create policy eventos_insert_owner
  on eventos for insert
  with check (
    owner_id = auth.uid() or current_profile_rol() = 'admin'
  );

create policy eventos_update_owner
  on eventos for update
  using (owner_id = auth.uid() or current_profile_rol() = 'admin')
  with check (owner_id = auth.uid() or current_profile_rol() = 'admin');

create policy eventos_delete_admin
  on eventos for delete
  using (current_profile_rol() = 'admin');

-- ─── solicitudes ─────────────────────────────────────────────────────────────

-- Cualquiera puede crear una solicitud (vecino sin cuenta también: se permite
-- insert anónimo con clave pública). El admin lee/actualiza.
create policy solicitudes_insert_any
  on solicitudes for insert
  with check (true);

create policy solicitudes_read_admin
  on solicitudes for select
  using (current_profile_rol() in ('admin', 'editor'));

create policy solicitudes_update_admin
  on solicitudes for update
  using (current_profile_rol() in ('admin', 'editor'))
  with check (current_profile_rol() in ('admin', 'editor'));

commit;
