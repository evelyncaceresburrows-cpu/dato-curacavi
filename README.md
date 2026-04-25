# Dato Curacaví

**La guía vecinal del valle** — picadas, ferias, chicha, servicios y trámites de Curacaví, ordenados para vecinos y para los que andan de paso por la Ruta 68.

---

## Stack

- **Frontend**: React 18 + TypeScript + Vite 5
- **Estilos**: Tailwind CSS v3 (tokens Bosque / Arena / Carbon / Humo)
- **Data fetching**: TanStack Query v5 con fallback a semilla local
- **Routing**: React Router v6 (lazy routes + Suspense)
- **SEO**: react-helmet-async + JSON-LD (schema.org)
- **Validación**: Zod (discriminated union negocio / evento)
- **Backend**: Supabase (Postgres + RLS + Auth magic-link + Storage)
- **PWA**: manifest + icons maskable + theme color
- **Analytics**: privacy-friendly vía `navigator.sendBeacon` (Plausible/Umami compatible)
- **Deploy**: Vercel + GitHub Actions CI

---

## Setup local

```bash
npm install
cp .env.example .env.local  # completa valores (opcional — sin Supabase corre en modo demo)
npm run dev
```

Abre `http://localhost:5173`.

### Modo demo

Si no configuras `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, la app usa la semilla local (`src/data/seed.ts`). Esto permite demos en terreno sin red y evita romper Lovable u otros sandboxes.

---

## Variables de entorno

Copiadas de `.env.example`:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_SUPABASE_URL` | No | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | No | Anon key pública |
| `VITE_SITE_URL` | Sí (prod) | Dominio canónico (ej. `https://datocuracavi.cl`) |
| `VITE_ANALYTICS_ENDPOINT` | No | URL del endpoint Plausible/Umami/propio |
| `VITE_ANALYTICS_DOMAIN` | No | Dominio a reportar en el payload |
| `VITE_USE_HASH_ROUTER` | No | `"true"` para usar HashRouter (preview `file://`) |
| `VITE_ENABLE_MOBILE_PROTOTYPE` | No | Habilita el prototipo iPhone-style en `/app/*` |

---

## Scripts

```bash
npm run dev          # Dev server con HMR
npm run typecheck    # tsc --noEmit
npm run build        # Build producción (dist/)
npm run preview      # Preview del build
npm run sitemap      # Regenera public/sitemap.xml desde el seed
npm run build:singlefile  # Build monolítico (1 HTML con JS inline) para previews
```

`prebuild` corre automáticamente antes de `build` y regenera el sitemap.

---

## Estructura

```
src/
├── App.tsx                      # QueryClientProvider, router con lazy routes
├── main.tsx                     # HelmetProvider, initAnalytics
├── components/
│   ├── SEO.tsx                  # Helmet wrapper (title + OG + JSON-LD)
│   ├── ErrorBoundary.tsx        # Fallback UI para errores de render
│   └── ui/…                     # Chip, Card, Rating, DateCap
├── pages/                       # Home, Directory, Agenda, Mapa, Lugar, Evento, Socio, NotFound
├── data/
│   ├── seed.ts                  # COMERCIOS, EVENTOS, CATEGORIAS (fuente de verdad)
│   └── hooks/                   # useComercios, useEventos, useCrearSolicitud, useAuth
├── lib/
│   ├── supabase.ts              # Cliente (modo demo si faltan envs)
│   ├── solicitudesApi.ts        # POST solicitudes + legacy wrapper
│   ├── solicitudSchema.ts       # Zod discriminated union + flattenZodErrors
│   ├── storage.ts               # uploadImagen (5 MB máx, Supabase Storage)
│   ├── analytics.ts             # track + Events canónicos + initAnalytics
│   └── seoLd.ts                 # localBusinessLd, eventoLd, organizationLd, breadcrumbLd
├── scripts/
│   └── build-sitemap.mjs        # Extrae slugs del seed y genera sitemap.xml
└── supabase/migrations/
    ├── 0001_init.sql            # Tablas comercios, eventos, solicitudes
    ├── 0002_rls.sql             # Row Level Security
    └── 0003_security.sql        # Rate limit + sanitize + storage bucket
```

---

## Backend Supabase

### Migrations

