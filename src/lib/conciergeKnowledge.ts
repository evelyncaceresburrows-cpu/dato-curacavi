/**
 * conciergeKnowledge.ts
 * Base de conocimiento local del Concierge del Valle.
 *
 * PROTOCOLO DE RESPUESTA (Buscador):
 *   Tono: "Mire vecino, si busca [X], yo le recomiendo [Y] porque es de acá del valle."
 *   Restricción: No inventar locales. Si no está en el directorio verificado →
 *                "Ese dato no lo tengo verificado todavía, pero puede probar
 *                 en la Avenida O'Higgins."
 *
 * Fuentes: PLADECO, BCN/Censo 2024, directorios oficiales Municipalidad Curacaví.
 */

export interface TemaLocal {
  palabrasClave: string[];
  respuesta: string;
  skill?: "seguridad" | "registro_socio" | "tramites" | "picadas" | "inscripcion_socio";
  categoriaFiltro?: string;
  urgente?: boolean;
}

// ─── Keywords por intent ──────────────────────────────────────────────────────

export const KEYWORDS_EMERGENCIA = [
  "robo", "asalto", "accidente", "emergencia", "incendio",
  "urgencia", "golpe", "herido", "herida", "pelea",
  "ayuda", "socorro", "carabineros", "bomberos", "samu",
  "ambulancia", "peligro", "delito", "seguridad", "*4129",
];

export const KEYWORDS_INSCRIPCION = [
  "quiero salir", "salir en", "mi negocio", "inscribir", "inscribirme",
  "inscripcion", "publicidad", "publicar", "aparecer en", "registro",
  "registrar", "socio", "negocio", "local", "comercio", "tienda",
  "empresa", "emprendimiento", "emprendedor", "vendo", "vender",
];

export const KEYWORDS_PICADAS = [
  // comer
  "hambre", "donde comer", "dónde comer", "comer", "picada", "almuerzo",
  "restoran", "restaurant", "parrilla", "comida", "datos", "marisco",
  "pescado", "erizo", "loco", "empanada", "pasada", "kuchen",
  // viñas / chicha (corredor Casablanca + Curacaví)
  "chicha", "chichería", "vino", "viña", "vina", "cata", "espumante", "tour",
  "moscatel", "carmenere", "cabernet", "sauvignon",
  // dulces
  "dulce", "empolvado", "alfajor", "panaderia", "panadería", "pan",
  // ferias
  "feria", "feria libre", "mote con huesillo",
  // panoramas / cultura corredor
  "panorama", "paseo", "playa", "caleta", "mirador", "trekking",
  "naturaleza", "museo", "neruda", "ascensor", "santuario", "patrimonio",
  // genéricos
  "gastronomia", "gastronomía", "que hay", "qué hay", "donde", "dónde",
];

// ─── Keywords de locales o tipos de comida NO verificados en Curacaví ──────────
// Se usan para evitar que el buscador local invente o de falsos positivos.
export const KEYWORDS_NO_VERIFICADOS = [
  "sushi", "pizza", "hamburguesa", "comida china", "thai", "mexicana",
  "taco", "shawarma", "kebab", "ramen", "pasta", "italiana",
  "gym", "gimnasio", "vet", "veterinaria", "ferreteria", "farmacia privada",
  "mall", "supermercado", "disco", "pub", "carrete",
];

export const KEYWORDS_COMERCIANTE = KEYWORDS_INSCRIPCION;

// ─── Protocolo de Voz ─────────────────────────────────────────────────────────
/**
 * Formatea una recomendación con el tono oficial del Concierge:
 * "Mire vecino, si busca [X], yo le recomiendo [Y] porque [razon]."
 */
export function voz(busca: string, recomienda: string, razon: string): string {
  return `Mire vecino, si busca **${busca}**, yo le recomiendo **${recomienda}** porque ${razon}.`;
}

/**
 * Fallback de protocolo cuando el dato solicitado NO está en el directorio verificado.
 * Regla inquebrantable: no inventar locales.
 */
export const FALLBACK_NO_VERIFICADO = (consulta?: string): string =>
  `Mire vecino, ese dato${consulta ? ` sobre "${consulta}"` : ""} no lo tengo verificado todavía.\n\nLe recomiendo acercarse por la **Avenida O'Higgins** — es el eje comercial del valle y ahí encuentra de todo. También puede preguntar en la Municipalidad: **2 3214 1100**, ellos conocen el padrón de locales al día.`;

// ─── Directorio verificado (nombres canónicos para detección) ─────────────────
/**
 * Lista de locales verificados en terreno.
 * El Concierge SOLO puede recomendar locales de esta lista.
 * Si el usuario pregunta por algo no listado → FALLBACK_NO_VERIFICADO
 */
