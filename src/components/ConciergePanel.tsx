/**
 * ConciergePanel.tsx
 * Panel de chat del Concierge del Valle.
 * Soporta tres skills inline:
 *   - SecurityWidget (Directiva #1 — Emergencias)
 *   - PicadasSkill (Skill: RecomendadorDePicadas)
 *   - InscripcionSocioSkill (Skill: InscripcionSocio — 3 pasos)
 */

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Leaf, Loader2 } from "lucide-react";
import type { MensajeChat } from "../lib/useConcierge";
import type { CategoriaComercio } from "../lib/types";
import SecurityWidget from "./SecurityWidget";
import PicadasSkill from "./PicadasSkill";
import InscripcionSocioSkill from "./InscripcionSocioSkill";

// ─── Chips de sugerencias ─────────────────────────────────────────────────────
const SUGERENCIAS: { label: string; query: string }[] = [
  { label: "🍽️ ¿Dónde comer?", query: "donde comer hoy" },
  { label: "🍇 Chicha artesanal", query: "chicha" },
  { label: "🍪 Dulces", query: "dulces" },
  { label: "🏛️ Trámites", query: "trámites municipales" },
  { label: "🌄 Turismo", query: "turismo rural" },
  { label: "🚨 Emergencias", query: "emergencia" },
];

// ─── Renderer Markdown básico ─────────────────────────────────────────────────
function renderMarkdown(texto: string): JSX.Element {
  const lineas = texto.split("\n");
  let keyIdx = 0;
  const elementos: JSX.Element[] = [];

  for (const linea of lineas) {
    keyIdx++;
    const key = `l-${keyIdx}`;

    if (linea.startsWith("## ")) {
      elementos.push(
        <h3 key={key} className="mt-2 font-display text-sm font-bold text-parral-800">
          {linea.slice(3)}
        </h3>
      );
    } else if (linea.startsWith("# ")) {
      elementos.push(
        <h2 key={key} className="mt-2 font-display text-base font-bold text-parral-800">
          {linea.slice(2)}
        </h2>
      );
    } else if (linea.startsWith("• ") || linea.startsWith("* ")) {
      const c = linea.slice(2);
      elementos.push(
        <div key={key} className="flex items-start gap-1.5 text-sm">
          <span className="mt-0.5 text-chicha">•</span>
          <span dangerouslySetInnerHTML={{ __html: inlineBold(c) }} />
        </div>
      );
    } else if (linea.match(/^\d+\. /)) {
      const c = linea.replace(/^\d+\.\s/, "");
      const num = linea.match(/^\d+/)?.[0];
      elementos.push(
        <div key={key} className="flex items-start gap-1.5 text-sm">
          <span className="mt-0.5 shrink-0 font-mono text-xs text-chicha">{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: inlineBold(c) }} />
        </div>
      );
    } else if (linea.startsWith("---")) {
      elementos.push(<hr key={key} className="my-1 border-tierra-200/60" />);
    } else if (linea.trim() === "") {
      elementos.push(<div key={key} className="h-1" />);
    } else {
      elementos.push(
        <p
          key={key}
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineBold(linea) }}
        />
      );
    }
  }
  return <div className="space-y-0.5">{elementos}</div>;
}

function inlineBold(texto: string): string {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-tierra-900">$1</strong>')
    .replace(/_(.*?)_/g, "<em>$1</em>");
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────
function BurbujaChat({ mensaje }: { mensaje: MensajeChat }) {
  const esUsuario = mensaje.rol === "usuario";
  const hora = mensaje.timestamp.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (esUsuario) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-parral-700 px-4 py-3 text-crema shadow-sm">
          <p className="text-sm leading-relaxed">{mensaje.texto}</p>
          <p className="mt-1 text-right text-[10px] text-crema/50">{hora}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-parral-700 text-crema shadow-sm">
        <Leaf size={14} strokeWidth={1.8} />
      </div>
      <div
        className={`max-w-[88%] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ${
          mensaje.urgente
            ? "border border-red-200 bg-red-50 text-red-900"
            : "border border-tierra-100 bg-crema text-tierra-900"
        }`}
      >
        {renderMarkdown(mensaje.texto)}
        <p className="mt-2 text-[10px] text-tierra-400/70">{hora}</p>
      </div>
    </div>
  );
}

