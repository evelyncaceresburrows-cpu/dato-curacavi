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
  "hambre", "donde comer", "dónde comer", "comer", "picada", "almuerzo",
  "restoran", "restaurant", "parrilla", "comida", "datos",
  "chicha", "chichería", "dulce", "empolvado", "alfajor",
  "feria", "gastronomia", "gastronomía", "que hay", "qué hay",
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
export const TEMAS_LOCALES: TemaLocal[] = [

  // ── CHICHA ─────────────────────────────────────────────────────────────────
  {
    palabrasClave: ["chicha", "chichería", "moscatel", "asoleado", "uva", "vino artesanal"],
    respuesta:
      voz("chicha artesanal", "la Ruta de la Chicha del Estadio Julio Riesco", "es de acá del valle, con productores que llevan más de 100 años en esto") +
`

• **Estadio Julio Riesco** — Agrupación local verificada. Chicha fresca, moscatel y asoleado. Venta directa los fines de semana.
• **Chichería Don Pancho** — Camino a Cuyuncaví s/n. Pase, pruebe de la cuba y llévese garrafa para la semana.
• **La Casona de Curacaví** — Av. O'Higgins 2750. Chicha artesanal dentro de casona colonial de 1840.

💡 _La Fiesta de la Chicha es el evento anual más emblemático del commune. Consulte fecha en la Municipalidad: 2 3214 1100._`,
  },

  // ── COMIDA GENERAL ─────────────────────────────────────────────────────────
  {
    palabrasClave: ["comer", "picada", "almuerzo", "restorán", "restaurant", "parrilla", "comida", "hambre"],
    respuesta:
      voz("dónde comer bien", "CuracaRibs o La Casona", "ambos están verificados en terreno y son de lo que hay en el valle") +
`

• **CuracaRibs** — Costillas ahumadas al estilo texano en la Hostería Antumapu. Verificado. Para llevar también.
• **La Casona de Curacaví** — Centro gastronómico en casona colonial de 1840 con 6.000 m². Cocinerías, artesanía y dulces.
• **Feria Libre Javiera Carrera** — Domingo en la mañana. Verdura fresca y mote con huesillo al paso.

_Si busca otro tipo de cocina, dígame y le reviso en el directorio — no le voy a inventar nada que no tenga verificado._`,
  },

  // ── DULCES ─────────────────────────────────────────────────────────────────
  {
    palabrasClave: ["dulce", "empolvado", "alfajor", "pan amasado", "pastelería", "repostería"],
    respuesta:
      voz("dulces típicos", "Dulces Issa", "es de acá del valle, receta de familia con décadas en el sector") +
`

📍 Av. Ambrosio O'Higgins, sector centro (verificado en terreno 2026).

Si busca pan amasado caliente, también le recomiendo **Panadería La Espiga** en Javiera Carrera 410 — desde las 7 AM y empanadas de pino los fines de semana.

💡 _Si anda de paso por la Ruta 68, son 5 minutos de desvío que de verdad valen._`,
  },

  // ── FERIAS ─────────────────────────────────────────────────────────────────
  {
    palabrasClave: ["feria", "mercado", "verdura", "fruta", "fresco"],
    respuesta:
      voz("feria libre", "la de calle Javiera Carrera", "es la más céntrica y la organizan los domingos en la mañana") +
`

• **Calle Javiera Carrera** — Domingos A.M., sector centro. Verificada por la municipalidad.
• **Sector Cerrillos** — Domingos también, al otro extremo de la commune.

_Llevan: verdura fresca, pescado de la costa, pan amasado y mote con huesillo al paso. Si no sé qué hay ese domingo específico, le recomiendo llamar a la municipalidad al 2 3214 1100 — no le voy a inventar el stock de la feria._`,
  },

  // ── TRÁMITES MUNICIPALES ───────────────────────────────────────────────────
  {
    palabrasClave: ["municipalidad", "muni", "trámite", "permiso", "convenio", "gas", "ramas", "certificado"],
    respuesta:
      voz("hacer un trámite municipal", "la plataforma digital de la Municipalidad de Curacaví", "en enero 2026 modernizaron la central y muchos trámites ya están en línea") +
`

📞 **2 3214 1100** — Central digital, 100 llamados simultáneos.
🌐 municipalidadcuracavi.cl/tramites-digitales

**Trámites verificados en línea:**
• Certificados de residencia
• Convenio de gas
• Retiro de ramas
• Permisos de edificación

⏰ Atención presencial: Lun a vie, 8:30 a 17:00 hrs.`,
    skill: "tramites",
  },

  // ── SALUD ──────────────────────────────────────────────────────────────────
  {
    palabrasClave: ["farmacia", "medicamento", "hospital", "cesfam", "salud", "médico", "doctor"],
    respuesta:
      voz("medicamentos a buen precio", "la Farmacia Comunal de Curacaví", "es para vecinos inscritos y el precio es justo, de la municipalidad") +
`

📍 Plaza Presidente Balmaceda · ☎ 2 2935 1212
⏰ Lun a vie, retire por número.

_Para inscribirse necesita acreditar residencia en la commune (boleta de servicios o contrato). Si tiene urgencia médica, el SAMU es el **131**._`,
    skill: "tramites",
  },

  // ── TURISMO ────────────────────────────────────────────────────────────────
  {
    palabrasClave: ["turismo", "paseo", "cerro", "senderismo", "naturaleza", "parque", "sendero"],
    respuesta:
      voz("turismo rural", "el Cerro El Mauco o el Parque San Mateo", "son los más accesibles del valle y están verificados") +
`

• **Cerro El Mauco** — 1.472 msnm, límite con Casablanca. Senderismo con vista al valle completo.
• **Parque San Mateo** — Senderos y zonas de picnic para la familia.
• **Chicherías centenarias** — Rutas artesanales por caminos rurales.

_Si busca tours organizados, GetYourGuide lista circuitos que incluyen Curacaví como parada hacia Valparaíso — eso ya es externo, yo le puedo confirmar solo lo que tengo verificado acá._`,
  },

  // ── RUTA 68 ────────────────────────────────────────────────────────────────
  {
    palabrasClave: ["ruta 68", "valparaíso", "viña", "costa", "peregrinación", "lo vásquez", "paso"],
    respuesta:
      voz("parar en Curacaví de paso por la Ruta 68", "tres paradas verificadas que no van a fallar", "son las que el equipo conoce en terreno") +
`

1. 🍇 **Estadio Julio Riesco** — Chicha artesanal (fines de semana)
2. 🍪 **Dulces Issa** — Empolvados y alfajores, Av. O'Higgins centro
3. 🥩 **CuracaRibs** — Smokehouse texano, Hostería Antumapu

_En diciembre, durante la Peregrinación a Lo Vásquez, Curacaví se convierte en nodo obligado. Planifique con tiempo — eso sí que se llena._`,
  },

  // ── CONECTIVIDAD ───────────────────────────────────────────────────────────
  {
    palabrasClave: ["internet", "fibra", "wifi", "conectividad", "mi pulso"],
    respuesta:
      voz("internet en zonas rurales de Curacaví", "Mi Pulso Fibra", "es el proveedor local específico para el sector y tiene buen precio") +
`

• **Mi Pulso Fibra** — Planes desde $17.990/mes con WiFi 6. Verificado para zonas rurales de la commune.
• La municipalidad cuadruplicó su propia conectividad en enero 2026.

_Ese dato de pricing puede cambiar — confírmelo directamente con Mi Pulso antes de contratar. Yo le doy el dato que tengo registrado._`,
  },

  // ── DATOS PLADECO ──────────────────────────────────────────────────────────
  {
    palabrasClave: ["curacaví", "información general", "datos", "población", "estadísticas"],
    respuesta: `📊 **Curacaví en números — Censo 2024 (BCN)**

• **Población:** 35.165 habitantes (+7,9% desde 2017)
• **Empresas SII (2023):** ~2.971 registradas
• **Gastronomía y alojamiento:** 161 empresas, mayor crecimiento del rubro
• **Participación electoral 2024:** 90,6% — la más alta de la RM
• **Conectividad rural:** ~94,5% con acceso a internet

_Fuente verificada: BCN, Censo 2024, Biblioteca del Congreso Nacional Chile._`,
  },
];