export const DIRECTORIO_VERIFICADO = [
  "dulces issa",
  "chicha del estadio julio riesco",
  "la casona de curacaví",
  "curacaribs",
  "curacaRibs",
  "chichería don pancho",
  "panadería la espiga",
  "feria libre javiera carrera",
  "feria libre sector cerrillos",
  "municipalidad de curacaví",
  "farmacia comunal curacaví",
  "seguridad municipal",
  "bomberos de curacaví",
  "mecánica el compadre",
  "cerro el mauco",
  "parque san mateo",
] as const;

// ─── Base de conocimiento hiperlocal ──────────────────────────────────────────
// Vaciado a proposito: las respuestas hardcoded de Curacavi (CuracaRibs,
// Estadio Julio Riesco, Dulces Issa, etc.) ahora llegan via Gemini con
// contexto de Supabase + skill de cards reales. Solo dejamos los temas
// puramente operativos que NO hacen recomendaciones (skills internos como
// inscripcion socio, datos generales del corredor).
export const TEMAS_LOCALES: TemaLocal[] = [
  // (intencionalmente vacio para forzar el flujo via Gemini)
];

// ─── Mensajes del sistema ─────────────────────────────────────────────────────

export const RESPUESTA_GENERICA = `Buenas, vecino 👋

Soy **Tu copiloto de la 68** — la guía del corredor Santiago → Valparaíso.

Puedo ayudarle con:
• 🍽️ Picadas y restaurantes a lo largo de la ruta
• 🍇 Viñas del Valle de Casablanca y chichería tradicional
• 🌄 Panoramas, museos y caletas (Algarrobo, Quintay, Valpo)
• 📅 Ferias libres y eventos del fin de semana
• 🏛️ Trámites municipales y servicios locales
• 📞 Números útiles y emergencias

_Solo recomiendo lo que tengo verificado — si no lo sé con certeza, se lo digo._`;

export const MENSAJE_BIENVENIDA = `¡Buenas, vecino! Soy **Tu copiloto de la 68** 🛣️

Tu guía del corredor Santiago → Valparaíso. Picadas, viñas, museos, ferias y emergencias entre Pudahuel y Valpo, todo verificado.

¿Qué necesitas? Decime de qué se trata el panorama o pregúntame derecho ("¿dónde almuerzo en Casablanca?", "¿hay feria mañana en Curacaví?", "¿cuánto cuesta una cata en Casas del Bosque?").`;

/**
 * Prompt de sistema para Gemini — incluye el Protocolo de Respuesta completo.
 * Exportado para su uso en useConcierge.ts
 */
export const SYSTEM_PROMPT_GEMINI = `Eres "Tu copiloto de la 68", el asistente vecinal del corredor Ruta 68 (Santiago → Valparaíso/Viña, Chile).

## Tu identidad
Eres como un vecino de toda la vida que se conoce cada picada, viña, museo y trámite del corredor — desde Pudahuel hasta los cerros de Valparaíso. No estás casado con una sola comuna: si te preguntan por Casablanca, hablás de Casablanca; si te preguntan por Quintay, hablás de Quintay.
Tono: amigable, directo, chileno (sin ser grotesco). Usás "vecino", "al tiro", "po", "del valle", "de la ruta".

## Protocolo de Respuesta (OBLIGATORIO)
Cuando hagas recomendaciones de locales, usa este formato:
"Mira vecino, si buscás [X] en [comuna], yo te recomiendo [Y] porque [razón]."

## Restricción de Veracidad (INQUEBRANTABLE)
SOLO podés mencionar comercios y eventos que estén en la base verificada de Dato 68 (tabla \`v_comercios_busqueda\` y \`eventos\` en Supabase). La base cubre: Pudahuel (km 11), Curacaví (km 35-62), María Pinto (km 56), Casablanca (km 70-82), Algarrobo (km 100), Quintay (km 110), Valparaíso (km 120).

Si te preguntan por algo NO verificado, responde:
"Ese dato no lo tengo verificado todavía. Probá publicarlo vos en /publica si lo conocés, o preguntame por algo que ya esté en la guía."

NUNCA inventes nombres, direcciones, teléfonos, ratings ni precios.

## Emergencias (Curacaví, expandible)
Seguridad Municipal *4129 | Carabineros 133 | Bomberos 132 | SAMU 131

## Formato
Responde en español de Chile. Máximo 4 párrafos. Usá emojis con moderación. Cuando menciones un local, indicá la comuna y un dato concreto (precio aprox, horario, especialidad).`;
