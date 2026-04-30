# Informe completo — Dato 68
_Estado al 25 abril 2026 · Auditoría sobre código fuente real, no estimaciones._

URL productiva: **https://dato-curacavi.vercel.app**
Repo: `evelyncaceresburrows-cpu/dato-curacavi`
Backend: Supabase proyecto `twmblwdkcyldmvctjgwo` (region `sa-east-1`)

---

## 1. Resumen ejecutivo

Dato 68 es una guía vecinal del corredor Ruta 68 (Santiago → Valparaíso, eje Curacaví) construida como SPA responsive en React + Vite, deployada en Vercel, con backend en Supabase Postgres.

Estado actual:
- **9 páginas** funcionales con redesign visual unificado.
- **22 fichas de comercios + 5 eventos** en seed local con fotos editoriales Unsplash.
- **0 filas en Supabase productivo** — el sitio sirve hoy desde el seed (fallback).
- **Form de publicación** funcional contra Supabase con RLS para envío anónimo.
- **Buscador inteligente** con sinónimos chilenos + FTS Postgres (caída a búsqueda local).
- **Planificador "Arma tu Ruta"** greedy operativo.
- **Concierge (chatbot)** integrado con motor de keywords + opcional Gemini API.
- **6 migrations** SQL aplicadas + 0 errores en linter de seguridad Supabase.

---

## 2. Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React | 18.3.1 |
| Build | Vite | 5.4 |
| Routing | react-router-dom | 6.26 |
| Data fetching | TanStack Query | 5.99 |
| Forms / validación | zod | 4.3 |
| Tipografía UI | Inter Tight | 400-800 |
| Tipografía display | Fraunces | 400-600 |
| Estilos | Tailwind v3.4 + custom layer editorial |
| Iconos | lucide-react | 0.460 |
| Backend | Supabase (Postgres 17) | — |
| Auth | Supabase Auth | inactivo (uso anónimo) |
| Storage | Supabase Storage bucket `solicitudes` | activo |
| Deploy | Vercel Hobby | — |
| CI/CD | git push manual + `vercel --prod` | sin GitHub Actions |

---

## 3. Páginas (rutas)

### `/` — Home
Pantalla principal. Mobile-first con hero crepúsculo en desktop.

**Bloques** (de arriba abajo):
1. AppHeader mobile / NavBar desktop con DatoMark + 5 nav links
2. Hero desktop (≥768px): gradient atardecer + cordillera SVG + saludo + h1 Fraunces 56px + search box
3. Saludo dinámico mobile ("Buenos días, vecino") + hero search button con `⌘K`
4. Grid 4-col mobile / 8-col desktop de categorías (clic → filtra `/directorio?cat=`)
5. Banner "Arma tu domingo por el valle" verde-valle con DatoMark transparente
6. Carousel destacados 1-col mobile / 3-col desktop
7. Card próximo evento con sello fecha terracotta
8. CTA Publica dashed terracotta

**Datos**: hardcoded del `seed.ts` (top-3 mejor rating + primer evento del array). No usa `useComercios` / `useEventos` por simplicidad.

### `/directorio` — Directory
Búsqueda + filtrado de comercios.

**Bloques**:
1. AppHeader title="Directorio" + botón filtro
2. Search bar input controlado (filtra por nombre / subtítulo / descripción)
3. Filter chips horizontales (Todos + 10 categorías)
4. Counter "X lugares · ordenado por relevancia"
5. Lista vertical de cards horizontales 88x88 mobile → grid 2-col tablet → 3-col desktop
6. Empty state si no hay resultados

**Datos**: `useComercios()` → consulta a Supabase, fallback a seed.
**Sync URL**: `?cat=picadas` para deep links (lo escribe `useEffect`).
**Analytics**: `categoria_filtro` cada cambio de chip.

### `/lugar/:slug` — Ficha de comercio
Detalle de un comercio.

