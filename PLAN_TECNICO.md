# Dato Curacaví — Plan Técnico

**Autor**: Lead Engineer review
**Fecha**: 22 de abril, 2026
**Foco**: ingeniería, escalabilidad y calidad de producto. No se rediseña estética.

---

## 0. TL;DR

El frontend ya está visualmente alineado, pero detrás tiene tres grietas que se van a notar apenas entre tráfico real: **(a)** hay dos capas UI paralelas (`src/pages/*` web y `src/mobile/*`) que comparten el mismo `mockData.ts`, con duplicación de componentes y lógica; **(b)** Supabase es un stub — el schema está comentado en un `.ts`, no hay RLS, auth ni Storage; **(c)** el bundle es un solo chunk de 508kb sin code-splitting ni imágenes optimizadas. El Concierge AI además llama Gemini directo desde el cliente con la API key expuesta, riesgo de facturación abierta.

El plan entrega: consolidación de arquitectura, backend Supabase productivo (schema + RLS + Storage + Edge Function para Concierge), auth para Socio Pro + admin simple, performance (splitting + imágenes) y funcionalidades críticas cerradas. **5 fases, ~5 semanas de trabajo enfocado.**

---

## 1. Diagnóstico técnico

### 1.1 Arquitectura actual

```
src/
├─ App.tsx                       # HashRouter + WebShell + rutas anidadas
├─ main.tsx
├─ vite-env.d.ts
├─ components/                   # capa web "editorial"
│  ├─ FloatingConcierge.tsx     (179 l)
│  ├─ ConciergePanel.tsx        (291 l)
│  ├─ InscripcionSocioSkill.tsx (591 l)   ← god component
│  ├─ RegistroSocioSkill.tsx    (157 l)   ← duplicado legacy
│  ├─ PicadasSkill.tsx          (262 l)
│  ├─ HeroValle, EstadoDelValle, DatoDeLaSemana, SearchBar...
│  └─ Icons.tsx                 (135 l)
├─ lib/                          # data + hooks
│  ├─ supabase.ts               (stub, graceful fallback)
│  ├─ comerciosApi.ts, solicitudesApi.ts
│  ├─ mockData.ts               (COMERCIOS_SEMILLA — 12 fichas)
│  ├─ types.ts                  (Comercio, Categoria, etc.)
│  ├─ conciergeKnowledge.ts     (KB local del Concierge)
│  └─ useConcierge.ts           (365 l — llama Gemini directo)
├─ pages/                        # rutas web
│  ├─ Home.tsx, Directory.tsx, Agenda.tsx, Mapa.tsx, Socio.tsx, NotFound.tsx
└─ mobile/                       # experiencia iPhone /app/*
   ├─ MobileApp.tsx              (state-router interno)
   ├─ data/mockData.ts           (LUGARES, EVENTOS — distinto set al de /lib)
   ├─ layout/ (PhoneFrame, StatusBar, BottomNav, BrandLogo)
   ├─ components/ (SearchInput, PillButton, EventListItem, RecommendedCard)
   └─ screens/ (Home, Agenda, ExplorarMapa, PerfilNegocio, PublicarEvento, Guardados, Perfil)
```

Stack: React 18 + TS 5.5 + Vite 5.4 + Tailwind 3.4 + react-router 6.26 + Supabase JS 2.45 + lucide-react 0.460.
**No hay**: ESLint, Prettier, Vitest, CI, generación de tipos de Supabase, TanStack Query, error boundary global, i18n (la app es ES-CL puro hardcoded — acepta, pero conviene centralizar).

### 1.2 Duplicaciones detectadas

| # | Duplicación | Evidencia | Costo |
|---|---|---|---|
| 1 | **Dos fuentes de verdad de datos**: `src/lib/mockData.ts` (12 `COMERCIOS_SEMILLA`) y `src/mobile/data/mockData.ts` (6 `LUGARES` + `EVENTOS`). | `src/pages/Home.tsx:20`, `Directory.tsx:12` importan desde `../mobile/data/mockData` — la capa web depende de data del mobile. | Todo cambio de catálogo se hace dos veces o termina inconsistente. |
| 2 | **Skills de registro duplicadas**: `InscripcionSocioSkill.tsx` (591 l, stepper 3 pasos con upload) y `RegistroSocioSkill.tsx` (157 l, form compacto). El hook `useConcierge` mantiene flags *legacy* (`mostrarRegistroSocio`, `cerrarRegistroSocio`) apuntando al nuevo. | `useConcierge.ts:333-335`. | Bundle infla +20-30kb. Comportamientos divergen. |
| 3 | **Componentes "pages" web vs "screens" mobile con solapamiento semántico** pero implementación independiente: `pages/Home.tsx` ↔ `mobile/screens/Home.tsx`, `pages/Agenda.tsx` ↔ `mobile/screens/Agenda.tsx`, `pages/Mapa.tsx` ↔ `mobile/screens/ExplorarMapa.tsx`. | árbol completo. | Dos roadmaps paralelos para la misma funcionalidad. |
| 4 | **Hero y patrones UI hardcoded repetidos**: gradientes, tarjetas de evento, chips de categoría, date-caps se implementan inline en cada screen en vez de un `<EventCard />`, `<CategoryChip />`, `<DateCap />` reutilizables. | `pages/Home.tsx:186-199`, `pages/Directory.tsx:82-127`, `mobile/screens/Agenda.tsx:140-190`. | Inconsistencias visuales + trabajo duplicado. |
| 5 | **`InscripcionSocioSkill.tsx` concentra form + categorías + upload + API call + success UI en un solo archivo**. | 591 líneas. | Imposible testear por partes, difícil iterar el flujo. |
| 6 | **Router dual**: `HashRouter` + `MobileApp` state-router interno. Funciona, pero impide deep-linking a pantallas mobile (`/app/lugar/:id` no existe, es estado). | `src/mobile/MobileApp.tsx:20-27`. | Compartir una URL al perfil de un negocio desde la app mobile no es posible. |
| 7 | **Tipos divergentes**: `types.ts:CategoriaComercio` (picadas, dulces, chicha, tramites, emergencias) vs `mobile/data/mockData.ts:CATEGORIAS_HOME` (keys diferentes: musica, gastro, cultura, deporte, natura). Los colores y etiquetas no se reconcilian. | comparar `src/lib/types.ts:10-15` con `src/mobile/data/mockData.ts`. | La taxonomía oficial está bifurcada. |

