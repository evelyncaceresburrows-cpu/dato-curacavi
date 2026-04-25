# Dato 68 — Launch Ready Checklist
_Fecha: 25 abr 2026 · Estado: listo para salir con 1 paso DB pendiente_

---

## TL;DR

La app está estable, tipada, sin errores de build, con analytics conectados, mobile auditado y buscador validado contra 10 casos reales. **Hay un único bloqueante** antes de prender el flujo de Supabase: aplicar la migration `0005_solicitudes_ruta68.sql`. Todo lo demás es verde.

---

## Bloqueantes (sí o sí antes de lanzar)

### 1. Aplicar migrations en Supabase, en orden
Si recién partís, corré las cuatro primeras y luego la nueva:

```
0001_init.sql
0002_rls.sql
0003_security.sql
0004_dato68.sql      ← ya verificada idempotente
0005_solicitudes_ruta68.sql   ← NUEVA, agrega comuna + tiempo_visita_min a `solicitudes`
```

**Por qué `0005` es crítico:** sin esta migration, el form `/socio` enviará `comuna` y `tiempo_visita_min` a un insert cuyas columnas no existen y el envío fallará con `column "comuna" of relation "solicitudes" does not exist`. Es la única razón por la que el form no está 100% verde hoy.

Cómo aplicar: SQL Editor de Supabase → pegar el contenido de `supabase/migrations/0005_solicitudes_ruta68.sql` → Run. Es idempotente, seguro de re-correr.

### 2. Variables de entorno en Vercel
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- (opcional) `VITE_PLAUSIBLE_DOMAIN` si querés analytics

Sin esas variables el cliente cae al modo demo (seed local). Útil para preview, no para producción.

---

## Verde — completado en esta vuelta

### Schema DB Ruta 68 (`0004_dato68.sql`)
- Tabla `comunas` extensible (no enum), seed 8 nodos del corredor (Pudahuel → Valparaíso) con `eje_ruta_km`.
- Tabla `tags` + pivots `comercio_tags` y `evento_tags` (modelo many-to-many, no categorías cerradas).
- Columnas nuevas en `comercios` y `eventos`: `comuna_id`, `eje_ruta_km`, `tiempo_visita_min`, `precio_clp_aprox`, `search_doc tsvector`.
- Triggers que mantienen `search_doc` con `setweight` A/B/C (nombre / categoría+tags / descripción+comuna), índice GIN.
- Vistas `v_comercios_busqueda` y `v_eventos_busqueda` para que el cliente lea con joins resueltos.
- RLS lectura pública en catálogo, escritura solo admin/owner.

### Buscador inteligente
- Diccionario chileno: `almuerzo barato`, `paseo en familia`, `me apretó la urgencia`, `lugar para estirar las piernas`, etc.
- Estrategia: Supabase FTS preferido, fallback al seed local si Supabase falla.
- 10 casos QA reproducidos (`qa/buscador-qa.mjs`): todos verdes.
- Bug arreglado en esta vuelta: `barato` ya no matchea `bar` (cambio de `includes` → matching por tokens consecutivos).

### Arma tu Ruta (`/ruta`)
- Planificador greedy puro, ordena por `eje_ruta_km`, respeta tiempo + presupuesto + tags + dirección (ida / vuelta / circuito).
- Origen "santiago" / "valparaiso" / id de comuna.
- Hidrata defaults por categoría cuando la ficha no trae metadata Ruta 68.
- Fallback de visualización con timeline numerada, km marker, costo, ETA viaje.

### Form Publica tu negocio (`/socio`)
- Campos `comuna` (select obligatorio, FK a `comunas.id`) y `tiempo_visita_min` (number, sólo en negocio, opcional).
- Validación zod: `comuna` requerida con mensaje "Elige tu comuna", `tiempo_visita_min` entre 5 y 720 min.
- Trazabilidad UI → state → schema → payload → API verificada de punta a punta.
- **Pendiente de DB:** correr `0005_solicitudes_ruta68.sql`.

### QA Mobile `/ruta`
Ajustes aplicados sin tocar diseño:
- `pb-32 md:pb-16` para que la `MobileTabBar` fija no tape el final del timeline.
- `aria-pressed` en botones toggle (origen, dirección, tags) → estado audible para lector de pantalla.
- `htmlFor`/`id` + `aria-label` + `aria-valuetext` en los tres `<input type="range">`.
- `tabular-nums` en valores numéricos (tiempo, presupuesto, paradas) y `truncate` defensivo en celdas del resumen para evitar overflow con números grandes.
- Build chunk Ruta: 14.17 kB / **4.68 kB gzip**, lazy.