**Bloques**:
1. Hero foto 280px alto + back button
2. Sheet paper que sube -28px sobre el hero (radius 28px)
3. Eyebrow categoría terracotta + h1 Fraunces + subtítulo italic
4. Meta row: rating ★ + reviews + distancia + StatusBadge
5. Tres botones: WhatsApp (valley) / Llamar (cream) / Mi ruta (toggle terracotta)
6. Descripción Fraunces
7. Productos chips (de `comercio.destacados`)
8. Card horarios + dirección con mini-mapa decorativo + DatoMark + link a Google Maps
9. "Más [categoría]" — grid responsive 2-col mobile / 3-col desktop con BusinessCards

**SEO**: JSON-LD `LocalBusiness` + breadcrumb. `<title>` y meta description dinámicos.
**Analytics**: `lugar_view` al cargar; `whatsapp_click` / `llamada_click` / `navegar_click`.

### `/evento/:slug` — Ficha de evento
Mismo patrón que Lugar adaptado a evento.

**Bloques**:
1. Hero foto + back
2. Sheet paper + eyebrow categoría + h1
3. Meta: fecha larga español + hora + lugar + precio
4. Descripción Fraunces
5. Tags chips
6. Card "Organiza" (link a comercio asociado si existe)
7. "Otros eventos" 3-col

**SEO**: JSON-LD `Event` + breadcrumb.
**Analytics**: `evento_view`.

### `/agenda` — Agenda
Calendario y lista de eventos.

**Bloques**:
1. AppHeader title="Agenda" + botón Publicar
2. Mini-calendario del mes con dots de eventos (días con eventos en valley sólido)
3. Filter chips por categoría con emojis (Música 🎵, Gastro 🍽️, Cultura 🎭, Deporte ⚽, etc.)
4. Heading "Próximos eventos"
5. Lista 1-col mobile / 2-col desktop. Primer evento destacado (valley sólido + sun para sello fecha)

**Datos**: `useEventos()`.

### `/ruta` — Arma tu Ruta
Planificador greedy de paradas.

**Bloques**:
1. Header eyebrow terracotta + h1 "Arma tu *ruta*" italic
2. Form (col izq):
   - Origen: 2 botones (Desde Santiago / Desde Valparaíso)
   - Dirección: 3 botones (ida / vuelta / circuito)
   - Slider tiempo (60–600 min)
   - Slider presupuesto (0–150000 CLP)
   - Slider max paradas (1–6)
   - Tags grouped: Público / Presupuesto / Experiencia / Logística / Temporal / Urgencia
   - Botón "Armar mi ruta"
3. Resultado (col der):
   - Card resumen valley→valley-mid: paradas + tiempo + costo + km
   - Timeline numerada con cada parada (km marker, tiempo, costo, motivos)

**Lógica**: `armarRuta(input, comercios, comunas)` greedy en `eje_ruta_km`.
**Analytics**: `armar_ruta` al ejecutar; `armar_ruta_parada` al hacer click en parada.
**A11y**: `aria-pressed`, `htmlFor`/`id`, `aria-label` en sliders.

### `/socio` — Publicar (form)
Form para enviar negocio o evento.

**Bloques**:
1. Header editorial "Súmate a la *guía*"
2. Tab switcher (Mi negocio / Publicar evento)
3. Form con campos: nombre/título, descripción, categoría, comuna (select), dirección, teléfono, whatsapp, email, contacto, foto, [tiempo_visita_min solo en negocio], [fecha + hora solo en evento]
4. Honeypot oculto `sitio_web` (anti-bot)
5. Validación zod inline con mensajes
6. Estado `done` con confirmación

**Backend**: insert a `solicitudes` con RLS pública para insert. Después del insert NO se hace `.select()` (la policy SELECT solo deja a admin/editor leer; sería 401).
**Triggers**: rate-limit 5/10min por IP, sanitize_solicitud (trim + valida largo).
**Analytics**: `publicar_submit` éxito; `publicar_error` fallo.

