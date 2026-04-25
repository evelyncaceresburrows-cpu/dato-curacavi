/**
 * FloatingConcierge.tsx
 * Botón flotante + panel del Concierge del Valle.
 *
 * UX:
 * - Botón FAB en esquina inferior derecha (encima del tab bar mobile)
 * - Punto rojo pulsante cuando hay mensaje nuevo
 * - Panel desliza desde abajo con animación
 * - Se superpone correctamente sobre la nave bar
 * - Atajo de teclado: Ctrl+K (o Cmd+K) para abrir/cerrar
 *
 * Directivas operativas implementadas en el hook useConcierge.
 */

import { useState, useEffect, useRef } from "react";
import { Leaf, X, ChevronDown } from "lucide-react";
import { useConcierge } from "../lib/useConcierge";
import ConciergePanel from "./ConciergePanel";

export default function FloatingConcierge() {
  const [abierto, setAbierto] = useState(false);
  const [tieneMensajeNuevo, setTieneMensajeNuevo] = useState(false);
  const prevMensajesLen = useRef(1); // 1 = mensaje de bienvenida inicial

  const {
    mensajes,
    cargando,
    mostrarWidgetSeguridad,
    mostrarPicadas,
    mostrarInscripcion,
    categoriaFiltroActiva,
    enviarMensaje,
    cerrarWidgetSeguridad,
    cerrarPicadas,
    cerrarInscripcion,
    limpiarChat,
  } = useConcierge();

  // Notificación de mensaje nuevo cuando está cerrado
  useEffect(() => {
    const nuevoLen = mensajes.length;
    if (nuevoLen > prevMensajesLen.current && !abierto) {
      setTieneMensajeNuevo(true);
    }
    prevMensajesLen.current = nuevoLen;
  }, [mensajes, abierto]);

  // Limpiar punto rojo al abrir
  useEffect(() => {
    if (abierto) setTieneMensajeNuevo(false);
  }, [abierto]);

  // Atajo Ctrl+K / Cmd+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setAbierto((prev) => !prev);
      }
      if (e.key === "Escape" && abierto) {
        setAbierto(false);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [abierto]);

  return (
    <>
      {/* ── Backdrop (móvil) ───────────────────────────────────────────── */}
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
          onClick={() => setAbierto(false)}
          aria-hidden
        />
      )}

      {/* ── Panel de chat ─────────────────────────────────────────────── */}
      <div
        className={`
          fixed z-50 flex flex-col overflow-hidden
          bg-crema shadow-2xl border border-tierra-200
          transition-all duration-300 ease-in-out
          /* Mobile: panel desliza desde abajo */
          bottom-[4.5rem] right-3 left-3 rounded-2xl
          md:bottom-6 md:left-auto md:right-6 md:w-[380px] md:rounded-2xl
          ${abierto
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
          }
        `}
        style={{ height: abierto ? undefined : 0, maxHeight: "75dvh" }}
        role="dialog"
        aria-label="Concierge del Valle"
        aria-modal="true"
      >
        {/* Header del panel */}
        <div className="flex shrink-0 items-center gap-3 border-b border-tierra-100 bg-parral-700 px-4 py-3.5 text-crema">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-parral-600 ring-1 ring-white/20">
            <Leaf size={16} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold leading-tight">
              Concierge del Valle
            </p>
            <p className="text-[11px] text-crema/70">
              Vecino · Curacaví · Siempre disponible
            </p>
          </div>
          <button
            onClick={() => setAbierto(false)}
            className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-parral-600"
            aria-label="Cerrar Concierge"
          >
            <ChevronDown size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Cuerpo */}
        <ConciergePanel
          mensajes={mensajes}
          cargando={cargando}
          mostrarWidgetSeguridad={mostrarWidgetSeguridad}
          mostrarPicadas={mostrarPicadas}
          mostrarInscripcion={mostrarInscripcion}
          categoriaFiltroActiva={categoriaFiltroActiva}
          onEnviar={enviarMensaje}
          onCerrarSeguridad={cerrarWidgetSeguridad}
          onCerrarPicadas={cerrarPicadas}
          onCerrarInscripcion={cerrarInscripcion}
          onLimpiar={limpiarChat}
        />
      </div>

      {/* ── Botón FAB ─────────────────────────────────────────────────── */}
      <button
        id="concierge-fab"
        onClick={() => setAbierto((prev) => !prev)}
        className={`
          fixed z-50 flex items-center gap-2
          rounded-full shadow-xl transition-all duration-300
          /* Mobile: encima del tab bar */
          bottom-[5.25rem] right-4
          /* Desktop: esquina libre */  
          md:bottom-6 md:right-6
          ${abierto
            ? "bg-tierra-700 px-4 py-3 text-crema hover:bg-tierra-800"
            : "bg-parral-700 px-5 py-3.5 text-crema hover:bg-parral-800 hover:shadow-2xl hover:-translate-y-0.5"
          }
        `}
        aria-label={abierto ? "Cerrar Concierge" : "Abrir Concierge del Valle"}
        aria-expanded={abierto}
      >
        {/* Punto de notificación */}
        {tieneMensajeNuevo && !abierto && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
          </span>
        )}

        {abierto ? (
          <>
            <X size={18} strokeWidth={2.5} />
            <span className="text-sm font-semibold">Cerrar</span>
          </>
        ) : (
          <>
            <Leaf size={18} strokeWidth={1.8} />
            <span className="hidden text-sm font-semibold sm:block">
              Concierge del Valle
            </span>
          </>
        )}
      </button>
    </>
  );
}