### 1.3 Deuda técnica por área

**Data layer**
- Sin TanStack Query ni SWR: cada página fetchea en su propio `useEffect` (o peor, consume mock directo). No hay cache, dedupe ni estado de error estándar.
- `comerciosApi.ts:22-26` hace `console.error` y retorna semilla silenciosamente: degrada sin feedback al usuario.
- No hay generación de tipos desde Supabase (`supabase gen types typescript`). Los tipos `Comercio` y `MembresiaPendiente` se mantienen a mano y ya divergen del schema SQL comentado.

**Routing**
- `HashRouter` seguir sirviendo (lo puse yo para permitir abrir el `dato-curacavi-preview.html`), pero en producción **debe ser `BrowserRouter`** para SEO, deep-linking limpio y analytics. Se puede preservar HashRouter sólo para el build que se distribuye como archivo suelto.
- Falta `/lugar/:id`, `/evento/:id`, `/perfil/:slug`. Actualmente los `<Link to="/lugar/${l.id}">` apuntan al vacío.
- No hay `ErrorBoundary`, ni `useNavigate` centralizado.

**Componentes**
- 3 componentes > 250 líneas (`InscripcionSocioSkill`, `ConciergePanel`, `PicadasSkill`). Regla práctica: > 200 líneas = extraer sub-componente.
- Falta barrel exports (`components/index.ts`), todo import es path relativo largo.
- Mezcla: presentación y lógica de negocio en el mismo archivo (ej: `InscripcionSocioSkill` contiene fetch, validación, UI, estado de éxito, metadata de categorías).

**Estado & fetching**
- `useState` local por página, sin store global. Aceptable por ahora pero hay "prop drilling" en `FloatingConcierge → ConciergePanel → skills`.
- Claves de cache inexistentes: cada re-render re-consulta.

**Build / Vite / TypeScript**
- Bundle único `index-*.js` de **508kb** (142kb gz). Sin code splitting.
- Sin `rollupOptions.output.manualChunks` (vendor/react/supabase separados).
- En repo hay **5 archivos timestamp de Vite** (`vite.config.ts.timestamp-*.mjs`) — basura que debe ir al `.gitignore` y borrarse.
- `tsconfig.json` mínimo (474 bytes) — no auditado strict flags.
- `build` corre `tsc && vite build`. Ya hubo 3 errores de `ImportMetaEnv` resueltos añadiendo `vite-env.d.ts`. Vigilar que no vuelvan.

**DX**
- **Sin ESLint**, sin Prettier, sin `lint-staged`, sin husky, sin CI (`.github/workflows` ausente).
- **Sin tests**. Un proyecto de este tamaño ya justifica Vitest + Testing Library al menos para `useConcierge` (lógica determinística).
- `README.md` es corto y no documenta cómo correr Supabase, env vars completas (falta `VITE_GEMINI_API_KEY`), ni flujo de contribución.

**Seguridad**
- **La clave de Gemini viaja al cliente**: `useConcierge.ts:140` lee `VITE_GEMINI_API_KEY` — todo lo que empieza con `VITE_` se inyecta en el bundle público. Cualquiera que abra DevTools la extrae y consume tu cuota. **Crítico**: mover a Edge Function antes de ir a producción.
- No hay rate limit en el Concierge. Abuso potencial.
- Supabase aún sin RLS: si se conecta a una base real sin policies, cualquiera podría leer/escribir todas las tablas.

**Accesibilidad**
- Contrastes correctos en la paleta `bosque`/`arena`/`carbon`.
- Falta `aria-label` en varios botones icon-only (algunos ya tienen, revisar `pages/Directory.tsx:42-47`, `pages/Mapa.tsx`).
- No hay navegación por teclado probada.
- `alt=""` por defecto en imágenes de background CSS — por ser decorativas es defendible, pero falta auditoría WCAG AA completa (la skill `design:accessibility-review` puede cubrirla cuando toque).

### 1.4 Matriz de severidad

| Área | Gravedad | Riesgo si no se atiende |
|---|---|---|
| API key Gemini en cliente | 🔴 Alta | Facturación abierta, vector de abuso |
| Sin RLS en Supabase al conectar | 🔴 Alta | Fuga/escritura de datos de terceros |
| Duplicación mobile / web / mock | 🟠 Media | Inconsistencias, bugs dobles |
| Bundle sin splitting | 🟠 Media | TTI > 3s en 4G, bounce rate |
| Rutas dinámicas vacías (`/lugar/:id`) | 🟠 Media | Deep-link roto, SEO cero |
| Sin tests / sin CI | 🟠 Media | Regresiones silenciosas |
| Sin ESLint / Prettier | 🟡 Baja | Drift de estilo |
| Archivos timestamp en repo | 🟡 Baja | Ruido en diffs |

---

## 2. Arquitectura objetivo

### 2.1 Árbol propuesto

