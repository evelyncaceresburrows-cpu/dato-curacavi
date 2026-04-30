# Carga masiva de fichas — guía operativa

Tres caminos para meter datos reales a Supabase **sin tocar el repo**:

---

## Camino A · CSV → Supabase Studio (más fácil, sin código)

Ideal si tenés un Excel o Google Sheets con la base.

### Paso 1: descargar plantilla CSV

Pegar en Google Sheets / Excel:

```csv
slug,nombre,categoria,subtitulo,descripcion,direccion,telefono,whatsapp,web,email,precio,rating,reviews,estado,abierto_hasta,imagen,destacados,lat,lng,distancia_km,publicado,comuna_id,eje_ruta_km,tiempo_visita_min,precio_clp_aprox
panaderia-don-luis,Panadería Don Luis,dulces,Pan amasado en horno de barro,Tres generaciones amasando en el centro de Curacaví desde 1962.,O'Higgins 432,+56 9 8765 4321,+56987654321,,,$,4.8,142,verificado,20:00,https://...jpg,"Pan amasado;Marraqueta;Berlines",-33.4069,-71.1459,0.6,true,curacavi,43.0,30,5000
```

**Notas**:
- `slug` debe ser único (kebab-case, sin tildes ni espacios). Si ya existe en la DB, se hace UPDATE, no INSERT.
- `categoria` debe ser uno de: `picadas`, `dulces`, `chicha`, `panoramas`, `servicios`, `tramites`, `emprendimientos`, `alojamientos`, `cultura`, `emergencias`.
- `estado`: `socio_pro`, `verificado` o `por_confirmar`.
- `precio`: `$`, `$$` o `$$$`.
- `comuna_id`: `curacavi`, `pudahuel`, `casablanca`, `algarrobo`, etc. (ver tabla `comunas`).
- `destacados`: separados por `;` sin comillas.
- `imagen`: URL https pública (Unsplash, Pexels, Wikimedia o Storage propio).

### Paso 2: importar en Supabase Studio

1. https://supabase.com/dashboard/project/twmblwdkcyldmvctjgwo
2. Sidebar → **Table Editor** → tabla `comercios`
3. Botón **Insert** (arriba a la derecha) → **Import data from CSV**
4. Drag-and-drop el CSV. Mapear columnas si el header no coincide.
5. **Confirm**.

Para eventos: misma operación, tabla `eventos`. Columnas distintas: `titulo`, `fecha` (YYYY-MM-DD), `hora` (HH:MM:SS), `lugar`, `tags`, `chip_color`, `gratis`, `precio_texto`.

### Paso 3: verificar en el sitio

Abrir https://dato-curacavi.vercel.app — los nuevos negocios aparecen al instante (sin redeploy).

---

## Camino B · SQL paste (rápido para ≤20 filas)

Si tenés los datos a mano y querés hacer `INSERT` directo:

1. Supabase Dashboard → **SQL Editor** → New query
2. Pegar:

```sql
insert into public.comercios
  (slug, nombre, categoria, subtitulo, descripcion, direccion, telefono, whatsapp,
   precio, rating, reviews, estado, abierto_hasta, imagen, destacados,
   publicado, comuna_id, eje_ruta_km)
values
  ('mi-negocio-ejemplo', 'Mi Negocio', 'picadas', 'Sub corto',
   'Descripción larga…', 'Dirección 123', '+56 9 ...', '+56 9 ...',
   '$$', 4.5, 0, 'verificado', '20:00',
   'https://images.unsplash.com/...', ARRAY['Tag1','Tag2']::text[],
   true, 'curacavi', 43.0)
on conflict (slug) do update set
  nombre = excluded.nombre,
  subtitulo = excluded.subtitulo,
  descripcion = excluded.descripcion;
```

3. **Run** (Ctrl+Enter).

`on conflict (slug) do update` permite re-correr el SQL sin duplicar.

---

## Camino C · Subir imagen propia + referenciar URL

Cuando tengas la foto real del local:

### Paso 1: subir imagen al bucket `comercios`

1. Supabase Dashboard → **Storage** → bucket `comercios` (ya creado, público)
2. **Upload file** → seleccioná la foto. Recomendado: 1600×1067 (3:2), JPG ≤500 KB, optimizada con tinypng.com o squoosh.app antes de subir.
3. Nombre del archivo: usá el `slug` del comercio. Ej: `panaderia-don-luis.jpg`.
4. URL pública resultante:
   `https://twmblwdkcyldmvctjgwo.supabase.co/storage/v1/object/public/comercios/panaderia-don-luis.jpg`

### Paso 2: actualizar el campo `imagen` del comercio

Table Editor → tabla `comercios` → fila del comercio → columna `imagen` → pegar URL.

O por SQL:

```sql
update public.comercios
   set imagen = 'https://twmblwdkcyldmvctjgwo.supabase.co/storage/v1/object/public/comercios/panaderia-don-luis.jpg'
 where slug = 'panaderia-don-luis';
```

---

## Categorías vacías (UX)

El sitio **esconde automáticamente** las categorías sin filas publicadas. Ej: si no hay ningún comercio en `alojamientos`, ese chip no aparece en /directorio. Para activar la categoría: subí ≥1 ficha y aparece sola.

---

## Borrar / despublicar una ficha

```sql
-- despublicar (no aparece pero queda histórico)
update public.comercios set publicado = false where slug = 'la-pica-de-curacavi';

-- borrar definitivamente
delete from public.comercios where slug = 'la-pica-de-curacavi';
```

---

## Validaciones automáticas (RLS + triggers)

- **Lectura pública**: solo filas con `publicado = true`.
- **Search FTS**: el campo `search_doc` se actualiza solo via triggers (incluye nombre + categoría + descripción + nombre comuna con peso A/B/C).
- **Sitemap**: se regenera en cada deploy con los slugs publicados.
