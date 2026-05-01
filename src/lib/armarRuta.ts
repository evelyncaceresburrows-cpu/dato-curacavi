/**
 * lib/armarRuta.ts — Planificador greedy "Arma tu Ruta" para Dato 68
 *
 * Modelo:
 *   - El corredor Ruta 68 se proyecta a una línea 1D parametrizada por
 *     `eje_ruta_km` (Plaza Italia = 0; Valparaíso ≈ 120). Esto evita
 *     haversine y permite ordenar paradas como una ruta lineal.
 *   - El usuario indica:
 *       origen: "santiago" | "valparaiso" | comuna_id
 *       direccion: "ida" | "vuelta" | "circuito"   (default ida)
 *       tiempo_min: presupuesto total de tiempo (incluye traslados).
 *       presupuesto_clp: CLP gastable en consumos.
 *       tags: lista de tags combinables (puede ir vacía).
 *       max_paradas: tope (default 4) para no inflar el plan.
 *   - Salida: array ordenado de Paradas con `eta_min`, `costo_clp`,
 *     `tiempo_acum_min`, `costo_acum_clp` y un `score` interno.
 *
 * Función pura. Sin Supabase, sin React. Acepta `comercios`, `comunas` y
 * `tags` como entrada → testeable en isolation.
 */

import type { Comercio, Categoria } from "@/data/seed";

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export interface ComunaNodo {
  id: string;
  nombre: string;
  eje_ruta_km: number;
}

/** Comercio con metadata Dato 68. La semilla local NO la trae todavía;
 *  hidratamos con defaults razonables cuando faltan los campos. */
export interface ComercioRuta extends Comercio {
  comuna_id?: string;
  eje_ruta_km?: number;
  tiempo_visita_min?: number;
  precio_clp_aprox?: number;
  /** true si el precio es estimado por categoria; false si lo verificamos
   *  online o lo cargo el socio. */
  precio_es_estimado?: boolean;
  tags?: string[];
}

export interface ArmarRutaInput {
  origen: "santiago" | "valparaiso" | string; // string = comuna_id
  direccion?: "ida" | "vuelta" | "circuito";
  tiempo_min: number;       // tope de tiempo total (traslados + visitas)
  presupuesto_clp: number;  // tope de gasto
  tags?: string[];          // tags combinables (AND parcial: cada parada debe matchear ≥ 1)
  comuna_id?: string;       // restringir a una comuna concreta (opcional)
  max_paradas?: number;
  velocidad_kmh?: number;   // default 80 (autopista 100, tráfico 70 → 80 promedio)
}

export interface Parada {
  comercio: ComercioRuta;
  comuna_id?: string;
  eje_ruta_km: number;
  tiempo_visita_min: number;
  costo_clp: number;
  /** true si el costo viene del default por categoria, no de un dato real
   *  verificado. La UI lo prefija con "aprox" cuando es true. */
  costo_es_estimado: boolean;
  eta_min: number;            // minutos desde el km anterior
  tiempo_acum_min: number;
  costo_acum_clp: number;
  motivo: string[];           // por qué entró ("vino", "barato", "score 4")
}