// ─── Mensajes del sistema ─────────────────────────────────────────────────────

export const RESPUESTA_GENERICA = `Buenas, vecino 👋

Soy el Concierge del Valle — su guía de picadas, trámites y contactos de Curacaví.

Puedo ayudarle con:
• 🍽️ Picadas y gastronomía verificadas
• 🍇 Ruta de la Chicha artesanal
• 🏛️ Trámites municipales sin cola
• 🌄 Turismo rural del valle
• 📞 Números útiles del vecino

_Solo recomiendo lo que tengo verificado en terreno — si no lo sé con certeza, se lo digo._`;

export const MENSAJE_BIENVENIDA = `¡Buenas, vecino! Soy el **Concierge del Valle** 🌿

Su guía digital de Curacaví — picadas verificadas, trámites sin colas y la ruta de la chicha más completa del valle.

¿En qué le puedo ayudar hoy?`;

/**
 * Prompt de sistema para Gemini — incluye el Protocolo de Respuesta completo.
 * Exportado para su uso en useConcierge.ts
 */
export const SYSTEM_PROMPT_GEMINI = `Eres el Concierge del Valle, el agente vecinal oficial de Curacaví, Chile.

## Tu identidad
Eres como un vecino de toda la vida que conoce cada picada, trámite y red de contacto de la commune.
Tono: amigable, directo, chileno (sin ser grotesco). Usas "vecino", "al tiro", "pô", "de acá del valle".

## Protocolo de Respuesta (OBLIGATORIO)
Cuando hagas recomendaciones de locales, DEBES usar este formato:
"Mire vecino, si busca [X], yo le recomiendo [Y] porque [razón relacionada al valle]."

## Restricción de Veracidad (INQUEBRANTABLE)
JAMÁS inventes ni menciones locales, negocios o servicios que no estén en esta lista verificada:
- Dulces Issa (Av. O'Higgins, centro)
- Estadio Julio Riesco / Chicha artesanal (fines de semana)
- Chichería Don Pancho (Camino a Cuyuncaví)
- CuracaRibs / Hostería Antumapu
- La Casona de Curacaví (Av. O'Higgins 2750)
- Panadería La Espiga (Javiera Carrera 410)
- Feria Libre Javiera Carrera (domingos A.M.)
- Feria Libre Sector Cerrillos (domingos)
- Municipalidad de Curacaví (2 3214 1100)
- Farmacia Comunal (Plaza Balmaceda, 2 2935 1212)
- Mecánica El Compadre (Cerrillos 122)
- Cerro El Mauco / Parque San Mateo

Si alguien pregunta por algo NO en esa lista, responde EXACTAMENTE:
"Ese dato no lo tengo verificado todavía, pero puede probar en la Avenida O'Higgins — es el eje comercial del valle."

## Emergencias
Seguridad Municipal *4129 | Carabineros 133 | Bomberos 132 | SAMU 131

## Formato
Responde en español. Máximo 4 párrafos. Usa emojis con moderación.`;
