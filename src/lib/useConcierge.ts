/**
 * useConcierge.ts
 * Hook del Concierge del Valle.
 * Motor de conversación con dos capas:
 * 1. Knowledge base local (respuesta inmediata, sin API)
 * 2. Gemini API (respuesta enriquecida si hay clave)
 *
 * Directivas inquebrantables:
 * - Prioridad de Seguridad: detecta emergencia → widget *4129
 * - Fomento Productivo: detecta inscripción → Skill InscripcionSocio
 * - RecomendadorDePicadas: detecta hambre/chicha/dulces → Skill PicadasSkill
 * - Veracidad Local: respuestas desde PLADECO y directorios oficiales
 */

import { useState, useCallback } from "react";
import {
  TEMAS_LOCALES,
  KEYWORDS_EMERGENCIA,
  KEYWORDS_INSCRIPCION,
  KEYWORDS_PICADAS,
  RESPUESTA_GENERICA,
  MENSAJE_BIENVENIDA,
  FALLBACK_NO_VERIFICADO,
  DIRECTORIO_VERIFICADO,
  SYSTEM_PROMPT_GEMINI,
  KEYWORDS_NO_VERIFICADOS,
} from "./conciergeKnowledge";
import type { CategoriaComercio } from "./types";

// ─── Tipos extendidos ─────────────────────────────────────────────────────────

export type SkillActiva =
  | "seguridad"
  | "picadas"
  | "inscripcion_socio"
  | "registro_socio"
  | "tramites"
  | null;

export interface MensajeChat {
  id: string;
  rol: "usuario" | "concierge";
  texto: string;
  timestamp: Date;
  skill?: SkillActiva;
  categoriaFiltro?: CategoriaComercio;
  urgente?: boolean;
}

export interface EstadoConcierge {
  mensajes: MensajeChat[];
  cargando: boolean;
  // Skills activas (pueden coexistir)
  mostrarWidgetSeguridad: boolean;
  mostrarPicadas: boolean;
  mostrarInscripcion: boolean;
  categoriaFiltroActiva: CategoriaComercio | undefined;
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes
}

function matchKw(texto: string, keywords: readonly string[]): boolean {
  const n = normalizarTexto(texto);
  return keywords.some((kw) => n.includes(normalizarTexto(kw)));
}

/** Detecta categoría específica en el mensaje (cubre todo el corredor:
 *  no sólo Curacaví — también Casablanca viñas, museos Valpo, panoramas
 *  Algarrobo/Quintay, etc.). */
function detectarCategoriaPicada(texto: string): CategoriaComercio | undefined {
  const n = normalizarTexto(texto);
  if (n.includes("vina") || n.includes("vino") || n.includes("cata") || n.includes("chicha") || n.includes("moscatel") || n.includes("espumante")) return "chicha";
  if (n.includes("dulce") || n.includes("empolvado") || n.includes("alfajor") || n.includes("pan") || n.includes("kuchen")) return "dulces";
  if (n.includes("museo") || n.includes("cultura") || n.includes("neruda") || n.includes("ascensor") || n.includes("santuario") || n.includes("patrimonio")) return "cultura";
  if (n.includes("panorama") || n.includes("paseo") || n.includes("playa") || n.includes("caleta") || n.includes("mirador") || n.includes("trekking") || n.includes("naturaleza")) return "panoramas";
  if (n.includes("picada") || n.includes("restoran") || n.includes("parrilla") || n.includes("almuerz") || n.includes("comer") || n.includes("comida") || n.includes("hambre") || n.includes("empanad") || n.includes("marisco") || n.includes("pescado") || n.includes("erizo") || n.includes("loco")) return "picadas";
  if (n.includes("tramite") || n.includes("muni") || n.includes("farmacia") || n.includes("permiso")) return "tramites";
  return undefined;
}

function buscarRespuestaLocal(texto: string): {
  respuesta: string | null;
  skill?: SkillActiva;
  categoriaFiltro?: CategoriaComercio;
} {
  const normalizado = normalizarTexto(texto);
  for (const tema of TEMAS_LOCALES) {
    const coincide = tema.palabrasClave.some((kw) =>
      normalizado.includes(normalizarTexto(kw))
    );
    if (coincide) {
      return {
        respuesta: tema.respuesta,
        skill: tema.skill as SkillActiva,
        categoriaFiltro: tema.categoriaFiltro as CategoriaComercio | undefined,
      };
    }
  }
  return { respuesta: null };
}

function generarId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Restricción de veracidad ────────────────────────────────────────────────
/**
 * Revisa si el texto de respuesta de Gemini menciona un local que NO está
 * en el directorio verificado. Si lo hace, devuelve el fallback del protocolo.
 */