```
src/
├─ main.tsx                      # providers (QueryClient, Auth, Router, ErrorBoundary)
├─ App.tsx                       # sólo routing
├─ routes/                       # lazy chunks — uno por ruta
│  ├─ web/
│  │  ├─ Home.tsx
│  │  ├─ Directory.tsx
│  │  ├─ Agenda.tsx
│  │  ├─ Mapa.tsx
│  │  ├─ Socio.tsx
│  │  └─ LugarDetalle.tsx        # /lugar/:id
│  ├─ app/                       # experiencia mobile /app/*
│  │  ├─ AppShell.tsx
│  │  ├─ Home.tsx
│  │  ├─ Agenda.tsx
│  │  ├─ Mapa.tsx
│  │  ├─ Lugar.tsx               # /app/lugar/:id (deep-linkable)
│  │  ├─ Publicar.tsx
│  │  ├─ Guardados.tsx
│  │  └─ Perfil.tsx
│  └─ admin/                     # panel Socio / Admin
│     ├─ Login.tsx
│     ├─ MiNegocio.tsx
│     ├─ Eventos.tsx
│     └─ Admin.tsx               # super-admin
├─ features/                     # slices por dominio
│  ├─ comercios/
│  │  ├─ api.ts                 # queries supabase
│  │  ├─ hooks.ts               # useComercios, useComercio(id)
│  │  ├─ schema.ts              # zod schemas
│  │  ├─ ComercioCard.tsx
│  │  ├─ ComercioDetalle.tsx
│  │  └─ SelloCalidad.tsx
│  ├─ eventos/ …
│  ├─ concierge/
│  │  ├─ useConcierge.ts
│  │  ├─ knowledge.ts
│  │  ├─ FloatingConcierge.tsx
│  │  ├─ Panel.tsx
│  │  └─ skills/
│  │     ├─ Seguridad.tsx
│  │     ├─ Picadas.tsx
│  │     └─ InscripcionSocio/   # ← split del monolito 591 l
│  │        ├─ index.tsx
│  │        ├─ Paso1Datos.tsx
│  │        ├─ Paso2Categoria.tsx
│  │        └─ Paso3Foto.tsx
│  ├─ mapa/ …
│  └─ auth/ …                   # AuthProvider, useAuth, RequireAuth
├─ components/                   # genéricos reutilizables
│  ├─ ui/ (Button, Chip, Card, Input, Modal, Sheet, Image, Skeleton)
│  ├─ layout/ (WebShell, PhoneFrame, StatusBar, BottomNav, NavBar, Footer)
│  └─ feedback/ (ErrorBoundary, EmptyState, ErrorState)
├─ lib/
│  ├─ supabase.ts               # cliente + tipos generados
│  ├─ database.types.ts         # ← auto-generado por supabase gen types
│  ├─ queryClient.ts            # TanStack Query config
│  ├─ env.ts                    # zod-parse de VITE_* con errores claros
│  └─ utils.ts
├─ data/
│  └─ seed.ts                    # única fuente mock (para demo offline)
├─ hooks/                        # hooks compartidos transversales
└─ styles/
   └─ globals.css                # ex-index.css, reordenado
```

**Principios**:
- **Feature-first** dentro de `features/`: todo lo de comercios vive junto (API, hooks, componentes de dominio, schemas).
- **`routes/` es sólo composición**, nunca lógica de negocio.
- **`components/ui/`** son primitivos agnósticos (ej `<Chip>` no sabe de categorías, acepta `color`).
- Un solo `data/seed.ts` (consume `database.types.ts` aunque esté offline).

### 2.2 Convenciones

- **Naming**: componentes `PascalCase.tsx`, hooks `useX.ts`, utilidades `kebab.ts`. Un componente por archivo.
- **Imports**: alias `@/` en `tsconfig` + `vite.config` para evitar `../../../`.
- **Barrel exports** por feature: `features/comercios/index.ts` exporta el API público.
- **Client boundary**: nada en `features/*/api.ts` se importa desde componentes; sólo pasa por `hooks.ts`.
- **No props drilling > 2 niveles**: subir a contexto o query cache.
- **Tailwind**: utilidades para una-tarea; abstraer en `@layer components` sólo patrones con ≥3 usos.
- **Idiomas**: un solo archivo `lib/copy.ts` para strings recurrentes, deja la opción de i18n futura sin invadir todo.

---

## 3. Backend — Supabase

### 3.1 Schema SQL

Archivo: `supabase/migrations/0001_init.sql` (no más SQL comentado dentro de `.ts`).