Correr en orden:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_rls.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_security.sql
```

O desde el Dashboard: **SQL Editor → Run**.

### Qué habilita cada migration

- **0001_init**: `comercios`, `eventos`, `solicitudes`, `membresias`, índices + `updated_at` triggers.
- **0002_rls**: RLS en todas las tablas; lectura pública, escritura de solicitudes anónima, edición solo al dueño de la ficha (vía auth).
- **0003_security**: trigger `rate_limit_solicitudes` (máx. 5 inserts por IP cada 10 min), trigger `sanitize_solicitud` (trim + largos), bucket `solicitudes` con policies de storage.

### Storage

Bucket público `solicitudes/` para imágenes subidas desde el formulario. 5 MB máx. por archivo; validación JPG/PNG/WEBP en `src/lib/storage.ts`.

---

## SEO & analytics

### Estructurado

- `<SEO>` por página inyecta title, description, canonical, OpenGraph, Twitter y JSON-LD.
- `/lugar/:slug` emite `LocalBusiness` + `BreadcrumbList`.
- `/evento/:slug` emite `Event` + `BreadcrumbList`.
- Home emite `Organization`.

### Sitemap

`public/sitemap.xml` se regenera con cada build (`scripts/build-sitemap.mjs`). Incluye rutas estáticas + todos los slugs de comercios/eventos.

### Analytics privacy-friendly

`src/lib/analytics.ts` usa `navigator.sendBeacon` contra `VITE_ANALYTICS_ENDPOINT`. Si el endpoint está vacío, solo loggea en consola (dev). Sin cookies, sin localStorage.

Eventos canónicos (ver `Events` en `analytics.ts`): `publicar_submit`, `publicar_error`, `socio_pro_cta`, `whatsapp_click`, `llamada_click`, `navegar_click`, `buscar`, `categoria_filtro`, `lugar_view`, `evento_view`.

---

## Seguridad

- **CSP** (vía `vercel.json` headers): limita `connect-src` a Supabase + Plausible; bloquea `frame-ancestors`.
- **Rate limit**: máx. 5 solicitudes / 10 min por IP (trigger Postgres).
- **Honeypot**: campo `sitio_web` invisible en el formulario; si se llena, respondemos "ok" falso sin guardar.
- **Validación cliente**: Zod con regex Chile para teléfonos, formato fecha/hora, largos.
- **Sanitización servidor**: trigger `sanitize_solicitud` aplica trim + límites de largo.
- **HSTS + X-Content-Type-Options + Referrer-Policy + Permissions-Policy**: todos vía headers Vercel.

---

## Deploy a producción

### Vercel (recomendado)

1. Conectar repo a Vercel → autodetecta Vite.
2. Configurar env vars en el Dashboard:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL=https://datocuracavi.cl`
   - `VITE_ANALYTICS_ENDPOINT` + `VITE_ANALYTICS_DOMAIN` (opcional)
3. Asignar dominio `datocuracavi.cl`.
4. Push a `main` → deploy automático.

`vercel.json` ya contiene:
- SPA rewrites para React Router
- CSP + headers de seguridad
- Cache agresivo para `/assets/*` (immutable) y moderado para `/images/*`

### CI/CD

`.github/workflows/ci.yml` corre en cada PR:
- Typecheck (`tsc --noEmit`)
- Build (valida que compila limpio)
- Sube el `dist/` como artifact

---

## Diseño

- **Paleta**: Bosque `#1F6B45` (acción), Arena `#f5efe3` (fondo), Carbon `#1A1A1A` (texto), Humo `#6B6B6B` (secundario).
- **Tipografía**: Montserrat 400/600/700/800/900 (todo el sistema — ver `index.html` preload).
- **Espaciado**: `p-6`/`p-8`, `gap-6`/`gap-8`, bordes `rounded-2xl`/`rounded-3xl`.
- **Mobile-first**: breakpoint `md:` (768px). Tabs bottom bar en mobile, top nav en desktop.

---

## Tono editorial

Copy vecinal chileno, sin anglicismos ni jerga startupera:

- `"Oiga vecino, ¿qué anda buscando?"`
- `"¡Pásele, vecino!"`
- `"Llamar al tiro"`
- `"¡Chuta! Se nos cayó el sistema, pero estamos arreglándolo al tiro"`

---

## Licencia

Pendiente. Mientras tanto, © 2026 Dato Curacaví.
