/**
 * lib/buscador.ts — Búsqueda inteligente de Dato 68
 *
 * Diseño:
 *   1. Diccionario chileno: traduce frases coloquiales a (palabras + tags).
 *      "almuerzo barato" → palabras [picada, menú, colación] + tag barato
 *      "café con wifi"   → palabras [cafetería, café]      + tag rapido
 *      "panorama lluvia" → palabras [techado, indoor]      + tag lluvia
 *   2. Si Supabase está conectado: corre `websearch_to_tsquery('spanish', q)`
 *      contra `v_comercios_busqueda.search_doc` y `v_eventos_busqueda.search_doc`
 *      (creadas en migration 0004_dato68.sql con setweight A/B/C).
 *      Aporta tags expandidos como filtros adicionales (`tags && {…}`).
 *   3. Si no hay Supabase o falla la red: cae al seed local con un matcher
 *      tolerante (sin tildes, lowercase, OR de keywords expandidas).
 *
 * Nunca lanza al UI. Si todo falla → devuelve listas vacías + sugerencia.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import {
  COMERCIOS,
  EVENTOS,
  ordenarComercios,
  type Comercio,
  type Evento,
} from "@/data/seed";

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export interface ResultadoBuscador {
  comercios: Comercio[];
  eventos: Evento[];
  sugerencias: string[];
  query: {
    raw: string;
    palabras: string[];
    tags: string[];
  };
  source: "supabase" | "local";
}

// ─── Diccionario de sinónimos chilenos ───────────────────────────────────────
// Cada entrada se aplica si la query contiene alguno de los `match`.
// `add` extiende términos de búsqueda. `tag` agrega filtros por tag.
//
// Mantener corto y conciso: sólo casos de alto valor. La FTS castellana
// de Postgres ya maneja inflexiones (almuerzos → almuerzo) y la lista
// de stop-words. Acá agregamos lo que el motor NO sabe: chilenismos.

interface RegistroSinonimo {
  match: string[];
  add?: string[];
  tag?: string[];
}

const SINONIMOS: RegistroSinonimo[] = [
  // Comer barato / almorzar
  { match: ["picada", "picadita", "picadas"],          add: ["menú", "colación", "almuerzo"] },
  { match: ["almuerzo", "almorzar", "colacion", "colación", "menu", "menú"], add: ["picada", "restaurant"] },
  { match: ["barato", "baratos", "economico", "económico", "lukas", "luca"], tag: ["barato"] },
  { match: ["caro", "premium", "alta cocina", "fino"], tag: ["premium"] },

  // Café / desayuno / wifi
  { match: ["cafe", "café", "cafetería", "cafeteria", "desayuno", "once"], add: ["cafetería", "café"] },
  { match: ["wifi", "trabajar", "laptop", "remoto"],   tag: ["rapido"] },

  // Vino / chicha / asado
  { match: ["vino", "viña", "vina", "tinto", "syrah"], add: ["viña", "bodega"], tag: ["vino"] },
  { match: ["chicha", "chichería", "chicheria", "garrafa"], add: ["chicha", "chichería"], tag: ["vino"] },
  { match: ["pisco sour", "trago", "bar", "cerveza"],  add: ["bar"] },
  { match: ["asado", "parrilla", "carne", "costillas"], add: ["parrilla", "smokehouse"] },
  { match: ["empanada", "empanadas"],                  add: ["panadería"] },
  { match: ["pan amasado", "amasado", "panaderia", "panadería"], add: ["panadería"] },

  // Familia / niños / mascotas
  { match: ["niños", "niñas", "guagua", "kids", "cabros chicos"], tag: ["ninos", "familia"] },
  { match: ["familia", "familiar"],                    tag: ["familia"] },
  { match: ["pareja", "romantico", "romántico", "cita"], tag: ["pareja", "romantico"] },
  { match: ["perro", "perrito", "mascota", "pet friendly", "pet-friendly"], tag: ["pet_friendly"] },

  // De paso / Ruta 68
  { match: ["de paso", "ruta 68", "rapido", "rápido", "express", "para llevar"], tag: ["de_paso", "rapido"] },
  { match: ["baño", "bano", "wc", "toilet"],           tag: ["bano"] },

  // Naturaleza / panorama
  { match: ["trekking", "cerro", "caminata", "hiking", "naturaleza", "outdoor"], add: ["cerro", "trekking"], tag: ["naturaleza"] },
  { match: ["panorama", "panoramas", "qué hacer", "que hacer"], add: ["panorama"] },

  // Lluvia / techado
  { match: ["lluvia", "frio", "frío", "techado", "indoor"], tag: ["lluvia"] },

  // Finde / hoy / urgencia
  { match: ["finde", "fin de semana", "sabado", "sábado", "domingo"], tag: ["finde"] },
  { match: ["hoy", "ahora", "abierto"],                tag: ["rapido"] },
  { match: ["urgencia", "emergencia", "auxilio", "samu", "bomberos"], tag: ["emergencia"] },

  // Trámites
  { match: ["tramite", "trámite", "muni", "municipalidad", "permiso"], add: ["municipalidad"] },

  // Comunas (sinónimos de zona)
  { match: ["valpo", "porteño", "porteno"],            add: ["valparaíso"] },
  { match: ["casablanca", "casa blanca"],              add: ["casablanca"] },
  { match: ["algarrobo"],                              add: ["algarrobo"] },
  { match: ["pudahuel"],                               add: ["pudahuel"] },
  { match: ["maria pinto", "maría pinto"],             add: ["maría pinto"] },
];

// ─── Normalización ───────────────────────────────────────────────────────────

/** lowercase + sin tildes + sin caracteres no alfanuméricos. */
export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9 ñ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Expansión: query → (palabras, tags) ─────────────────────────────────────