### `/mapa` — Mapa
Vista placeholder con scroll horizontal de comercios.
**Estado**: implementación parcial. SVG plano con coords (0–100) sin tiles reales.

### `/publicar` — Alias de `/socio`
Misma página, ruta alternativa.

### `*` — NotFound
404 simple.

---

## 4. Componentes

### `src/components/lovable/` (12) — UI Claude Design
Implementaciones del mockup unificado:
- `DatoMark.tsx` — pin SVG con sol/cerros/campos del valle
- `Wordmark.tsx` — "Dato 68" Inter Tight 800 con `68` terracotta
- `SplashScreen.tsx` — pantalla 800ms primera visita (sessionStorage flag)
- `AppHeader.tsx` — header mobile con back / logo / acción
- `SectionHead.tsx` — h3 Fraunces + sub muted + acción
- `SectionTitle.tsx` — variante con kicker + lede + index editorial
- `BusinessCard.tsx` — card de comercio (variante list / grid)
- `EventCard.tsx` — card de evento (horizontal / compact)
- `CategoryChip.tsx` — chip de categoría seleccionable
- `OpenBadge.tsx` — pill "Abierto / Cerrado" con punto
- `StatusBadge.tsx` — versión mejorada con horario "Abierto · cierra 20:00"
- `DateStamp.tsx` — sello de fecha (día Fraunces + mes corto)

### `src/components/ui/` (5) — primitivos legacy
Quedan del diseño anterior; sólo se usan en algunas páginas no migradas.

### `src/components/` raíz — widgets de feature
- `FloatingConcierge.tsx` — botón flotante chatbot (179 líneas)
- `ConciergePanel.tsx` — panel chat del Concierge (291 líneas)
- `SecurityWidget.tsx` — widget emergencia *4129 (102 líneas)
- `InscripcionSocioSkill.tsx` — skill de "súmate" embebido en chat (591 líneas)
- `RegistroSocioSkill.tsx` — skill registro (157 líneas)
- `PicadasSkill.tsx` — skill recomendador picadas (262 líneas)
- `CategoryGrid.tsx`, `ComercioCard.tsx`, `DatoDeLaSemana.tsx`, `EstadoDelValle.tsx`, `HeroValle.tsx`, `NumerosDelVecino.tsx`, `SearchBar.tsx`, `TopographicPattern.tsx` — bloques heredados del diseño viejo. Algunos siguen consumidos, otros están muertos.
- `Icons.tsx` — set de iconos custom (pan, hojas, etc.)
- `SEO.tsx` — wrapper de `react-helmet-async`
- `ErrorBoundary.tsx` — barrera global de errores

---

## 5. Concierge (chatbot)

### Arquitectura
Motor híbrido de **dos capas**:
1. **Local-first**: knowledge base hardcodeada en `src/lib/conciergeKnowledge.ts` con keywords + respuestas.
2. **Opcional Gemini**: si existe `VITE_GEMINI_API_KEY`, las preguntas no resueltas localmente caen a Gemini con `SYSTEM_PROMPT_GEMINI` que restringe respuestas a Curacaví y directorios oficiales.

### Skills detectables (por keywords)
| Skill | Trigger | Acción |
|---|---|---|
| **Seguridad** | "robo", "asalto", "incendio", "urgencia", "*4129", … | Renderiza `SecurityWidget` con número *4129 |
| **Inscripción Socio** | "inscribir", "mi negocio", "publicar", "aparecer", … | Renderiza `InscripcionSocioSkill` (form embebido) |
| **Picadas** | "hambre", "comer", "almuerzo", "restoran", … | Renderiza `PicadasSkill` (recomienda del directorio verificado) |
| **Trámites** | "municipalidad", "patente", "permiso", … | Respuesta con info PLADECO |
| **Registro** | "ya soy socio", "modificar mi ficha", … | Renderiza `RegistroSocioSkill` |

### Directivas
- **No inventar locales**: si pregunta no matchea directorio verificado → `FALLBACK_NO_VERIFICADO`.
- **Mensaje de bienvenida**: tono vecinal "Mire vecino…".
- **Veracidad Local**: respuestas desde PLADECO + directorios oficiales Municipalidad.

