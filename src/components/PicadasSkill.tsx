/**
 * PicadasSkill.tsx
 * Skill: RecomendadorDePicadas (Tu copiloto del 68)
 *
 * Disparador: "hambre", "donde comer", "chicha", "dulces", "vino", etc.
 * Lee comercios reales de Supabase via useComercios — antes leía sólo el
 * seed `COMERCIOS_SEMILLA` con 12 locales hardcoded de Curacaví. Ahora
 * recomienda del corredor entero (Pudahuel → Valpo, ~50 comercios).
 *
 * UI: tarjetas con comuna, rating, precio (con flag aprox si estimado),
 * botón llamar y link a la ficha. Filtros por categoría y por comuna.
 */

import React from "react";
import { Phone, MapPin, BadgeCheck, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useComercios } from "@/data/hooks/useComercios";
import type { Comercio, Categoria } from "@/data/seed";

// ─── Mapeo categoría → label + emoji ────────────────────────────────────────
const CATEGORIA_LABEL: Record<Categoria, { label: string; emoji: string; tono: string }> = {
  picadas:        { label: "Picadas",        emoji: "🍽️", tono: "var(--valley)" },
  dulces:         { label: "Dulces",         emoji: "🍪", tono: "var(--terracotta)" },
  chicha:         { label: "Viñas/Chicha",   emoji: "🍇", tono: "var(--valley-mid)" },
  panoramas:      { label: "Panoramas",      emoji: "🌄", tono: "var(--sun)" },
  servicios:      { label: "Servicios",      emoji: "🛠️", tono: "var(--ink-soft)" },
  tramites:       { label: "Trámites",       emoji: "🏛️", tono: "var(--ink-soft)" },
  emprendimientos:{ label: "Emprendimientos",emoji: "🌱", tono: "var(--field)" },
  alojamientos:   { label: "Alojamientos",   emoji: "🛏️", tono: "var(--valley)" },
  cultura:        { label: "Cultura",        emoji: "🎨", tono: "var(--terracotta)" },
  emergencias:    { label: "Emergencias",    emoji: "🚨", tono: "var(--terracotta-deep)" },
};

const COMUNA_LABEL: Record<string, string> = {
  pudahuel: "Pudahuel",
  curacavi: "Curacaví",
  maria_pinto: "María Pinto",
  casablanca: "Casablanca",
  algarrobo: "Algarrobo",
  quintay: "Quintay",
  placilla: "Placilla",
  valparaiso: "Valparaíso",
};

// ─── Filtros disponibles ────────────────────────────────────────────────────
const FILTROS_CATEGORIA: { key: Categoria | "todas"; label: string }[] = [
  { key: "todas",     label: "🗺️ Todas" },
  { key: "picadas",   label: "🍽️ Picadas" },
  { key: "dulces",    label: "🍪 Dulces" },
  { key: "chicha",    label: "🍇 Viñas" },
  { key: "panoramas", label: "🌄 Panoramas" },
  { key: "cultura",   label: "🎨 Cultura" },
];