### Analytics
Tres eventos canónicos del Ruta 68, todos disparándose:
- `armar_ruta` — al presionar **Armar mi ruta**, con `origen`, `direccion`, `tiempo_min`, `presupuesto_clp`, `tags`, `max_paradas`. (`Ruta.tsx:117`)
- `armar_ruta_parada` — al hacer click en una parada del timeline, con `slug` y `posicion`. (`Ruta.tsx:411`)
- `buscar_sugerencia` — al recibir un resultado del buscador con sugerencias para refinar (sinónimos / tags relacionados). Conectado en esta vuelta dentro de `useBuscar`, con ref para evitar doble-disparo. (`useBuscar.ts:60`)

### Performance + console
- Initial paint: index 35.49 + react 53.12 + css 10.20 = **~98.8 kB gzip**. Excelente.
- Per-página: chunks 2–5 kB gzip cada uno. Supabase (51.5 kB gzip) sólo se carga cuando una página lo necesita.
- Code-splitting por ruta + Suspense + ErrorBoundary activos.
- React Query con `staleTime 5 min` en buscador, `placeholderData` para no parpadear.
- Logs en consola: solo `console.warn` en fallbacks Supabase → seed (legítimo) y `console.error` en ErrorBoundary / mutación fallida (esperado). No hay `console.log` ruidoso.

---

## Recomendados (no bloquean lanzamiento)

- **Tagging real de fichas en producción.** Hoy la mayoría de los comercios del seed offline no tiene `comercio_tags` poblada. Casos como `baño`, `lluvia`, `de paso`, `romántico` salen en 0 hits hasta que el admin tagee fichas en Supabase. El motor funciona, falta data.
- **Campo `email` requerido**: en `solicitudSchema` está como opcional. Para soporte / replicar la solicitud al vecino conviene marcarlo `required` cuando el formulario madure.
- **Sitemap dinámico**: hoy `vercel.json` rutea bien pero no hay `/sitemap.xml`. SEO local va a agradecer uno generado desde la lista de comercios + eventos publicados.
- **Cache HTTP en Vercel** para `/ruta`, `/lugar/*`, `/evento/*` con `s-maxage=60, stale-while-revalidate=600` — la mayor parte del contenido es estable por minutos.

## Opcionales (post-lanzamiento)

- Dashboard admin para tagging masivo de fichas (hoy hay que ir a SQL Editor).
- Slider de presupuesto con tooltip de tramos ("comida / panorama corto / paseo largo / día completo").
- Compartir un plan armado vía URL persistente (`/ruta?origen=santiago&tiempo=240&tags=ninos,comida`).
- A11y avanzada: foco visible en chips activos (hoy se distingue por color, no por outline).

---

## Cómo desplegar (paso a paso)

1. **Supabase** → SQL Editor → pegar `0005_solicitudes_ruta68.sql` → Run.
2. **Vercel** → confirmar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en env vars.
3. `git push` a `main` (Vercel reconstruye solo).
4. Smoke test producción:
   - `/` carga sin errores en consola.
   - `/ruta` arma una ruta con sliders por defecto.
   - `/directorio` muestra fichas (verifica que vienen de Supabase, no del seed: en consola **no** debe aparecer `[useComercios] Supabase error, usando semilla`).
   - `/socio` envía una solicitud de prueba con tab "negocio", comuna "Curacaví", tiempo de visita 45 min → debe responder éxito.
   - Buscar `empanadas` en `/directorio` → debe sugerir `panaderia` o tags relacionados.
5. Monitorear Plausible/Umami por 24 h: que aparezcan los eventos `armar_ruta`, `armar_ruta_parada`, `publicar_submit`, `buscar_sugerencia`.

---

_Hecho en esta sesión:_
- `0005_solicitudes_ruta68.sql` (nuevo)
- `useBuscar.ts` (nueva integración con `buscar_sugerencia`)
- `Ruta.tsx` (a11y mobile + padding TabBar + tabular-nums)
- `qa/buscador-qa.mjs` y `lib/buscador.ts` ya tenían el fix de tokens del turno anterior

_Sin tocar:_ diseño, paleta, tipografía, tamaños de fuente, espaciados visibles. Sólo fixes de estabilidad y accesibilidad.