### Estado
- KB local: completa (palabras clave por intent + respuestas + skill embebida).
- Gemini: NO está conectado en producción (no hay `VITE_GEMINI_API_KEY` en Vercel env vars).
- Trigger en UI: ícono flotante `FloatingConcierge` esquina inferior derecha.

---

## 6. Búsqueda inteligente

`src/lib/buscador.ts` (~370 líneas) + hook `useBuscar.ts` (debounce 250ms, TanStack Query con `staleTime: 5min`).

### Capacidades
- **Diccionario chileno**: 30 sinónimos chilenos. Ej: `"almuerzo barato"` → expande a `menú|colación` + tag:`barato`. `"paseo en familia"` → tag:`familia` + categoría panoramas.
- **Token-based matching**: previene falso positivo `"barato"` ≠ `"bar"` (corregido en QA).
- **Estrategia híbrida**:
  - Primero intenta Supabase FTS (índice GIN sobre `tsvector` con peso A/B/C en nombre/categoría/descripción).
  - Si falla (Supabase down, sin conexión, sin filas): cae a búsqueda local sobre `seed.ts`.
- **Resultado**: `{ comercios[], eventos[], sugerencias[], query: { raw, palabras, tags }, source: 'supabase'|'local' }`.

### Analytics
- `buscar_sugerencia` se dispara **una vez por query nueva** cuando la respuesta trae sugerencias (sinónimos / tags relacionados). Ref interno previene doble-disparo.

---

## 7. Arma tu Ruta (planificador)

`src/lib/armarRuta.ts` — función pura, sin React, sin Supabase.

### Lógica
1. Resuelve origen vía dict `ORIGEN_KM` (santiago=0, valparaiso=120) o lookup en tabla `comunas`.
2. Hidrata defaults por categoría cuando el comercio no tiene metadata Ruta 68 (eje_ruta_km, tiempo_visita_min, precio_clp_aprox).
3. Filtra candidatos:
   - Por tags (OR — al menos 1 match si hay tags seleccionados)
   - Por `comuna_id` (si especificada)
   - Por dirección (ida / vuelta / circuito)
4. Ordena por `eje_ruta_km` (lineal sobre Ruta 68).
5. Greedy: itera, acumula tiempo + costo. Break en límite de tiempo, skip por presupuesto.
6. Devuelve `{ paradas[], total_min, total_clp, km_recorridos, notas[] }`.

### Tags combinables
16 tags en 6 grupos:
- **Público**: ninos, familia, pareja, romantico, pet_friendly
- **Presupuesto**: barato, premium
- **Experiencia**: vino, comida, naturaleza
- **Logística**: de_paso, rapido, bano, lluvia
- **Temporal**: finde
- **Urgencia**: emergencia

---

## 8. Datos del seed

### Comercios — 17 fichas
| ID | Nombre | Categoría |
|---|---|---|
| `dulces-issa` | Dulces Issa | dulces |
| `chicha-estadio` | Chicha del Estadio Julio Riesco | chicha |
| `la-casona` | La Casona de Curacaví | picadas |
| `curacaribs` | CuracaRibs | picadas |
| `la-pica` | La Picá de Curacaví | picadas |
| `cafe-patio` | Café del Patio | picadas |
| `vina-altar-uco` | Viña Altar Uco | chicha |
| `chicheria-don-pancho` | Chichería Don Pancho | chicha |
| `panaderia-espiga` | Panadería La Espiga | dulces |
| `feria-libre` | Feria Libre Javiera Carrera | picadas |
| `parque-higgins` | Parque Ambrosio O'Higgins | panoramas |
| `farmacia-comunal` | Farmacia Comunal Curacaví | servicios |
| `talleres-curacavi` | Talleres Curacaví | servicios |
| `mecanica-compadre` | Mecánica El Compadre | servicios |
| `municipalidad` | Municipalidad de Curacaví | tramites |
| `seguridad-municipal` | Seguridad Municipal | emergencias |
| `bomberos` | Bomberos de Curacaví | emergencias |