```sql
-- ─── Extensiones ─────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";       -- búsqueda fuzzy
create extension if not exists "postgis";       -- geo para mapa
create extension if not exists "unaccent";      -- búsqueda sin tildes

-- ─── Enums ────────────────────────────────────────────────────
create type categoria_comercio as enum (
  'picadas', 'dulces', 'chicha', 'servicios',
  'tramites', 'turismo', 'cultura', 'emergencias'
);

create type plan_socio as enum ('free', 'verificado', 'pro');

create type estado_dato as enum ('socio_pro', 'verificado', 'por_confirmar');

create type estado_solicitud as enum (
  'pendiente', 'en_revision', 'aprobada', 'rechazada'
);

create type rol_usuario as enum ('vecino', 'socio', 'admin');

-- ─── Perfiles (extensión de auth.users) ──────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  rol rol_usuario not null default 'vecino',
  telefono text,
  creado_en timestamptz default now()
);

-- ─── Comercios ────────────────────────────────────────────────
create table public.comercios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                           -- /lugar/dulces-issa
  nombre text not null,
  subtitulo text,
  categoria categoria_comercio not null,
  descripcion text,
  direccion text,
  telefono text,
  whatsapp text,
  web text,
  email text,
  horario_json jsonb,                                  -- {lun: "08:00-20:00", ...}
  precio text,                                         -- "$" | "$$" | "$$$"
  destacados text[],
  coords geography(point, 4326),                       -- GeoJSON Point
  pin_color text,
  pin_icon text,
  imagen_hero text,                                    -- path en Storage
  galeria text[],                                      -- paths en Storage
  rating numeric(3,2),                                 -- 0.00 – 5.00 (cache)
  reviews_count int default 0,                         -- cache
  plan plan_socio not null default 'free',
  estado estado_dato not null default 'por_confirmar',
  verificado_en timestamptz,
  verificado_por uuid references public.profiles(id),
  owner_id uuid references public.profiles(id) on delete set null,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

create index comercios_categoria_idx on public.comercios(categoria);
create index comercios_estado_idx on public.comercios(estado);
create index comercios_coords_idx on public.comercios using gist(coords);
create index comercios_nombre_trgm_idx on public.comercios using gin(nombre gin_trgm_ops);
create index comercios_slug_idx on public.comercios(slug);

-- ─── Eventos ──────────────────────────────────────────────────
create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  descripcion text,
  categoria text,                                      -- cultural, deporte, gastro…
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz,
  lugar_texto text,
  comercio_id uuid references public.comercios(id) on delete set null,
  coords geography(point, 4326),
  imagen text,
  precio_texto text,
  gratis boolean default true,
  organizador_id uuid references public.profiles(id) on delete set null,
  estado estado_dato not null default 'por_confirmar',
  creado_en timestamptz default now()
);

create index eventos_fecha_idx on public.eventos(fecha_inicio);
create index eventos_categoria_idx on public.eventos(categoria);

-- ─── Solicitudes de inscripción / reclamo de ficha ────────────
create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('alta', 'reclamo', 'actualizacion')),
  comercio_id uuid references public.comercios(id) on delete set null,
  solicitante_id uuid references public.profiles(id) on delete set null,
  nombre_comercio text not null,
  contacto text not null,
  categoria categoria_comercio,
  direccion text,
  mensaje text,
  foto_url text,
  plan_sugerido plan_socio default 'free',
  estado estado_solicitud not null default 'pendiente',
  revisor_id uuid references public.profiles(id),
  notas_internas text,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

create index solicitudes_estado_idx on public.solicitudes(estado);

-- ─── Reseñas ──────────────────────────────────────────────────
create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  comercio_id uuid not null references public.comercios(id) on delete cascade,
  autor_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  texto text,
  creado_en timestamptz default now(),
  unique(comercio_id, autor_id)                        -- una reseña por vecino
);

create index resenas_comercio_idx on public.resenas(comercio_id);

-- ─── Favoritos ────────────────────────────────────────────────
create table public.favoritos (
  profile_id uuid references public.profiles(id) on delete cascade,
  comercio_id uuid references public.comercios(id) on delete cascade,
  creado_en timestamptz default now(),
  primary key (profile_id, comercio_id)
);

-- ─── Conversaciones del Concierge (auditoría + mejora) ────────
create table public.concierge_turnos (
  id uuid primary key default gen_random_uuid(),
  sesion uuid not null,
  profile_id uuid references public.profiles(id),
  rol text not null check (rol in ('user','concierge')),
  texto text not null,
  skill text,
  latencia_ms int,
  creado_en timestamptz default now()
);

create index concierge_sesion_idx on public.concierge_turnos(sesion);

-- ─── Triggers útiles ──────────────────────────────────────────
create or replace function public.set_actualizado_en()
returns trigger language plpgsql as $$
begin new.actualizado_en = now(); return new; end $$;

create trigger comercios_touch before update on public.comercios
for each row execute function public.set_actualizado_en();

create trigger solicitudes_touch before update on public.solicitudes
for each row execute function public.set_actualizado_en();

-- Auto-crear perfil al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Rating cache cuando cambia una reseña
create or replace function public.refresh_rating_comercio()
returns trigger language plpgsql as $$
begin
  update public.comercios
  set rating = (
    select round(avg(rating)::numeric, 2) from public.resenas
    where comercio_id = coalesce(new.comercio_id, old.comercio_id)
  ),
  reviews_count = (
    select count(*) from public.resenas
    where comercio_id = coalesce(new.comercio_id, old.comercio_id)
  )
  where id = coalesce(new.comercio_id, old.comercio_id);
  return null;
end $$;

create trigger resenas_refresh_rating
after insert or update or delete on public.resenas
for each row execute function public.refresh_rating_comercio();
```

### 3.2 Row Level Security

```sql
-- Activar RLS en todas las tablas públicas
alter table public.profiles enable row level security;
alter table public.comercios enable row level security;
alter table public.eventos enable row level security;
alter table public.solicitudes enable row level security;
alter table public.resenas enable row level security;
alter table public.favoritos enable row level security;
alter table public.concierge_turnos enable row level security;

-- Helper: ¿es admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- ─── profiles ─────────────────────────────────────────────────
create policy "lectura pública de perfiles básicos"
  on public.profiles for select using (true);

create policy "uno actualiza su propio perfil"
  on public.profiles for update using (auth.uid() = id);

-- ─── comercios ────────────────────────────────────────────────
create policy "lectura pública"
  on public.comercios for select using (true);

create policy "dueño edita su comercio"
  on public.comercios for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "admin puede todo en comercios"
  on public.comercios for all using (public.is_admin()) with check (public.is_admin());

-- ─── eventos ──────────────────────────────────────────────────
create policy "lectura pública de eventos"
  on public.eventos for select using (true);

create policy "organizador crea evento propio"
  on public.eventos for insert with check (auth.uid() = organizador_id);

create policy "organizador edita evento propio"
  on public.eventos for update using (auth.uid() = organizador_id);

create policy "admin modera eventos"
  on public.eventos for all using (public.is_admin()) with check (public.is_admin());

-- ─── solicitudes ──────────────────────────────────────────────
create policy "cualquiera envía solicitud"
  on public.solicitudes for insert with check (true);

create policy "uno ve su solicitud"
  on public.solicitudes for select
  using (auth.uid() = solicitante_id or public.is_admin());

create policy "admin modera solicitud"
  on public.solicitudes for update using (public.is_admin()) with check (public.is_admin());

-- ─── reseñas ──────────────────────────────────────────────────
create policy "lectura pública"
  on public.resenas for select using (true);

create policy "usuario autenticado reseña"
  on public.resenas for insert with check (auth.uid() = autor_id);

create policy "autor edita su reseña"
  on public.resenas for update using (auth.uid() = autor_id);

create policy "autor borra su reseña"
  on public.resenas for delete using (auth.uid() = autor_id);

-- ─── favoritos ────────────────────────────────────────────────
create policy "uno ve sus favoritos"
  on public.favoritos for select using (auth.uid() = profile_id);

create policy "uno marca favorito"
  on public.favoritos for insert with check (auth.uid() = profile_id);

create policy "uno desmarca favorito"
  on public.favoritos for delete using (auth.uid() = profile_id);

-- ─── concierge_turnos (sólo inserción desde Edge Function) ────
create policy "nadie escribe directo, solo service_role"
  on public.concierge_turnos for all using (false) with check (false);
```