function verificarRespuestaGemini(
  respuesta: string,
  consulta: string
): string {
  const n = respuesta.toLowerCase();
  // Si menciona directorio verificado → OK
  const mencionaVerificado = 
    DIRECTORIO_VERIFICADO.some((local) => n.includes(local.toLowerCase())) ||
    n.includes("avenida o'higgins");

  // Si menciona "recomiendo" o "le sugiero" + algo que no es directorio → flag
  const tieneRecomendacion = /recomiendo|sugiero|pruebe|visite|vaya a|le digo/.test(n);
  if (tieneRecomendacion && !mencionaVerificado) {
    // Respuesta con información general es OK; solo flaggear si recomienda local específico
    const mencionaLocalDesconocido = /restauran|local|picada|cocinería|fuente de soda|snack|bar|tienda|comercio/.test(n);
    if (mencionaLocalDesconocido) {
      return FALLBACK_NO_VERIFICADO(consulta);
    }
  }
  return respuesta;
}

async function consultarGemini(
  pregunta: string,
  historial: MensajeChat[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Sin clave Gemini");

  const mensajesGemini = [
    ...historial.slice(-6).map((m) => ({
      role: m.rol === "usuario" ? "user" : "model",
      parts: [{ text: m.texto }],
    })),
    { role: "user" as const, parts: [{ text: pregunta }] },
  ];

  const res = await fetch(
    // gemini-flash-latest: el alias estable que apunta al ultimo Flash con
    // tier gratis activo. gemini-2.0-flash devolvia cuota 0 en cuentas free.
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT_GEMINI }] },
        contents: mensajesGemini,
        generationConfig: { maxOutputTokens: 512, temperature: 0.6 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? RESPUESTA_GENERICA;
  
  // ── Guardia de Veracidad: intercepta si Gemini inventó un local ────────────
  return verificarRespuestaGemini(raw, pregunta);
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useConcierge() {
  const [estado, setEstado] = useState<EstadoConcierge>({
    mensajes: [
      {
        id: generarId(),
        rol: "concierge",
        texto: MENSAJE_BIENVENIDA,
        timestamp: new Date(),
      },
    ],
    cargando: false,
    mostrarWidgetSeguridad: false,
    mostrarPicadas: false,
    mostrarInscripcion: false,
    categoriaFiltroActiva: undefined,
  });

  const enviarMensaje = useCallback(
    async (textoUsuario: string) => {
      if (!textoUsuario.trim()) return;

      const mensajeUsuario: MensajeChat = {
        id: generarId(),
        rol: "usuario",
        texto: textoUsuario.trim(),
        timestamp: new Date(),
      };

      // ── Detección de intenciones ─────────────────────────────────────────
      const esEmergencia = matchKw(textoUsuario, KEYWORDS_EMERGENCIA);
      const tieneNoVerificado = matchKw(textoUsuario, KEYWORDS_NO_VERIFICADOS);
      
      // Solo activamos la skill de picadas si NO hay términos desconocidos/no verificados
      const esPicada = !esEmergencia && !tieneNoVerificado && matchKw(textoUsuario, KEYWORDS_PICADAS);
      const esInscripcion = !esEmergencia && matchKw(textoUsuario, KEYWORDS_INSCRIPCION);
      const categoriaFiltro = esPicada ? detectarCategoriaPicada(textoUsuario) : undefined;

      setEstado((prev) => ({
        ...prev,
        mensajes: [...prev.mensajes, mensajeUsuario],
        cargando: true,
        mostrarWidgetSeguridad: esEmergencia ? true : prev.mostrarWidgetSeguridad,
        mostrarPicadas: esPicada ? true : prev.mostrarPicadas,
        mostrarInscripcion: esInscripcion ? true : prev.mostrarInscripcion,
        categoriaFiltroActiva: esPicada ? (categoriaFiltro ?? prev.categoriaFiltroActiva) : prev.categoriaFiltroActiva,
      }));

      try {
        let textoRespuesta: string;
        let skillDetectado: SkillActiva = null;
        let esUrgente = false;

        // ── Directiva 1: Seguridad — máxima prioridad ─────────────────────
        if (esEmergencia) {
          textoRespuesta = `🚨 **¡Emergencia detectada!**

He activado el panel de números de seguridad. Contacte de inmediato:

• **Seguridad Municipal:** *4129 (patrullaje 24/7)
• **Carabineros:** 133
• **Bomberos:** 132
• **SAMU:** 131

_Mantenga la calma. La ayuda está en camino._`;
          skillDetectado = "seguridad";
          esUrgente = true;

        // ── Skill: RecomendadorDePicadas ────────────────────────────────────
        } else if (esPicada) {
          // Estrategia nueva: Gemini PRIMERO con system prompt corredor-amplio.
          // Si Gemini falla (sin clave, sin red, cuota), cae al KB local
          // hardcoded de Curacavi (ultimo recurso). El texto generado por
          // Gemini se acompaña del card grid del skill (filtrable por
          // categoria + comuna desde Supabase).
          try {
            textoRespuesta = await consultarGemini(textoUsuario, estado.mensajes);
          } catch {
            const { respuesta: respuestaLocal } = buscarRespuestaLocal(textoUsuario);
            if (respuestaLocal) {
              textoRespuesta = respuestaLocal;
            } else {
              const cat = categoriaFiltro;
              const busca = cat
                ? (cat === 'chicha' ? 'una buena vina o chicha' :
                   cat === 'dulces' ? 'dulces tipicos del valle' :
                   cat === 'cultura' ? 'panorama cultural en el corredor' :
                   cat === 'panoramas' ? 'algo al aire libre en la ruta' :
                   'donde comer')
                : 'algo del corredor';
              textoRespuesta = `Mira vecino, te dejo abajo lo que tengo verificado del corredor para "${busca}". Filtra por comuna o categoria para afinar.`;
            }
          }
          skillDetectado = "picadas";

        // ── Skill: InscripcionSocio ─────────────────────────────────────────
        } else if (esInscripcion) {
          textoRespuesta = `Mire vecino, si busca **inscribir su negocio**, yo le recomiendo **registrarse al tiro** porque este piloto 2026 es sin costo regional.\n\nLe abro el formulario aquí mismo para que aparezca en el mapa:`;
          skillDetectado = "inscripcion_socio";

        } else {
          // ── Directiva 3: Knowledge base local ─────────────────────────────
          // Si tiene términos no verificados explicitos, aplicamos protocolo fallback de inmediato
          if (tieneNoVerificado) {
            textoRespuesta = FALLBACK_NO_VERIFICADO(textoUsuario);
          } else {
            const { respuesta: respuestaLocal, skill } = buscarRespuestaLocal(textoUsuario);

            if (respuestaLocal) {
              textoRespuesta = respuestaLocal;
              skillDetectado = (skill as SkillActiva) ?? null;
            } else {
              // Gemini como capa enriquecida
              try {
                textoRespuesta = await consultarGemini(textoUsuario, estado.mensajes);
              } catch {
                textoRespuesta = RESPUESTA_GENERICA;
              }
            }
          }
        }

        const mensajeConcierge: MensajeChat = {
          id: generarId(),
          rol: "concierge",
          texto: textoRespuesta,
          timestamp: new Date(),
          skill: skillDetectado,
          categoriaFiltro,
          urgente: esUrgente,
        };

        setEstado((prev) => ({
          ...prev,
          mensajes: [...prev.mensajes, mensajeConcierge],
          cargando: false,
        }));
      } catch {
        const mensajeError: MensajeChat = {
          id: generarId(),
          rol: "concierge",
          texto:
            "¡Chuta! Se me cortó la señal por un momento, vecino. Intente de nuevo, no más.",
          timestamp: new Date(),
        };
        setEstado((prev) => ({
          ...prev,
          mensajes: [...prev.mensajes, mensajeError],
          cargando: false,
        }));
      }
    },
    [estado.mensajes]
  );

  // ── Cerrar skills ─────────────────────────────────────────────────────────
  const cerrarWidgetSeguridad = useCallback(
    () => setEstado((p) => ({ ...p, mostrarWidgetSeguridad: false })),
    []
  );
  const cerrarPicadas = useCallback(
    () => setEstado((p) => ({ ...p, mostrarPicadas: false })),
    []
  );
  const cerrarInscripcion = useCallback(
    () => setEstado((p) => ({ ...p, mostrarInscripcion: false })),
    []
  );

  // Legacy compat
  const cerrarRegistroSocio = cerrarInscripcion;
  const mostrarRegistroSocio = estado.mostrarInscripcion;

  const limpiarChat = useCallback(() => {
    setEstado({
      mensajes: [
        {
          id: generarId(),
          rol: "concierge",
          texto: MENSAJE_BIENVENIDA,
          timestamp: new Date(),
        },
      ],
      cargando: false,
      mostrarWidgetSeguridad: false,
      mostrarPicadas: false,
      mostrarInscripcion: false,
      categoriaFiltroActiva: undefined,
    });
  }, []);

  return {
    ...estado,
    mostrarRegistroSocio, // legacy
    enviarMensaje,
    cerrarWidgetSeguridad,
    cerrarPicadas,
    cerrarInscripcion,
    cerrarRegistroSocio, // legacy
    limpiarChat,
  };
}