### Eventos — 5 fichas
| ID | Nombre | Categoría |
|---|---|---|
| `fiesta-chicha-2026` | Fiesta de la Chicha 2026 | tradicional |
| `feria-libre` | Feria Libre de Curacaví | gastro |
| `noche-sabores` | Noche de Sabores | musica |
| `taller-ceramica` | Taller de Cerámica | cultura |
| `trekking-la-cruz` | Trekking Cerro La Cruz | deporte |

### Estado de las imágenes
- **22 fichas (17 comercios + 5 eventos)** → todas con foto Unsplash editorial libre de derechos optimizada (`w=1600&q=80&auto=format&fit=crop&fm=jpg`).
- **0 fichas con foto del local real** (declarado: son temporales).

### Categorías (10)
| Key | Label | Filas |
|---|---|---|
| picadas | Picadas | 5 |
| dulces | Dulces y panes | 2 |
| chicha | Chicherías y viñas | 3 |
| panoramas | Panoramas | 1 |
| servicios | Servicios | 3 |
| tramites | Trámites | 1 |
| emprendimientos | Emprendimientos | **0** |
| alojamientos | Alojamientos | **0** |
| cultura | Cultura | **0** |
| emergencias | Emergencias | 2 |

---

## 9. Backend Supabase

### Proyecto
- ID: `twmblwdkcyldmvctjgwo`
- Region: `sa-east-1` (São Paulo)
- Plan: Free
- URL: `https://twmblwdkcyldmvctjgwo.supabase.co`

### Tablas
| Tabla | Filas | Descripción |
|---|---|---|
| `comercios` | 0 | Fichas de negocios. Schema en 0001 + cols Ruta 68 en 0004. |
| `eventos` | 0 | Eventos. Idem. |
| `solicitudes` | 0 | Form Publica. Cols comuna+tiempo agregadas en 0005. |
| `comunas` | 8 | Pudahuel · Curacaví · María Pinto · Casablanca · Algarrobo · Quintay · Placilla · Valparaíso |
| `tags` | 16 | Catálogo de tags combinables. |
| `comercio_tags`, `evento_tags` | 0 | Pivots many-to-many. |
| `profiles` | 0 | Para futura auth de socios. |

### Migrations aplicadas (6)
1. `0001_init.sql` — schema base + enums + indexes
2. `0002_rls.sql` — Row-Level Security policies
3. `0003_security.sql` — rate-limit + sanitize + bucket Storage
4. `0004_dato68.sql` — comunas + tags + FTS + vistas v_comercios_busqueda / v_eventos_busqueda
5. `0005_solicitudes_ruta68.sql` — agrega comuna + tiempo_visita_min a `solicitudes`
6. `0006_security_hardening.sql` — fix `security_invoker` en views + `search_path` en funciones

### RLS modelo
- `comercios`, `eventos`: lectura pública si `publicado=true`. Escritura solo owner / admin.
- `solicitudes`: insert público (anónimo). Lectura/update solo admin/editor.
- `comunas`, `tags`: lectura pública. Escritura solo admin.

### Linter de seguridad Supabase
- 0 errores
- 4 warnings (intencionales, documentados): `pg_trgm` y `unaccent` en schema public, RLS pública en `solicitudes` (by design), bucket público de imágenes (necesario para form anónimo).

### Storage
- Bucket `solicitudes` público para imágenes subidas en form `/socio`.

---

## 10. Analytics

`src/lib/analytics.ts` — wrapper privacy-friendly (Plausible/Umami compatible vía `sendBeacon`).