### 3.3 Storage

```sql
-- Dos buckets: público (imágenes de comercios/eventos) y privado (adjuntos de solicitudes)
insert into storage.buckets (id, name, public) values ('comercios', 'comercios', true)
  on conflict do nothing;
insert into storage.buckets (id, name, public) values ('solicitudes', 'solicitudes', false)
  on conflict do nothing;

-- Política: dueño sube imagen a su comercio
create policy "dueño sube en comercios/"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'comercios'
    and exists (
      select 1 from public.comercios c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = auth.uid()
    )
  );
```

### 3.4 Auth

- **Vecino**: `signInWithOtp` (magic link por email) o login social (Google). Rol `vecino`.
- **Socio Pro**: mismo signup, pero al aprobarle una solicitud el admin cambia `profiles.rol = 'socio'` y setea `comercios.owner_id`. Desde ese momento puede entrar a `/admin/mi-negocio`.
- **Admin**: rol `admin` asignado manualmente al arrancar. El panel `/admin` chequea `is_admin()`.

Provider en `features/auth/AuthProvider.tsx`:

```tsx
// features/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface Ctx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !supabase) { setProfile(null); setLoading(false); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => { setProfile(data); setLoading(false); });
  }, [session]);

  const signOut = async () => { await supabase?.auth.signOut(); };

  return (
    <AuthCtx.Provider value={{
      session, user: session?.user ?? null, profile, loading, signOut,
    }}>{children}</AuthCtx.Provider>
  );
}
```

Guard de ruta:

```tsx
// features/auth/RequireRole.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function RequireRole({
  roles, children,
}: { roles: Array<"vecino"|"socio"|"admin">; children: React.ReactNode }) {
  const { loading, profile } = useAuth();
  if (loading) return null;           // o spinner
  if (!profile) return <Navigate to="/login" replace />;
  if (!roles.includes(profile.rol)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

### 3.5 Edge Function — Concierge

Mover Gemini fuera del cliente. Crear `supabase/functions/concierge/index.ts`:

```ts
// supabase/functions/concierge/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const GEMINI = Deno.env.get("GEMINI_API_KEY")!;
const SYSTEM_PROMPT = `... (copiar de conciergeKnowledge.ts SYSTEM_PROMPT_GEMINI)`;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Rate limit simple por IP (Upstash/Redis o tabla tabla concierge_rate)
  const { messages, sesion } = await req.json();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages,
        generationConfig: { maxOutputTokens: 512, temperature: 0.6 },
      }),
    }
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Concierge fuera de línea" }), {
      status: 503, headers: { "Content-Type": "application/json" },
    });
  }
  const data = await res.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Audit log (service role)
  // await supabase.from("concierge_turnos").insert({...});

  return new Response(JSON.stringify({ texto }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});
