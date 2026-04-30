#!/usr/bin/env node
/**
 * scripts/seed-to-supabase.mjs
 *
 * Carga el seed local (`src/data/seed.ts`) a Supabase como filas reales.
 *
 * USO:
 *   node scripts/seed-to-supabase.mjs
 *
 * REQUIERE en process.env:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY  (no anon — necesitamos UPSERT bypassando RLS)
 *
 * Operación: UPSERT por slug — re-correr es seguro y actualiza filas existentes.
 *
 * IMPORTANTE: no reemplaza el seed.ts. Lo deja como fallback offline.
 *             Cuando Supabase tiene filas, la app las usa; si Supabase falla,
 *             cae al seed (resiliente).
 */

import { createClient } from '@supabase/supabase-js';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Permite importar archivos .ts (TypeScript transpilation on the fly).
// Requiere `tsx` instalado: npm i -D tsx
register('tsx/esm', pathToFileURL('./'));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('FALTA SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  console.error('Tip: usar .env.local + dotenv, o exportar antes de correr.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Importar seed.ts directamente (tsx compila on the fly).
const { COMERCIOS, EVENTOS } = await import('../src/data/seed.ts');

// ─── Comercios ─────────────────────────────────────────────────────────────
const comerciosRows = COMERCIOS.map((c) => ({
  slug: c.slug,
  nombre: c.nombre,
  categoria: c.categoria,
  subtitulo: c.subtitulo ?? null,
  descripcion: c.descripcion ?? null,
  direccion: c.direccion ?? null,
  telefono: c.telefono ?? null,
  whatsapp: c.whatsapp ?? null,
  web: c.web ?? null,
  email: c.email ?? null,
  precio: c.precio ?? null,
  rating: c.rating ?? null,
  reviews: c.reviews ?? null,
  estado: c.estado ?? 'verificado',
  abierto_hasta: c.abiertoHasta ?? null,
  imagen: c.imagen ?? null,
  destacados: c.destacados ?? [],
  coords_x: c.coords?.x ?? null,
  coords_y: c.coords?.y ?? null,
  lat: c.lat ?? null,
  lng: c.lng ?? null,
  distancia_km: c.distanciaKm ?? null,
  publicado: true,
  // Ruta 68 — todos del seed son de Curacaví por ahora.
  comuna_id: 'curacavi',
  eje_ruta_km: 43.0,
}));

console.log(`Upserteando ${comerciosRows.length} comercios…`);
const { error: errCom, count: countCom } = await sb
  .from('comercios')
  .upsert(comerciosRows, { onConflict: 'slug', count: 'exact' });

if (errCom) {
  console.error('Error comercios:', errCom);
  process.exit(1);
}
console.log(`OK comercios: ${countCom ?? comerciosRows.length} filas.`);

// ─── Eventos ───────────────────────────────────────────────────────────────
const eventosRows = EVENTOS.map((e) => ({
  slug: e.slug,
  titulo: e.titulo,
  descripcion: e.descripcion ?? null,
  fecha: e.fecha,
  hora: e.hora ?? null,
  lugar: e.lugar ?? null,
  categoria: e.categoria,
  tags: e.tags ?? [],
  chip_color: e.chipColor ?? null,
  imagen: e.imagen ?? null,
  estado: e.estado ?? 'verificado',
  gratis: e.gratis ?? false,
  precio_texto: e.precio ?? null,
  publicado: true,
  comuna_id: 'curacavi',
  eje_ruta_km: 43.0,
}));

console.log(`Upserteando ${eventosRows.length} eventos…`);
const { error: errEv, count: countEv } = await sb
  .from('eventos')
  .upsert(eventosRows, { onConflict: 'slug', count: 'exact' });

if (errEv) {
  console.error('Error eventos:', errEv);
  process.exit(1);
}
console.log(`OK eventos: ${countEv ?? eventosRows.length} filas.`);

console.log('\nMigración terminada. Verificá en Supabase Studio o con:');
console.log('  curl "$SUPABASE_URL/rest/v1/comercios?select=slug,nombre&limit=5" \\');
console.log('       -H "apikey: $SUPABASE_ANON_KEY"');