### 13 eventos canónicos
| Evento | Cuándo se dispara |
|---|---|
| `publicar_submit` | Form `/socio` enviado OK |
| `publicar_error` | Form falla (RLS, rate-limit, validación) |
| `socio_pro_cta` | Click en CTA Socio Pro |
| `whatsapp_click` | Botón WhatsApp en ficha de comercio |
| `llamada_click` | Botón Llamar en ficha |
| `navegar_click` | Click en mini-mapa / link Google Maps |
| `buscar` | Submit en buscador |
| `categoria_filtro` | Cambio de chip categoría en /directorio |
| `lugar_view` | Carga de página `/lugar/:slug` |
| `evento_view` | Carga de página `/evento/:slug` |
| `armar_ruta` | Click en "Armar mi ruta" en /ruta |
| `armar_ruta_parada` | Click en parada del timeline /ruta |
| `buscar_sugerencia` | Una vez por query con sugerencias devueltas |

### Endpoint
Configurado vía `VITE_ANALYTICS_ENDPOINT` (vacío en producción → eventos solo en console.log en dev).

---

## 11. SEO

### Meta tags
- `<SEO title description path>` por página, helmet-async.
- OG / Twitter cards en `index.html`.

### JSON-LD generado
- `organizationLd()` → schema.org Organization (Home).
- `localBusinessLd(comercio)` → LocalBusiness con dirección, geo, telefono, rating (Lugar).
- `eventoLd(evento)` → Event con location, performer (Evento).
- `breadcrumbLd(items)` → BreadcrumbList (Lugar y Evento).

### Sitemap
Generado en `prebuild` script (`scripts/build-sitemap.mjs`). Última generación: 28 URLs (17 comercios + 5 eventos + 6 rutas estáticas).

### Robots
`public/robots.txt` — `Allow: /` + referencia al sitemap.

---

## 12. Diseño visual

### Paleta (locked, hex exactos del mockup Claude Design)
| Token | Hex | Uso |
|---|---|---|
| `--cream` | #F5F0E6 | Background principal |
| `--paper` | #EDE5D3 | Cards, navbar, sections alternas |
| `--paper-dark` | #E5DCC4 | Hover papers |
| `--valley` | #1F4A2D | Primary verde profundo |
| `--valley-mid` | #3F7B47 | Hover primary, gradiente |
| `--field` | #A8C77A | Verde claro, mapas |
| `--sun` | #F4C24A | Estrellas rating, accent solar |
| `--terracotta` | #C8623A | Accent, eyebrow, kicker |
| `--terracotta-deep` | #A24A28 | Hover terracotta |
| `--ink` | #1F1A14 | Foreground texto |
| `--ink-soft` | #3D342A | Texto secundario |
| `--muted` | rgba(31,26,20,0.55) | Texto muted |
| `--border` | rgba(31,26,20,0.12) | Borders |

### Tipografía
- **Display**: Fraunces (serif optical) 400-600, italic disponible para énfasis.
- **UI**: Inter Tight 400-800.
- **Heredadas (legacy)**: Montserrat, Playfair Display, Dancing Script (no usadas en redesign C, pero el CSS las carga).

### Utility classes (custom)
`lift`, `hairline`, `eyebrow`, `eyebrow-sm`, `display-md`, `lede`, `tabular`, `photo-editorial`, `no-scrollbar`.

### Splash screen
800ms con DatoMark animado + Wordmark + tagline italic. Solo primera visita por sesión (sessionStorage flag `dato68_splash_seen`).

### MobileTabBar (≤768px)
5 tabs: **Inicio · Buscar · Mi ruta · Agenda · Publica**. Cream sólido con border-top. Tab activo en valley.

### NavBar desktop (≥768px)
Paper sticky. DatoMark + Wordmark inline + 5 nav links. Activo: bg valley + text cream.

---

## 13. Deploy / infra

### Vercel
- Proyecto: `dato-curacavi` en team `evelyncaceresburrows-4747s-projects`
- Plan: Hobby ($0)
- Output dir: `dist/` (corregido luego de bug que escribía a `/tmp/`)
- Env vars (Production):
  - `VITE_SUPABASE_URL` ✓
  - `VITE_SUPABASE_ANON_KEY` ✓