const FILTROS_COMUNA: { key: string; label: string }[] = [
  { key: "todas",      label: "Todas" },
  { key: "curacavi",   label: "Curacaví" },
  { key: "casablanca", label: "Casablanca" },
  { key: "algarrobo",  label: "Algarrobo" },
  { key: "quintay",    label: "Quintay" },
  { key: "valparaiso", label: "Valparaíso" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtClp = (v: number, estimado: boolean) =>
  v === 0 ? "Gratis" : `${estimado ? "aprox " : ""}$${v.toLocaleString("es-CL")}`;

interface ComercioConRuta extends Comercio {
  comuna_id?: string;
  precio_clp_aprox?: number;
  precio_es_estimado?: boolean;
}

function ordenar(lista: ComercioConRuta[]): ComercioConRuta[] {
  return [...lista].sort((a, b) => {
    // 1. Socio Pro primero
    const proA = a.estado === "socio_pro" ? 0 : 1;
    const proB = b.estado === "socio_pro" ? 0 : 1;
    if (proA !== proB) return proA - proB;
    // 2. Rating descendente
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}

// ─── Tarjeta ────────────────────────────────────────────────────────────────
function TarjetaComercio({ c }: { c: ComercioConRuta }) {
  const cat = CATEGORIA_LABEL[c.categoria] ?? CATEGORIA_LABEL.picadas;
  const comuna = c.comuna_id ? COMUNA_LABEL[c.comuna_id] ?? c.comuna_id : null;
  const isPro = c.estado === "socio_pro";
  const tieneFoto = c.imagen?.startsWith("http");

  return (
    <Link
      to={`/lugar/${c.slug}`}
      className="group block overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Foto */}
      {tieneFoto && (
        <div
          style={{
            height: 80,
            background: `url("${c.imagen}") center/cover no-repeat`,
          }}
          aria-hidden
        />
      )}

      <div className="p-3">
        {/* Header: nombre + Pro badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-fraunces text-sm font-bold leading-tight truncate" style={{ color: "var(--ink)" }}>
              {c.nombre}
            </h4>
            <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span
                className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ background: cat.tono, color: "var(--cream)" }}
              >
                {cat.emoji} {cat.label}
              </span>
              {comuna && (
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                  · {comuna}
                </span>
              )}
            </div>
          </div>

          {isPro && (
            <span className="inline-flex items-center gap-0.5 shrink-0 rounded-full px-1.5 py-0.5"
              style={{ background: "var(--sun)", color: "var(--ink)" }}>
              <Star size={9} fill="currentColor" strokeWidth={0} />
              <span className="text-[9px] font-bold uppercase">Socio</span>
            </span>
          )}
        </div>

        {/* Subtitulo / descripción corta */}
        {c.subtitulo && (
          <p className="mt-1.5 text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
            {c.subtitulo}
          </p>
        )}

        {/* Meta: rating + precio */}
        <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px]" style={{ color: "var(--muted)" }}>
          {c.rating > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Star size={9} fill="var(--sun)" strokeWidth={0} />
              <span className="font-bold" style={{ color: "var(--ink)" }}>{c.rating.toFixed(1)}</span>
              <span>({c.reviews})</span>
            </span>
          )}
          {(c as ComercioConRuta).precio_clp_aprox !== undefined && (
            <span className="inline-flex items-center">
              {fmtClp(
                (c as ComercioConRuta).precio_clp_aprox ?? 0,
                (c as ComercioConRuta).precio_es_estimado !== false
              )}
            </span>
          )}
          {c.estado !== "por_confirmar" && (
            <BadgeCheck
              size={11}
              strokeWidth={2}
              style={{ color: "var(--valley-mid)" }}
              aria-label="Verificado"
            />
          )}
        </div>

        {/* Acciones */}
        <div className="mt-2 flex items-center gap-1.5">
          {c.telefono && (
            <a
              href={`tel:${c.telefono.replace(/\s/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition-colors"
              style={{ background: "var(--valley)", color: "var(--cream)" }}
              aria-label={`Llamar ${c.nombre}`}
            >
              <Phone size={10} strokeWidth={2.5} />
              Llamar
            </a>
          )}
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold ml-auto" style={{ color: "var(--terracotta)" }}>
            Ver ficha
            <ChevronRight size={10} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skill ──────────────────────────────────────────────────────────────────
interface Props {
  /** Categoría inicial (cuando el copiloto detecta "vino" → chicha, etc.). */
  categoriaInicial?: Categoria;
  onCerrar?: () => void;
}

export default function PicadasSkill({ categoriaInicial, onCerrar }: Props) {
  const { data: comercios = [] } = useComercios();
  const [catActiva, setCatActiva] = React.useState<Categoria | "todas">(
    categoriaInicial ?? "todas"
  );
  const [comunaActiva, setComunaActiva] = React.useState<string>("todas");

  // Filtra por categoría + comuna + estado verificado/socio_pro (saca por_confirmar y emergencias).
  const filtrados = React.useMemo(() => {
    const lista = (comercios as ComercioConRuta[]).filter((c) => {
      if (c.estado === "por_confirmar") return false;
      if (c.categoria === "emergencias") return false;
      if (catActiva !== "todas" && c.categoria !== catActiva) return false;
      if (comunaActiva !== "todas" && c.comuna_id !== comunaActiva) return false;
      return true;
    });
    return ordenar(lista).slice(0, 24);
  }, [comercios, catActiva, comunaActiva]);

  return (
    <div
      className="mx-3 mb-3 overflow-hidden rounded-2xl shadow-md"
      style={{
        background: "var(--cream)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--ink)" }}>
            Recomendados del corredor
          </p>
          <p className="text-[10px]" style={{ color: "var(--muted)" }}>
            {filtrados.length} verificados · ruta 68
          </p>
        </div>
        {onCerrar && (
          <button
            onClick={onCerrar}
            className="rounded-full p-1 transition-colors"
            style={{ color: "var(--muted)" }}
            aria-label="Cerrar recomendador"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros categoría */}
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2 no-scrollbar">
        {FILTROS_CATEGORIA.map((f) => (
          <button
            key={f.key}
            onClick={() => setCatActiva(f.key as Categoria | "todas")}
            className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors"
            style={{
              background: catActiva === f.key ? "var(--valley)" : "var(--cream)",
              color: catActiva === f.key ? "var(--cream)" : "var(--ink)",
              border: `1px solid ${catActiva === f.key ? "var(--valley)" : "var(--border)"}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Filtros comuna */}
      <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 no-scrollbar">
        {FILTROS_COMUNA.map((f) => (
          <button
            key={f.key}
            onClick={() => setComunaActiva(f.key)}
            className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors"
            style={{
              background: comunaActiva === f.key ? "var(--terracotta)" : "transparent",
              color: comunaActiva === f.key ? "var(--cream)" : "var(--muted)",
              border: `1px solid ${comunaActiva === f.key ? "var(--terracotta)" : "var(--border)"}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-h-[340px] overflow-y-auto px-3 pb-3">
        {filtrados.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <p className="font-fraunces text-[12px] italic leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              "Mira vecino, en esa combinación no tengo nada verificado todavía. Probá ampliar la categoría o cambiar la comuna."
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filtrados.map((c) => (
              <TarjetaComercio key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--paper)", borderTop: "1px solid var(--border)" }}
      >
        <Link
          to="/directorio"
          className="flex items-center gap-1 text-[11px] font-bold"
          style={{ color: "var(--terracotta)" }}
        >
          Ver directorio completo
          <ChevronRight size={11} strokeWidth={2.5} />
        </Link>
        <Link
          to="/ruta"
          className="flex items-center gap-1 text-[11px] font-bold"
          style={{ color: "var(--valley)" }}
        >
          Armar ruta →
        </Link>
      </div>
    </div>
  );
}