export interface QueryExpandida {
  palabras: string[]; // términos a pasar a websearch_to_tsquery (con OR)
  tags: string[];     // filtros por tag agregados
  sugerencias: string[]; // si la query era ambigua, frases alternativas
}

/**
 * Match seguro contra falsos positivos por substring.
 *
 * Antes: `norm.includes(needle)` → "barato" matcheaba el needle "bar"
 * y arrastraba sinónimos espurios.
 *
 * Ahora: comparamos por tokens. Un needle multi-palabra ("pisco sour",
 * "fin de semana") debe aparecer como secuencia consecutiva de tokens.
 * Un needle simple ("bar") debe aparecer como token completo.
 */
function matchNeedle(normTokens: string[], needle: string): boolean {
  const ntoks = normalizar(needle).split(" ").filter(Boolean);
  if (ntoks.length === 0) return false;
  if (ntoks.length === 1) return normTokens.includes(ntoks[0]);
  // Subsecuencia consecutiva
  outer: for (let i = 0; i + ntoks.length <= normTokens.length; i++) {
    for (let j = 0; j < ntoks.length; j++) {
      if (normTokens[i + j] !== ntoks[j]) continue outer;
    }
    return true;
  }
  return false;
}

export function expandirQuery(raw: string): QueryExpandida {
  const norm = normalizar(raw);
  if (!norm) return { palabras: [], tags: [], sugerencias: [] };

  // tokens base (>= 2 letras)
  const tokens = norm.split(" ").filter((t) => t.length >= 2);
  const palabras = new Set<string>(tokens);
  const tags = new Set<string>();
  const sugerencias = new Set<string>();

  for (const reg of SINONIMOS) {
    const hit = reg.match.some((m) => matchNeedle(tokens, m));
    if (!hit) continue;
    reg.add?.forEach((w) => palabras.add(normalizar(w)));
    reg.tag?.forEach((t) => tags.add(t));
  }

  // Sugerencias contextuales (top 3) — token-aware, no substring.
  const has = (t: string) => tokens.includes(normalizar(t));
  if (has("almuerzo") && !has("barato")) sugerencias.add("almuerzo barato");
  if (has("vino") && !has("tour")) sugerencias.add("tour viña");
  if ((has("niños") || has("ninos")) && !has("panorama")) sugerencias.add("panorama niños");
  if (tags.has("de_paso")) sugerencias.add("café de paso ruta 68");
  if (tags.has("lluvia")) sugerencias.add("panorama techado");

  return {
    palabras: Array.from(palabras),
    tags: Array.from(tags),
    sugerencias: Array.from(sugerencias).slice(0, 3),
  };
}

// ─── Adaptadores Supabase row → semilla ──────────────────────────────────────
// La vista v_comercios_busqueda agrega columna `tags text[]` (de la pivot).

interface VComercioRow {
  id: string;
  slug: string;
  nombre: string;
  categoria: Comercio["categoria"];
  subtitulo: string | null;
  descripcion: string | null;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  precio: Comercio["precio"] | null;
  rating: number | null;
  reviews: number | null;
  estado: Comercio["estado"];
  abierto_hasta: string | null;
  imagen: string | null;
  destacados: string[] | null;
  coords_x: number | null;
  coords_y: number | null;
  lat: number | null;
  lng: number | null;
  comuna_id: string | null;
  eje_ruta_km: number | null;
  tiempo_visita_min: number | null;
  precio_clp_aprox: number | null;
  tags: string[] | null;
}