### Cache headers (vercel.json)
- `/index.html` → `max-age=0, must-revalidate` (no cache)
- `/assets/*` → `max-age=31536000, immutable` (hash en filename)
- `/images/*` → `max-age=604800` (7d)
- `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` → `max-age=3600`

### CSP
`img-src` permite: `'self'`, `data:`, `blob:`, `*.supabase.co`, `datocuracavi.cl`, `images.unsplash.com`, `images.pexels.com`, `upload.wikimedia.org`.

### GitHub
Repo público `evelyncaceresburrows-cpu/dato-curacavi`. Commits manuales desde local. Sin GitHub Actions / CI configurado.

### Bundle de producción
| Chunk | Tamaño | gzip |
|---|---|---|
| `index-*.js` (entry) | ~113 kB | ~35 kB |
| `react-*.js` | 162 kB | 53 kB |
| `supabase-*.js` | 194 kB | 51 kB |
| `icons-*.js` | 22 kB | 5 kB |
| `index-*.css` | 58 kB | 10 kB |
| **Pages lazy-loaded** (Home, Directory, Lugar, etc.) | 5–15 kB c/u | 2–5 kB |

Initial paint: ~99 kB gzip. Code-splitting por ruta activo.

---

## 14. Pendientes / known issues

### Backend
- **Supabase está vacío en `comercios` / `eventos`**: el sitio sirve seed local. Cuando carges fichas reales en la DB, el cliente las usará automáticamente (fallback al seed se mantiene).

### Datos
- **3 categorías sin fichas**: `alojamientos`, `cultura`, `emprendimientos`. Filtros vacíos en `/directorio`.
- **ID duplicado**: `feria-libre` aparece como comercio Y como evento. Renombrar uno (sugerido: `feria-libre-evento-2026`).
- **Posible duplicado**: `Talleres Curacaví` y `Mecánica El Compadre` con subtítulos similares — confirmar si son dos negocios.
- **Imágenes editoriales**: las 22 fichas tienen Unsplash, no fotos del local real.

### Tokens / archivos sensibles en repo
- `subir-a-github.bat`, `push-a-github.bat`, `subir-a-github.ps1` — scripts de un solo uso pusheados al repo accidentalmente. Borrarlos desde GitHub UI.
- Tokens Vercel y GitHub usados durante el setup ya documentados — **revocar** en https://vercel.com/account/tokens y https://github.com/settings/tokens cuando termine la sesión.

### Workflows CI
- `.github/workflows/ci.yml` quedó fuera del primer push (token sin scope `workflow`). Recreable desde GitHub UI.

### Concierge
- Gemini NO conectado en producción. Si querés respuestas IA, agregar `VITE_GEMINI_API_KEY` a Vercel env.

### Mapa (`/mapa`)
- Implementación parcial. SVG con coords (0–100) sin tiles reales. No es bloqueante para el lanzamiento.

### Ficha Lugar
- Productos chips se muestran desde `comercio.destacados`. No hay menú estructurado todavía.
- Galería del mockup (grid de 6 fotos) no implementada (cada ficha solo tiene 1 imagen).
- Reseñas mostradas en mockup no implementadas.

### Mobile
- Auditoría a11y completada en `/ruta` (aria-pressed, htmlFor, aria-label).
- Otras páginas pueden necesitar pase similar.

---

## 15. URLs útiles

- **Sitio productivo**: https://dato-curacavi.vercel.app
- **GitHub repo**: https://github.com/evelyncaceresburrows-cpu/dato-curacavi
- **Supabase dashboard**: https://supabase.com/dashboard/project/twmblwdkcyldmvctjgwo
- **Vercel dashboard**: https://vercel.com/evelyncaceresburrows-4747s-projects/dato-curacavi
- **Sitemap**: https://dato-curacavi.vercel.app/sitemap.xml

---

_Informe generado a partir de auditoría real del código fuente. Si algo no aparece acá, no está implementado._
