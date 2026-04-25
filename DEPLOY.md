# DEPLOY.md — Dato Curacaví a producción

Runbook paso a paso para llevar la app a `https://datocuracavi.cl`. Tiempo estimado: **60–90 min** la primera vez, <5 min en cada deploy siguiente.

---

## 0. Pre-requisitos

- [ ] Dominio `datocuracavi.cl` registrado y con acceso al panel DNS.
- [ ] Cuenta GitHub (el código queda versionado y Vercel escucha push).
- [ ] Cuenta Vercel (plan Hobby gratis alcanza para el piloto).
- [ ] Cuenta Supabase (plan Free alcanza: 500 MB Postgres + 1 GB Storage).
- [ ] (Opcional) Cuenta Plausible o Umami para analytics.

---

## 1. Subir el repo a GitHub

```bash
cd dato-curacavi
git init
git add .
git commit -m "chore: initial commit — Dato Curacaví v1.0"
git branch -M main
git remote add origin git@github.com:TU-USUARIO/dato-curacavi.git
git push -u origin main
```

Verificá que `.github/workflows/ci.yml` se haya ejecutado en Actions y esté verde.

---

## 2. Crear proyecto Supabase

1. Entrá a [app.supabase.com](https://app.supabase.com) → **New Project**.
2. Nombre: `dato-curacavi-prod`. Región: `South America (São Paulo)` (la más cercana a Chile).
3. Guardá la contraseña del `postgres` en el password manager.
4. En **Project Settings → API**, copiá:
   - `Project URL` → será `VITE_SUPABASE_URL`
   - `anon public key` → será `VITE_SUPABASE_ANON_KEY`

### Correr migraciones

Opción A — **SQL Editor** (más simple):
1. Abrí **SQL Editor → New query**.
2. Pegá el contenido de `supabase/migrations/0001_init.sql` y corré.
3. Repetí para `0002_rls.sql` y `0003_security.sql`, **en ese orden**.

Opción B — **CLI**:
```bash
npx supabase link --project-ref TU-PROJECT-REF
npx supabase db push
```

### Verificar

En **Database → Tables** tenés que ver: `comercios`, `eventos`, `solicitudes`, `membresias`. En **Storage → Buckets**, el bucket `solicitudes` público.

---

## 3. Conectar Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → seleccioná el repo.
2. Framework Preset: **Vite** (se autodetecta).
3. **Environment Variables** (tab antes de deploy):

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` (paso 2) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` (paso 2) |
| `VITE_SITE_URL` | `https://datocuracavi.cl` |
| `VITE_ANALYTICS_ENDPOINT` | *(opcional, de Plausible/Umami)* |
| `VITE_ANALYTICS_DOMAIN` | `datocuracavi.cl` *(solo si hay endpoint)* |

4. **Deploy**. Primer build toma ~2 min.
5. Vercel te dará una URL tipo `dato-curacavi-xxx.vercel.app`. Abrila y testeá `/`, `/directorio`, `/agenda`, `/lugar/dulces-issa`, `/publicar`.

---

## 4. Apuntar el dominio

En Vercel → **Project Settings → Domains**:

1. Add domain → `datocuracavi.cl` → **Add**.
2. Vercel te muestra los records DNS a configurar. Típicamente:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
3. Aplicá esos records en el panel del registrar (NIC Chile, Cloudflare, GoDaddy, etc.).
4. Esperá propagación (5 min–2 h). Vercel te manda email cuando queda activo.
5. Certificado SSL se emite solo (Let's Encrypt).

---

## 5. Verificación final (smoke test)

Abrí `https://datocuracavi.cl` y corré este checklist:

- [ ] Home carga en <2 s en mobile 4G (usá Lighthouse o WebPageTest).
- [ ] `/directorio` muestra las 17 picadas y los filtros funcionan.
- [ ] `/lugar/dulces-issa` muestra ficha completa con rating + CTAs.
- [ ] El botón **WhatsApp** abre `wa.me/...` correcto.
- [ ] El botón **Ir ahora** abre Google Maps con ruta correcta.
- [ ] `/agenda` muestra los 5 eventos ordenados.
- [ ] `/publicar` valida campos vacíos y muestra errores inline en rojo.
- [ ] Completá el form con datos reales → confirma que aparece la fila en Supabase `solicitudes`.
- [ ] Subí una imagen al form → aparece en Supabase Storage `solicitudes/`.
- [ ] `view-source:` muestra JSON-LD `LocalBusiness` en `/lugar/...`.
- [ ] `https://datocuracavi.cl/sitemap.xml` retorna XML con 28 URLs.
- [ ] `https://datocuracavi.cl/robots.txt` retorna el contenido esperado.
- [ ] Headers en DevTools → Network: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` presentes.
- [ ] Rate limit: mandá 6 solicitudes en 1 min desde la misma IP → la 6ª falla con error 400.

---

## 6. Analytics (opcional — 10 min)

### Plausible self-hosted o Cloud

1. Creá el sitio `datocuracavi.cl` en Plausible.
2. En Vercel, agregá `VITE_ANALYTICS_ENDPOINT=https://plausible.io/api/event`.
3. Redeploy (Vercel lo hace solo al cambiar env vars).
4. Navegá el sitio y verificá que los events aparezcan en el dashboard Plausible.

### Eventos custom a monitorear

`publicar_submit`, `whatsapp_click`, `llamada_click`, `navegar_click`, `categoria_filtro`, `buscar`, `lugar_view`, `evento_view`, `socio_pro_cta`.

---

## 7. Post-lanzamiento

- [ ] Google Search Console: verificar dominio + subir `sitemap.xml`.
- [ ] Google Business Profile: listar "Dato Curacaví" como organización local.
- [ ] Crear mail `hola@datocuracavi.cl` (forwarding o Google Workspace).
- [ ] Publicar en redes: "ya estamos online vecino, pasá a conocer".
- [ ] Monitorear errores la primera semana (Vercel → Logs o Sentry si se agrega).

---

## Troubleshooting

**Build falla en Vercel con TS error**
→ Probá local: `npm run typecheck`. Si acá pasa, revisá que la versión de Node en Vercel sea **20** (Project Settings → General → Node Version).

**Form guarda en Supabase pero imagen no sube**
→ Revisá que el bucket `solicitudes` tenga las policies de `0003_security.sql`. En Storage → bucket → Policies.

**Rate limit no bloquea**
→ Supabase debe exponer `X-Forwarded-For` al Postgres (está por default). Si estás detrás de Cloudflare, usar `CF-Connecting-IP` en el trigger.

**SEO no aparece en Google después de 2 semanas**
→ Verificá `robots.txt` no bloquea, que el sitemap esté en Search Console, y que canonicals apunten al dominio real (no al `.vercel.app`).

---

## Rollback

Si algo sale mal post-deploy:

1. Vercel → Deployments → buscá el último deploy verde → **⋯ → Promote to Production**. Rollback instantáneo.
2. Si el problema es DB, las migraciones son idempotentes pero no reversibles automáticamente. Para rollback data: `TRUNCATE solicitudes;` (solo si el volumen es chico).