function rowToComercio(row: VComercioRow): Comercio & { tags?: string[] } {
  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    categoria: row.categoria,
    subtitulo: row.subtitulo ?? "",
    descripcion: row.descripcion ?? "",
    direccion: row.direccion ?? "",
    telefono: row.telefono ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    precio: (row.precio ?? "$$") as Comercio["precio"],
    rating: Number(row.rating ?? 0),
    reviews: row.reviews ?? 0,
    estado: row.estado,
    abiertoHasta: row.abierto_hasta ?? undefined,
    imagen: row.imagen ?? "linear-gradient(135deg,#1F6B45,#2F8F5E)",
    destacados: row.destacados ?? [],
    coords: {
      x: Number(row.coords_x ?? 50),
      y: Number(row.coords_y ?? 50),
    },
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    tags: row.tags ?? [],
  };
}

interface VEventoRow {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  hora: string | null;
  lugar: string | null;
  comercio_id: string | null;
  categoria: Evento["categoria"];
  tags: string[] | null;
  chip_color: string | null;
  imagen: string | null;
  estado: Evento["estado"];
  gratis: boolean | null;
  precio_texto: string | null;
  comuna_id: string | null;
  eje_ruta_km: number | null;
}

function rowToEvento(row: VEventoRow): Evento {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    fecha: row.fecha,
    hora: (row.hora ?? "").slice(0, 5),
    lugar: row.lugar ?? "",
    comercioId: row.comercio_id ?? undefined,
    categoria: row.categoria,
    tags: row.tags ?? [],
    chipColor: row.chip_color ?? "#D7ECDD",
    imagen: row.imagen ?? "linear-gradient(135deg,#1F6B45,#2F8F5E)",
    estado: row.estado,
    gratis: row.gratis ?? false,
    precio: row.precio_texto ?? undefined,
  };
}

// ─── Búsqueda en Supabase ────────────────────────────────────────────────────

async function buscarEnSupabase(
  exp: QueryExpandida
): Promise<{ comercios: Comercio[]; eventos: Evento[] } | null> {
  if (!isSupabaseConfigured || !supabase || exp.palabras.length === 0) {
    return null;
  }

  // Construye una expresión websearch: las palabras como OR (más permisivo).
  const websearch = exp.palabras.map((p) => `"${p}"`).join(" OR ");

  try {
    let qC = supabase
      .from("v_comercios_busqueda")
      .select(
        "id,slug,nombre,categoria,subtitulo,descripcion,direccion,telefono,whatsapp,precio,rating,reviews,estado,abierto_hasta,imagen,destacados,coords_x,coords_y,lat,lng,comuna_id,eje_ruta_km,tiempo_visita_min,precio_clp_aprox,tags"
      )
      .textSearch("search_doc", websearch, {
        type: "websearch",
        config: "spanish",
      })
      .limit(40);

    if (exp.tags.length > 0) {
      // El operador `cs` (contains) requiere que el array de la fila contenga
      // TODOS los tags. Para una búsqueda más permisiva usamos `ov` (overlaps).
      qC = qC.overlaps("tags", exp.tags);
    }

    let qE = supabase
      .from("v_eventos_busqueda")
      .select(
        "id,slug,titulo,descripcion,fecha,hora,lugar,comercio_id,categoria,tags,chip_color,imagen,estado,gratis,precio_texto,comuna_id,eje_ruta_km"
      )
      .textSearch("search_doc", websearch, {
        type: "websearch",
        config: "spanish",
      })
      .gte("fecha", new Date().toISOString().slice(0, 10))
      .order("fecha", { ascending: true })
      .limit(20);

    if (exp.tags.length > 0) {
      qE = qE.overlaps("tags", exp.tags);
    }

    const [resC, resE] = await Promise.all([qC, qE]);

    if (resC.error || resE.error) {
      console.warn("[buscador] Supabase error → fallback local:", {
        comercios: resC.error?.message,
        eventos: resE.error?.message,
      });
      return null;
    }

    const comercios = ordenarComercios(
      ((resC.data ?? []) as VComercioRow[]).map(rowToComercio)
    );
    const eventos = ((resE.data ?? []) as VEventoRow[]).map(rowToEvento);

    return { comercios, eventos };
  } catch (err) {
    console.warn("[buscador] excepción Supabase → fallback local:", err);
    return null;
  }
}

// ─── Búsqueda en seed local (fallback) ───────────────────────────────────────