```

Despliegue:
```bash
supabase secrets set GEMINI_API_KEY=...
supabase functions deploy concierge
```

Luego en `useConcierge.ts` la función `consultarGemini` pasa a ser:

```ts
async function consultarConcierge(pregunta: string, historial: MensajeChat[]) {
  const res = await fetch(`${env.SUPABASE_URL}/functions/v1/concierge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY },
    body: JSON.stringify({
      sesion: sessionId(),
      messages: [
        ...historial.slice(-6).map(m => ({
          role: m.rol === "usuario" ? "user" : "model",
          parts: [{ text: m.texto }],
        })),
        { role: "user", parts: [{ text: pregunta }] },
      ],
    }),
  });
  if (!res.ok) throw new Error("concierge offline");
  return (await res.json()).texto as string;
}
```

La API key de Gemini nunca sale del servidor. Se puede rate-limitar por IP y registrar `concierge_turnos` para análisis de calidad.

### 3.6 Generación de tipos

```bash
# Una vez, tras correr migraciones
npx supabase gen types typescript --project-id <id> --schema public > src/lib/database.types.ts
```

Añadir a `package.json`:
```json
"scripts": {
  "db:types": "supabase gen types typescript --linked --schema public > src/lib/database.types.ts",
  "db:push":  "supabase db push"
}
```

Con esto, `Comercio` pasa a ser `Database["public"]["Tables"]["comercios"]["Row"]` — un cambio de columna rompe TypeScript al tiro.

---

## 4. Performance

### 4.1 Code splitting

En `App.tsx`:

```tsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { RouteFallback } from "@/components/feedback/RouteFallback";

const Home       = lazy(() => import("@/routes/web/Home"));
const Directory  = lazy(() => import("@/routes/web/Directory"));
const Agenda     = lazy(() => import("@/routes/web/Agenda"));
const Mapa       = lazy(() => import("@/routes/web/Mapa"));
const Socio      = lazy(() => import("@/routes/web/Socio"));
const LugarDet   = lazy(() => import("@/routes/web/LugarDetalle"));
const AppShell   = lazy(() => import("@/routes/app/AppShell"));
const AdminShell = lazy(() => import("@/routes/admin/AdminShell"));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/"             element={<WebShell />}>
              <Route index             element={<Home />} />
              <Route path="directorio" element={<Directory />} />
              <Route path="agenda"     element={<Agenda />} />
              <Route path="mapa"       element={<Mapa />} />
              <Route path="socio"      element={<Socio />} />
              <Route path="lugar/:id"  element={<LugarDet />} />
            </Route>
            <Route path="/app/*"   element={<AppShell />} />
            <Route path="/admin/*" element={<AdminShell />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

En `vite.config.ts` añadir manual chunks para separar vendor:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ["react", "react-dom", "react-router-dom"],
        supabase: ["@supabase/supabase-js"],
        icons: ["lucide-react"],
      },
    },
  },
  target: "es2020",
},
```

Con esto el chunk principal cae por debajo de 150kb y cada ruta carga su ~40-80kb bajo demanda.

### 4.2 Imágenes

Hoy las imágenes son gradientes CSS (placeholder) y `/images/bg-curacavi.png` se carga como `background-image`. Plan:

- **Formato**: WebP con fallback JPEG. Servir AVIF cuando el CDN lo soporte (Supabase Storage no transforma; Cloudflare Images o `imgproxy` frente al bucket resuelven).
- **Responsive**: generar variantes 480 / 768 / 1200 / 1920. Un helper:

```tsx
// components/ui/Image.tsx
interface Props {
  src: string;       // ruta absoluta o key de Storage
  alt: string;
  sizes?: string;
  aspect?: string;   // "16/9", "1/1"
  priority?: boolean; // hero — no lazy
}

export function Image({ src, alt, sizes = "100vw", aspect = "16/9", priority }: Props) {
  const srcSet = [480, 768, 1200, 1920]
    .map(w => `${transform(src, w)} ${w}w`).join(", ");
  return (
    <img
      src={transform(src, 1200)}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      style={{ aspectRatio: aspect }}
      className="w-full object-cover"
    />
  );
}
```

- **Hero**: `priority` para la del `Home`, `fetchpriority="high"`, `preload` en `<head>`.
- **CSS background → `<img>`**: donde sea posible. Los `style={{ background: l.imagen }}` con gradiente están OK como placeholder, pero cuando lleguen fotos reales debe ser `<Image>`.

### 4.3 Bundle analysis

Agregar:
```bash
npm i -D rollup-plugin-visualizer
```
```ts
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";
plugins: [react(), visualizer({ open: false, filename: "dist/stats.html" })]
```
Correr `npm run build` y abrir `dist/stats.html` para cerrar cualquier chunk gordo.

### 4.4 React best practices

- `React.memo` en `ComercioCard`, `EventListItem`, `RecommendedCard` — se renderizan en listas largas.
- `useCallback` en handlers que se pasan a hijos memoizados.
- **`key` correcto**: nunca `index` en listas de comercios (si se reordena se borra estado hijo).
- Evitar `useEffect` para cosas derivables — `useMemo` cuando se puede.
- No importar `lucide-react` completo si se usa tree-shaking: OK con import nombrado, pero vigilar que `sideEffects: false` esté respetado.
- Suspense + `use()` en cascada cuando llegue React 19.

### 4.5 Datos

TanStack Query. Cliente en `lib/queryClient.ts`:

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,       // 1 min
      gcTime: 10 * 60_000,     // 10 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

Hook por feature, ej `features/comercios/hooks.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { listarComercios, obtenerComercio } from "./api";

export const useComercios = (filtro?: { categoria?: string }) =>
  useQuery({
    queryKey: ["comercios", filtro],
    queryFn: () => listarComercios(filtro),
  });

export const useComercio = (id: string) =>
  useQuery({
    queryKey: ["comercio", id],
    queryFn: () => obtenerComercio(id),
    enabled: Boolean(id),
  });
```

---

## 5. Funcionalidades críticas

### 5.1 Directorio de comercios (`/directorio`, `/app`)

**Hoy**: filtros por categoría + búsqueda por nombre en memoria (`src/pages/Directory.tsx:20-27`).
**Objetivo**:
- Filtros combinables: categoría, distancia (radio desde punto), abierto ahora, precio, rating mínimo, sólo verificados, sólo Socio Pro.
- Búsqueda full-text usando `pg_trgm` (`nombre gin_trgm_ops`) y `unaccent`.
- Resultado con orden por relevancia (pro > verificado > por confirmar) + geodesia.
- Infinite scroll (TanStack Query `useInfiniteQuery`) — 20 por página.
- URL params serializan filtros (deep-linkable).

Ejemplo de query:
```ts
export async function listarComercios(f: Filtro) {
  let q = supabase.from("comercios")
    .select("id, slug, nombre, subtitulo, categoria, direccion, precio, rating, plan, estado, imagen_hero")
    .order("plan", { ascending: false })
    .order("estado", { ascending: true })
    .order("rating", { ascending: false, nullsFirst: false })
    .range(f.offset, f.offset + 19);
  if (f.categoria) q = q.eq("categoria", f.categoria);
  if (f.q)         q = q.or(`nombre.ilike.%${f.q}%,subtitulo.ilike.%${f.q}%`);
  if (f.soloPro)   q = q.eq("plan", "pro");
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
```

### 5.2 Agenda de eventos (`/agenda`, `/app/agenda`)

**Hoy**: mock hardcoded, filtros visuales sin lógica, date stripe estático.
**Objetivo**:
- Query por rango de fecha + categoría.
- Filtro server-side sobre `fecha_inicio between :from and :to`.
- Tabs: Destacados / Fin de semana / Próximos 7 días / Por categoría — cada tab es un `queryKey` distinto.
- Componente `<DateStripe />` derivado de hoy con `date-fns` (agregar dep).
- Deep-link `/evento/:slug`.

### 5.3 Mapa interactivo (`/mapa`, `/app/explorar`)

**Hoy**: ambas son SVG hand-drawn.
**Objetivo**: migrar a MapLibre GL (gratis, sin API key) con style Maptiler u OSM tiles. Cargar lazily.

```tsx
// features/mapa/MapaLibre.tsx
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

useEffect(() => {
  const map = new maplibregl.Map({
    container: ref.current!,
    style: "https://demotiles.maplibre.org/style.json", // cambiar a tile propio
    center: [-71.137, -33.403],   // Curacaví
    zoom: 13,
  });
  comercios.forEach(c => {
    new maplibregl.Marker({ color: c.pin_color ?? "#1B4332" })
      .setLngLat([c.coords.lng, c.coords.lat])
      .setPopup(new maplibregl.Popup().setHTML(`<b>${c.nombre}</b>`))
      .addTo(map);
  });
  return () => map.remove();
}, [comercios]);
```

Chunk pesa ~250kb — por eso es `lazy()`.

### 5.4 Concierge IA

Lo que ya está bien:
- Detección de intenciones local (emergencia/picadas/inscripción) antes de pegarle al LLM.
- Fallback de veracidad que intercepta recomendaciones a locales fuera del directorio.

Lo que hay que mover:
1. **Gemini al servidor** (Edge Function — ver 3.5). Cliente sólo ve `/functions/v1/concierge`.
2. **Knowledge base a tabla versionada**: hoy vive en `src/lib/conciergeKnowledge.ts`. Moverla a una tabla `concierge_kb(intent, keywords text[], response text, updated_at)` con admin UI para editar sin redeploy.
3. **RAG sobre comercios reales**: cuando el usuario pregunta "¿dónde como empanadas?", la Edge Function debe:
   - Detectar categoría.
   - Hacer query a `comercios` con `categoria='picadas'` + texto match.
   - Pasarle a Gemini los top 5 verificados como contexto "solo recomienda de esta lista".
4. **Persistencia de sesión**: `concierge_turnos` captura input/output para entrenamiento futuro y auditoría.
5. **Rate limit**: 30 req/hora/IP anónima, 200/usuario autenticado.
6. **Streaming**: pasar a `stream=true` + SSE cuando Gemini lo permita — percibido 3x más rápido.

### 5.5 Socio Pro (portal comerciante)

Rutas nuevas `/admin/mi-negocio`:

- **Onboarding**: una vez admin aprueba la `solicitud`, se asigna `owner_id` y se envía email con magic link.
- **Editor de ficha**: edita todo lo de `comercios` que le corresponde (nombre no, para evitar squatting). `RequireRole roles={["socio","admin"]}`.
- **Galería**: drag & drop a `storage.comercios/{id}/`.
- **Publicar evento**: insert a `eventos` con `organizador_id = auth.uid()`, `comercio_id` auto.
- **Estadísticas mínimas**: vistas a su ficha (`create table comercios_views(comercio_id, dia, vistas)` actualizado por trigger).

### 5.6 Panel Admin básico

`/admin`:
- **Bandeja de solicitudes**: listado con filtros por `estado`, botón Aprobar/Rechazar (setea `estado_solicitud`, si aprueba crea `comercios` row + envía invite).
- **Moderación**: lista de reseñas reportadas, flag para ocultar.
- **Contenidos**: CRUD de eventos destacados, banners, dato de la semana.
- **Knowledge base del Concierge**: CRUD de `concierge_kb`.

Stack recomendado: **Refine** (`@refinedev/core`) sobre Supabase, o una admin cruda con las mismas rutas. Para MVP, propio es más rápido y consistente con el diseño.

---

## 6. Plan por fases

**Supuesto**: 1 dev full-time (o equivalente). Los plazos son rangos honestos.

### Fase 0 — Higiene (2 días)

- [ ] `.gitignore`: `dist/`, `node_modules/`, `*.timestamp-*.mjs`, `/tmp-cache/`.
- [ ] Borrar los 5 `vite.config.ts.timestamp-*.mjs` del repo.
- [ ] Actualizar `.env.example` (añadir `VITE_GEMINI_API_KEY` con nota "TEMPORAL — se mueve a Edge Function") y `README.md` con instrucciones Supabase + Dev.
- [ ] Instalar y configurar **ESLint** (`@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`), **Prettier**, **husky** + `lint-staged` pre-commit.
- [ ] Añadir alias `@/` en `tsconfig.json` y `vite.config.ts`.
- [ ] Endurecer `tsconfig`: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- [ ] Restaurar `BrowserRouter` y crear un flag `VITE_USE_HASH_ROUTER` sólo para build single-file.
- [ ] Colapsar `mockData.ts` duplicados en `src/data/seed.ts` reconciliando taxonomía.

**Salida**: repo ordenado, linters verdes, un solo mock.

### Fase 1 — Consolidación arquitectura (1 semana)

- [ ] Mover `src/components/*` a `features/<dominio>/` + `components/ui/*` + `components/layout/*` según árbol objetivo.
- [ ] Partir `InscripcionSocioSkill.tsx` en 4 archivos (`index.tsx`, `PasoX.tsx`).
- [ ] Eliminar `RegistroSocioSkill.tsx` y sus flags *legacy* en `useConcierge`.
- [ ] Extraer primitivos: `<Chip>`, `<Card>`, `<DateCap>`, `<Sheet>`, `<Rating>`.
- [ ] Migrar páginas web y screens mobile a consumir los primitivos.
- [ ] Reemplazar imports relativos por alias `@/`.
- [ ] Añadir `ErrorBoundary` y `RouteFallback`.

**Salida**: 0 duplicación, archivos > 300 l.

### Fase 2 — Backend Supabase (1.5 semanas)

- [ ] Crear proyecto Supabase, activar Postgres 15.
- [ ] `supabase init`, carpeta `supabase/migrations`.
- [ ] Aplicar `0001_init.sql` (schema 3.1).
- [ ] Aplicar `0002_rls.sql` (3.2).
- [ ] Cargar 20-30 comercios semilla reales (script `seed.ts` → `supabase db seed`).
- [ ] `npm run db:types` → commit.
- [ ] Reemplazar mocks: `features/comercios/api.ts`, `features/eventos/api.ts`, `features/solicitudes/api.ts` contra Supabase.
- [ ] TanStack Query instalado y `QueryClientProvider` en `main.tsx`.
- [ ] Hooks `useComercios`, `useComercio`, `useEventos`, `useSolicitudCrear`.
- [ ] Páginas refactorizadas para usar los hooks (con `<Skeleton>` para loading).

**Salida**: app corre contra Supabase real, mock sólo como fallback en `VITE_SUPABASE_URL` ausente.

### Fase 3 — Auth + Socio Pro + Admin (1 semana)

- [ ] `AuthProvider`, `useAuth`, `RequireRole`.
- [ ] Rutas `/login`, `/admin/mi-negocio`, `/admin` detrás de `RequireRole`.
- [ ] Magic link flow + OAuth Google.
- [ ] Editor de ficha para Socio Pro.
- [ ] Bandeja de solicitudes (admin).
- [ ] Aprobación: trigger que crea `comercios` row y envía invite.

**Salida**: dueño de negocio puede reclamar su ficha y editarla.

### Fase 4 — Performance (3 días)

- [ ] `React.lazy` + `Suspense` por ruta.
- [ ] `manualChunks` en vite.
- [ ] Componente `<Image>` con srcset + lazy.
- [ ] Hero preload.
- [ ] Rollup visualizer → corregir cualquier chunk > 200kb.
- [ ] Lighthouse target: Mobile Performance ≥ 90, LCP < 2.5s.

**Salida**: bundle inicial < 150kb gz, LCP < 2.5s en 4G.

### Fase 5 — Concierge productivo (1 semana, en paralelo)

- [ ] Edge Function `concierge` con `GEMINI_API_KEY` como secret.
- [ ] Migrar `conciergeKnowledge.ts` a tabla `concierge_kb`.
- [ ] RAG sobre `comercios`: top-k antes de pasar a Gemini.
- [ ] `concierge_turnos` insert desde la Function.
- [ ] Rate limit por IP (upstash / kv / tabla).
- [ ] Streaming con SSE.
- [ ] Remover `VITE_GEMINI_API_KEY` del frontend.

**Salida**: Concierge que no expone keys, con RAG sobre data real.

---

## 7. Apéndice — código listo para pegar

Los snippets de 3.1 a 5.6 son ya "copy-paste ready". Aquí va lo que falta, complementario:

### A. `package.json` actualizado (deltas)

```json
{
  "scripts": {
    "dev":          "vite",
    "build":        "tsc && vite build",
    "preview":      "vite preview",
    "lint":         "eslint . --ext .ts,.tsx",
    "format":       "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "test":         "vitest",
    "test:ui":      "vitest --ui",
    "db:types":     "supabase gen types typescript --linked --schema public > src/lib/database.types.ts",
    "db:push":      "supabase db push",
    "analyze":      "vite build && open dist/stats.html"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.60.0",
    "maplibre-gl": "^4.7.0",
    "date-fns": "^3.6.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.5.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.10.0",
    "eslint-plugin-react": "^7.37.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-jsx-a11y": "^6.10.0",
    "prettier": "^3.3.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "rollup-plugin-visualizer": "^5.12.0"
  }
}
```

### B. `lib/env.ts` (valida env al arrancar)

```ts
import { z } from "zod";

const Env = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  VITE_USE_HASH_ROUTER: z.enum(["true","false"]).default("false"),
});

export const env = Env.parse(import.meta.env);
export const isSupabaseConfigured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
```

### C. Test ejemplar para `useConcierge`

```ts
// features/concierge/useConcierge.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConcierge } from "./useConcierge";

describe("useConcierge — detección de intención", () => {
  it("activa widget de seguridad ante emergencia", async () => {
    const { result } = renderHook(() => useConcierge());
    await act(() => result.current.enviarMensaje("me están robando"));
    expect(result.current.mostrarWidgetSeguridad).toBe(true);
  });

  it("activa picadas sin buscar Gemini cuando hay KB local", async () => {
    const { result } = renderHook(() => useConcierge());
    await act(() => result.current.enviarMensaje("dónde venden empolvados"));
    expect(result.current.mostrarPicadas).toBe(true);
  });

  it("aplica fallback de veracidad a consultas no verificadas", async () => {
    const { result } = renderHook(() => useConcierge());
    await act(() => result.current.enviarMensaje("el restaurante X de la Cuesta"));
    const ultimo = result.current.mensajes.at(-1);
    expect(ultimo?.texto).toMatch(/no tengo verificado/i);
  });
});
```

### D. `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --run
      - run: npm run build
```

---

## 8. Decisiones abiertas (pido input antes de ejecutar Fase 2+)

1. **Hosting** del frontend: Vercel, Netlify o Cloudflare Pages? Sugiero **Cloudflare Pages** (build gratis ilimitado + imágenes + edge).
2. **Tiles del mapa**: MapLibre + MapTiler ($5/mes plan básico) vs OSM directo (gratis, marca OSM visible). Sugiero MapTiler.
3. **Email**: Supabase manda magic links OK, pero para transaccional (aprobaciones de solicitud) conviene **Resend** ($0 hasta 3k emails/mes).
4. **Dominio y SSL**: ¿`datocuracavi.cl` registrado? Si aún no, partir ya — caduca lo obvio.
5. **Observabilidad**: Sentry (free tier) para errores frontend + Supabase logs. ¿Alcance?

---

## 9. Qué puedo ejecutar ahora mismo

Si me das luz verde:

- **Inmediato (próxima sesión)**: aplicar Fase 0 completa (higiene, lint, alias, BrowserRouter, consolidar mocks).
- **Siguiente**: escribir las migraciones `0001_init.sql` y `0002_rls.sql` como archivos reales en `supabase/` y un seed.ts con los 20-30 comercios que saquemos del KNOWLEDGE.md.
- **Cuando tengas Supabase**: correr migraciones, generar tipos, refactor API a queries reales.

*Listo para arrancar por donde prefieras.*