function IndicadorEscribiendo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-parral-700 text-crema">
        <Leaf size={14} strokeWidth={1.8} />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-tierra-100 bg-crema px-4 py-3">
        <Loader2 size={14} className="animate-spin text-parral-700" strokeWidth={2} />
        <span className="text-xs text-tierra-500">El copiloto está pensando…</span>
      </div>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
interface Props {
  mensajes: MensajeChat[];
  cargando: boolean;
  mostrarWidgetSeguridad: boolean;
  mostrarPicadas: boolean;
  mostrarInscripcion: boolean;
  categoriaFiltroActiva: CategoriaComercio | undefined;
  comunaFiltroActiva?: string;
  onEnviar: (texto: string) => void;
  onCerrarSeguridad: () => void;
  onCerrarPicadas: () => void;
  onCerrarInscripcion: () => void;
  onLimpiar: () => void;
}

export default function ConciergePanel({
  mensajes,
  cargando,
  mostrarWidgetSeguridad,
  mostrarPicadas,
  mostrarInscripcion,
  categoriaFiltroActiva,
  comunaFiltroActiva,
  onEnviar,
  onCerrarSeguridad,
  onCerrarPicadas,
  onCerrarInscripcion,
  onLimpiar,
}: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando, mostrarPicadas, mostrarInscripcion]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || cargando) return;
    onEnviar(input.trim());
    setInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Área de mensajes ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-3">
          {mensajes.map((m) => (
            <BurbujaChat key={m.id} mensaje={m} />
          ))}
          {cargando && <IndicadorEscribiendo />}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* ── Skills activas (se apilan si hay más de una) ─────────────── */}

      {/* Skill: Seguridad — Directiva #1 */}
      {mostrarWidgetSeguridad && (
        <SecurityWidget onCerrar={onCerrarSeguridad} />
      )}

      {/* Skill: RecomendadorDePicadas */}
      {mostrarPicadas && (
        <PicadasSkill
          categoriaInicial={categoriaFiltroActiva}
          comunaInicial={comunaFiltroActiva}
          onCerrar={onCerrarPicadas}
        />
      )}

      {/* Skill: InscripcionSocio */}
      {mostrarInscripcion && (
        <InscripcionSocioSkill onCerrar={onCerrarInscripcion} />
      )}

      {/* ── Chips de sugerencias — solo mensaje bienvenida ────────────── */}
      {mensajes.length <= 1 && !cargando && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {SUGERENCIAS.map((s) => (
              <button
                key={s.query}
                onClick={() => onEnviar(s.query)}
                className="rounded-full border border-parral-200 bg-white px-3 py-1 text-xs font-medium text-parral-700 transition-colors hover:border-parral-400 hover:bg-parral-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-tierra-100 bg-crema/50 px-3 py-3"
      >
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onLimpiar}
            title="Nueva conversación"
            className="mb-0.5 shrink-0 rounded-full p-1.5 text-tierra-300 transition-colors hover:bg-tierra-100 hover:text-tierra-600"
            aria-label="Limpiar chat"
          >
            <Trash2 size={14} strokeWidth={1.8} />
          </button>

          <textarea
            ref={inputRef}
            id="concierge-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntele al vecino…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-tierra-200 bg-white px-3.5 py-2.5 text-sm text-tierra-900 placeholder-tierra-300 focus:border-parral focus:outline-none focus:ring-1 focus:ring-parral/30"
            style={{ maxHeight: "100px" }}
            aria-label="Mensaje para el copiloto"
          />

          <button
            type="submit"
            disabled={!input.trim() || cargando}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-parral-700 text-crema shadow-sm transition-all hover:bg-parral-900 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Enviar mensaje"
          >
            {cargando ? (
              <Loader2 size={15} className="animate-spin" strokeWidth={2.5} />
            ) : (
              <Send size={15} strokeWidth={2.5} />
            )}
          </button>
        </div>
        <p className="mt-1 text-center text-[10px] text-tierra-300">
          Dato real del valle · Enter para enviar
        </p>
      </form>
    </div>
  );
}