function matchScore(haystack: string, needles: string[]): number {
  if (needles.length === 0) return 0;
  const norm = normalizar(haystack);
  let score = 0;
  for (const n of needles) {
    if (norm.includes(n)) score += 1;
  }
  return score;
}

function buscarEnLocal(exp: QueryExpandida): {
  comercios: Comercio[];
  eventos: Evento[];
} {
  const { palabras, tags } = exp;

  // Comercios: ranking por palabras en nombre+subtitulo+descripcion+categoria
  const comerciosScored = COMERCIOS.map((c) => {
    const blob = [
      c.nombre,
      c.subtitulo,
      c.descripcion,
      c.direccion,
      c.categoria,
      ...(c.destacados ?? []),
    ].join(" ");
    const score = matchScore(blob, palabras);
    return { c, score };
  });

  let comercios = comerciosScored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c);

  // Si la query no produjo palabras útiles pero sí tags (ej. "panorama lluvia"),
  // permitimos que el resultado venga sólo por tags.
  if (comercios.length === 0 && tags.length > 0) {
    comercios = COMERCIOS.slice();
  }

  // Filtrado por tags si los hay (en seed, los tags viven en `destacados` o
  // en categorías que aproximan: "naturaleza" → categoria panoramas).
  if (tags.length > 0) {
    const tagAprox = (c: Comercio) => {
      const t = new Set<string>();
      // Heurísticas mientras no haya tags reales en el seed.
      if (c.categoria === "panoramas") {
        t.add("naturaleza");
        t.add("familia");
      }
      if (c.categoria === "picadas") t.add("comida");
      if (c.categoria === "chicha") t.add("vino");
      if (c.categoria === "dulces") t.add("comida");
      if (c.categoria === "emergencias") t.add("emergencia");
      if (c.precio === "$") t.add("barato");
      if (c.precio === "$$$") t.add("premium");
      if (c.estado === "socio_pro") t.add("verificado");
      const blob = normalizar([c.nombre, c.subtitulo, c.descripcion].join(" "));
      if (/familia|niños|kids|infantil/.test(blob)) t.add("ninos");
      if (/pareja|romantico|romántico/.test(blob)) t.add("romantico");
      if (/pet|mascota|perro/.test(blob)) t.add("pet_friendly");
      return t;
    };
    comercios = comercios.filter((c) => {
      const t = tagAprox(c);
      return tags.some((tag) => t.has(tag));
    });
  }

  comercios = ordenarComercios(comercios).slice(0, 40);

  // Eventos
  const hoy = new Date().toISOString().slice(0, 10);
  const eventosScored = EVENTOS.filter((e) => e.fecha >= hoy).map((e) => {
    const blob = [e.titulo, e.descripcion, e.lugar, e.categoria, ...(e.tags ?? [])].join(" ");
    const score = matchScore(blob, palabras);
    return { e, score };
  });

  let eventos = eventosScored
    .filter((x) => x.score > 0 || (palabras.length === 0 && tags.length > 0))
    .sort((a, b) => b.score - a.score || a.e.fecha.localeCompare(b.e.fecha))
    .map((x) => x.e);

  if (tags.length > 0) {
    eventos = eventos.filter((e) => {
      const blob = normalizar([e.titulo, e.descripcion, ...(e.tags ?? [])].join(" "));
      return tags.some((tag) => blob.includes(normalizar(tag.replace(/_/g, " "))));
    });
  }

  return { comercios, eventos: eventos.slice(0, 20) };
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * `buscar(q)` — punto de entrada único.
 *
 * No throws: siempre resuelve con un `ResultadoBuscador` válido.
 */
export async function buscar(raw: string): Promise<ResultadoBuscador> {
  const exp = expandirQuery(raw);

  // Query vacía → no buscamos nada (evitamos golpear DB en cada keystroke).
  if (exp.palabras.length === 0 && exp.tags.length === 0) {
    return {
      comercios: [],
      eventos: [],
      sugerencias: [],
      query: { raw, palabras: [], tags: [] },
      source: "local",
    };
  }

  const remoto = await buscarEnSupabase(exp);
  if (remoto) {
    return {
      comercios: remoto.comercios,
      eventos: remoto.eventos,
      sugerencias: exp.sugerencias,
      query: { raw, palabras: exp.palabras, tags: exp.tags },
      source: "supabase",
    };
  }

  const local = buscarEnLocal(exp);
  return {
    comercios: local.comercios,
    eventos: local.eventos,
    sugerencias: exp.sugerencias,
    query: { raw, palabras: exp.palabras, tags: exp.tags },
    source: "local",
  };
}