export interface ArmarRutaResultado {
  paradas: Parada[];
  total_min: number;
  total_clp: number;
  km_recorridos: number;
  origen_km: number;
  destino_km: number;
  notas: string[]; // mensajes para el usuario ("se cortó por presupuesto")
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

const ORIGEN_KM: Record<string, number> = {
  santiago: 0,
  valparaiso: 120,
  valparaíso: 120,
};

function resolverOrigenKm(
  origen: string,
  comunas: ComunaNodo[]
): { km: number; nombre: string } | null {
  const norm = origen.toLowerCase();
  if (ORIGEN_KM[norm] !== undefined) {
    return { km: ORIGEN_KM[norm], nombre: norm.charAt(0).toUpperCase() + norm.slice(1) };
  }
  const c = comunas.find((x) => x.id === origen);
  if (c) return { km: c.eje_ruta_km, nombre: c.nombre };
  return null;
}

/** Hidrata defaults cuando la fila local no tiene metadata Dato 68. */
function hidratar(c: ComercioRuta, comunas: ComunaNodo[]): ComercioRuta {
  if (c.eje_ruta_km !== undefined && c.tiempo_visita_min !== undefined) return c;

  // Defaults razonables por categoría
  const defaultsPorCategoria: Record<Categoria, { min: number; clp: number }> = {
    picadas:        { min: 60, clp: 12000 },
    dulces:         { min: 20, clp: 5000 },
    chicha:         { min: 45, clp: 8000 },
    panoramas:      { min: 90, clp: 0 },
    servicios:      { min: 30, clp: 5000 },
    tramites:       { min: 30, clp: 0 },
    emprendimientos:{ min: 30, clp: 8000 },
    alojamientos:   { min: 480, clp: 60000 },
    cultura:        { min: 60, clp: 5000 },
    emergencias:    { min: 15, clp: 0 },
  };
  const def = defaultsPorCategoria[c.categoria] ?? { min: 45, clp: 8000 };

  const km = c.eje_ruta_km ?? comunas.find((x) => x.id === c.comuna_id)?.eje_ruta_km ?? 43;
  const tiempo = c.tiempo_visita_min ?? def.min;
  const precio = c.precio_clp_aprox ?? def.clp;

  return {
    ...c,
    eje_ruta_km: km,
    tiempo_visita_min: tiempo,
    precio_clp_aprox: precio,
  };
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

interface ScoreInput {
  c: ComercioRuta;
  tagsObjetivo: string[];
}

function scoreParada({ c, tagsObjetivo }: ScoreInput): {
  score: number;
  motivo: string[];
} {
  const motivo: string[] = [];
  let score = 0;

  // Estado: socio_pro pesa más (vecino verificado y confiable).
  if (c.estado === "socio_pro") {
    score += 3;
  } else if (c.estado === "verificado") {
    score += 2;
  } else {
    score += 0.5;
  }

  // Rating
  score += (c.rating ?? 0) * 0.5;

  // Match de tags (1 punto por tag coincidente)
  const tagsParada = new Set(c.tags ?? []);
  let matchedTags = 0;
  for (const t of tagsObjetivo) {
    if (tagsParada.has(t)) {
      matchedTags += 1;
      motivo.push(t);
    }
  }
  score += matchedTags * 1.5;

  // Penalización por reviews bajas (señal débil)
  if ((c.reviews ?? 0) < 10) score -= 0.5;

  return { score, motivo };
}

// ─── Algoritmo principal ─────────────────────────────────────────────────────

/**
 * armarRuta — devuelve un plan greedy ordenado por eje_ruta_km.
 *
 * No throws. Si no hay candidatos válidos devuelve `paradas: []` con notas.
 */
export function armarRuta(
  input: ArmarRutaInput,
  comercios: ComercioRuta[],
  comunas: ComunaNodo[]
): ArmarRutaResultado {
  const {
    origen,
    direccion = "ida",
    tiempo_min,
    presupuesto_clp,
    tags = [],
    comuna_id,
    max_paradas = 4,
    velocidad_kmh = 80,
  } = input;

  const notas: string[] = [];
  const origenInfo = resolverOrigenKm(origen, comunas);
  if (!origenInfo) {
    return {
      paradas: [],
      total_min: 0,
      total_clp: 0,
      km_recorridos: 0,
      origen_km: 0,
      destino_km: 0,
      notas: [`No reconocí el origen "${origen}". Probá con "santiago", "valparaiso" o el id de una comuna.`],
    };
  }

  // 1. Hidratar y filtrar candidatos
  let candidatos = comercios
    .map((c) => hidratar(c, comunas))
    .filter((c) => c.estado !== "por_confirmar"); // no recomendamos lo no confirmado

  if (comuna_id) {
    candidatos = candidatos.filter((c) => c.comuna_id === comuna_id);
    if (candidatos.length === 0) {
      notas.push(`Sin paradas en ${comuna_id}. Probá ampliar a comunas vecinas.`);
    }
  }

  if (tags.length > 0) {
    // Cada parada debe matchear AL MENOS 1 tag (combinables, no AND estricto).
    candidatos = candidatos.filter((c) => {
      const t = c.tags ?? [];
      return tags.some((x) => t.includes(x));
    });
    if (candidatos.length === 0) {
      notas.push(`Sin paradas que matcheen los tags ${tags.join(", ")}. Probá con menos tags.`);
    }
  }

  // 2. Ordenar por dirección (ida = ascendente, vuelta = descendente)
  const asc = direccion !== "vuelta";
  candidatos.sort((a, b) => {
    const ka = a.eje_ruta_km ?? 43;
    const kb = b.eje_ruta_km ?? 43;
    return asc ? ka - kb : kb - ka;
  });

  // 3. Filtrar por dirección respecto al origen (sólo paradas "más allá").
  const origenKm = origenInfo.km;
  candidatos = candidatos.filter((c) => {
    const k = c.eje_ruta_km ?? 43;
    if (direccion === "circuito") return true;
    if (direccion === "ida") return k >= origenKm; // de Stgo hacia Valpo
    return k <= origenKm; // vuelta
  });

  // 4. Greedy con cap por comuna: distribuye paradas en el corredor en
  //    vez de clusterar todo en la primera comuna que tiene muchos matches.
  //    Sin esto: 5 picadas en Curacaví y 0 en Casablanca, aunque el usuario
  //    pidio 5 paradas con tag vino y la idea es atravesar el valle.
  const paradas: Parada[] = [];
  let kmActual = origenKm;
  let tiempoAcum = 0;
  let costoAcum = 0;
  const conteoPorComuna = new Map<string, number>();
  // Si el usuario pide 5 paradas y hay >=3 comunas con candidatos, max 2
  // por comuna fuerza spread. Si hay solo 1-2 comunas, el cap no aplica.
  const comunasConCandidatos = new Set(
    candidatos.map((c) => c.comuna_id ?? "desconocida")
  ).size;
  const maxPorComuna =
    comunasConCandidatos >= 3 ? Math.max(2, Math.ceil(max_paradas / 3)) : max_paradas;

  // Score precomputado para ordenar entre empates de cercanía
  const conScore = candidatos.map((c) => ({
    c,
    ...scoreParada({ c, tagsObjetivo: tags }),
  }));

  for (const { c, score, motivo } of conScore) {
    if (paradas.length >= max_paradas) break;

    const comuna = c.comuna_id ?? "desconocida";
    if ((conteoPorComuna.get(comuna) ?? 0) >= maxPorComuna) {
      // Cap por comuna alcanzado — saltamos para dar lugar a otras comunas.
      continue;
    }

    const km = c.eje_ruta_km ?? 43;
    const distancia = Math.abs(km - kmActual);
    const eta = (distancia / velocidad_kmh) * 60; // minutos
    const visita = c.tiempo_visita_min ?? 45;
    const costo = c.precio_clp_aprox ?? 0;

    if (tiempoAcum + eta + visita > tiempo_min) {
      // Esta parada no entra por tiempo. Como vamos en orden lineal, las
      // siguientes están más lejos → no las podemos meter. Cortamos.
      // Excepción: si es la primera parada y entra justa, intentamos.
      if (paradas.length === 0 && eta + visita <= tiempo_min) {
        // ok, sigue
      } else {
        notas.push("Cortamos el plan por tope de tiempo.");
        break;
      }
    }

    if (costoAcum + costo > presupuesto_clp) {
      // Saltamos esta parada (otra puede ser más barata más adelante).
      continue;
    }

    tiempoAcum += eta + visita;
    costoAcum += costo;
    kmActual = km;
    conteoPorComuna.set(comuna, (conteoPorComuna.get(comuna) ?? 0) + 1);

    paradas.push({
      comercio: c,
      comuna_id: c.comuna_id,
      eje_ruta_km: km,
      tiempo_visita_min: visita,
      costo_clp: costo,
      costo_es_estimado: c.precio_es_estimado !== false,
      eta_min: Math.round(eta),
      tiempo_acum_min: Math.round(tiempoAcum),
      costo_acum_clp: costoAcum,
      motivo: motivo.length > 0 ? motivo : [`score ${score.toFixed(1)}`],
    });
  }

  if (paradas.length === 0 && notas.length === 0) {
    notas.push("No encontré combinación que entre en tu tiempo y presupuesto. Probá ampliar uno de los dos.");
  }

  const destinoKm = paradas.length > 0 ? paradas[paradas.length - 1].eje_ruta_km : origenKm;

  return {
    paradas,
    total_min: Math.round(tiempoAcum),
    total_clp: costoAcum,
    km_recorridos: Math.abs(destinoKm - origenKm),
    origen_km: origenKm,
    destino_km: destinoKm,
    notas,
  };
}
