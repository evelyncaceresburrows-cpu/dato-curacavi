/**
 * FloatingConcierge.tsx
 * Botón flotante + panel del Concierge del Valle.
 *
 * UX:
 * - Botón FAB en esquina inferior derecha (encima del tab bar mobile)
 * - Punto rojo pulsante cuando hay mensaje nuevo
 * - Panel desliza desde abajo con animación
 * - Atajo de teclado: Ctrl+K (o Cmd+K) para abrir/cerrar
 *
 * Estilos: paleta Dato 68 (cream / valley / terracotta) via CSS vars.
 * Las clases tailwind antiguas (bg-crema, bg-parral-*, bg-tierra-*) fueron
 * reemplazadas por inline styles con vars — ese era el bug del Concierge
 * "transparente" tras el rebrand.
 */

import { useState, useEffect, useRef } from "react";
import { Leaf, X, ChevronDown } from "lucide-react";
import { useConcierge } from "../lib/useConcierge";
import ConciergePanel from "./ConciergePanel";

export default function FloatingConcierge() {
  const [abierto, setAbierto] = useState(false);
  const [tieneMensajeNuevo, setTieneMensajeNuevo] = useState(false);
  const prevMensajesLen = useRef(1);

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

  useEffect(() => {
    const nuevoLen = mensajes.length;
    if (nuevoLen > prevMensajesLen.current && !abierto) {
      setTieneMensajeNuevo(true);
    }
    prevMensajesLen.current = nuevoLen;
  }, [mensajes, abierto]);

  useEffect(() => {
    if (abierto) setTieneMensajeNuevo(false);
  }, [abierto]);

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
      {/* Backdrop mobile */}
      {abierto && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-[1px] md:hidden"
          style={{ background: "rgba(31,26,20,0.4)" }}
          onClick={() => setAbierto(false)}
          aria-hidden
        />
      )}

      {/* Panel de chat */}
      <div
        className={`
          fixed z-50 flex flex-col overflow-hidden rounded-2xl
          transition-all duration-300 ease-in-out
          bottom-[4.5rem] right-3 left-3
          md:bottom-6 md:left-auto md:right-6 md:w-[380px]
          ${abierto
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
          }
        `}
        style={{
          background: "var(--cream)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 60px -16px rgba(31,26,20,0.35), 0 8px 24px -8px rgba(31,26,20,0.18)",
          height: abierto ? undefined : 0,
          maxHeight: "75dvh",
        }}
        role="dialog"
        aria-label="Concierge del Valle"
        aria-modal="true"
      >
        {/* Header del panel */}
        <div
          className="flex shrink-0 items-center gap-3 px-4 py-3.5"
          style={{
            background: "var(--valley)",
            color: "var(--cream)",
            borderBottom: "1px solid rgba(31,26,20,0.2)",
          }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              background: "var(--valley-mid)",
              boxShadow: "inset 0 0 0 1px rgba(245,240,230,0.2)",
            }}
          >
            <Leaf size={16} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-fraunces" style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.1 }}>
              Concierge del Valle
            </p>
            <p style={{ fontSize: 11, color: "rgba(245,240,230,0.7)" }}>
              Vecino · Curacaví · Siempre disponible
            </p>
          </div>
          <button
            onClick={() => setAbierto(false)}
            className="shrink-0 rounded-full p-1.5 transition-colors"
            style={{ color: "var(--cream)", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--valley-mid)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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

      {/* Botón FAB */}
      <button
        id="concierge-fab"
        onClick={() => setAbierto((prev) => !prev)}
        className="fixed z-50 flex items-center gap-2 rounded-full transition-all duration-300 bottom-[5.25rem] right-4 md:bottom-6 md:right-6"
        style={{
          background: abierto ? "var(--terracotta)" : "var(--valley)",
          color: "var(--cream)",
          padding: abierto ? "12px 16px" : "14px 20px",
          boxShadow: "0 16px 32px -8px rgba(31,26,20,0.35), 0 4px 12px rgba(31,26,20,0.15)",
          border: "none",
          cursor: "pointer",
        }}
        aria-label={abierto ? "Cerrar Concierge" : "Abrir Concierge del Valle"}
        aria-expanded={abierto}
      >
        {/* Punto de notificación */}
        {tieneMensajeNuevo && !abierto && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: "var(--terracotta)" }}
            />
            <span
              className="relative inline-flex h-3.5 w-3.5 rounded-full"
              style={{ background: "var(--terracotta-deep)" }}
            />
          </span>
        )}

        {abierto ? (
          <>
            <X size={18} strokeWidth={2.5} />
            <span className="font-inter-tight" style={{ fontSize: 14, fontWeight: 600 }}>
              Cerrar
            </span>
          </>
        ) : (
          <>
            <Leaf size={18} strokeWidth={1.8} />
            <span
              className="font-inter-tight hidden sm:inline"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              Concierge del Valle
            </span>
          </>
        )}
      </button>
    </>
  );
}
