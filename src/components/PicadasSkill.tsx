/**
 * PicadasSkill.tsx
 * Skill: RecomendadorDePicadas
 *
 * Disparador: "hambre", "donde comer", "chicha", "dulces", etc.
 * Lógica:
 *   1. Filtra COMERCIOS_SEMILLA por `verificado === true`
 *   2. Ordena: pros primero (es_pro), luego por categoría coincidente
 *   3. Prioriza socios — "Dulces Issa" encabeza en categoría dulces
 *
 * UI: Tarjetas con estilo de etiqueta artesanal (papel crema,
 *     trazo fino, sello verde parral).
 */

import { Phone, MapPin, BadgeCheck, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { COMERCIOS_SEMILLA } from "../lib/mockData";
import { CATEGORIAS } from "../lib/types";
import type { Comercio, CategoriaComercio } from "../lib/types";

// ─── Colores por categoría ────────────────────────────────────────────────────
const CATEGORIA_STYLE: Record<
  CategoriaComercio,
  { bg: string; text: string; border: string; dot: string }
> = {
  picadas: {
    bg: "bg-parral-50",
    text: "text-parral-700",
    border: "border-parral-200",
    dot: "bg-parral-400",
  },
  dulces: {
    bg: "bg-chicha-50",
    text: "text-chicha-700",
    border: "border-chicha-200",
    dot: "bg-chicha",
  },
  chicha: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  tramites: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  emergencias: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

// ─── Filtro + ordenamiento ────────────────────────────────────────────────────
function filtrarPicadas(categoriaFiltro?: CategoriaComercio): Comercio[] {
  const verificados = COMERCIOS_SEMILLA.filter(
    (c) =>
      c.verificado &&
      c.categoria !== "emergencias" &&
      (categoriaFiltro ? c.categoria === categoriaFiltro : true)
  );

  // Ordenar: pros primero, luego por nombre (Dulces Issa primero en dulces)
  return verificados.sort((a, b) => {
    if (a.es_pro !== b.es_pro) return a.es_pro ? -1 : 1;
    // Prioridad editorial: Dulces Issa siempre primero
    if (a.nombre === "Dulces Issa") return -1;
    if (b.nombre === "Dulces Issa") return 1;
    return a.nombre.localeCompare(b.nombre);
  });
}

// ─── Tarjeta artesanal ────────────────────────────────────────────────────────
function TarjetaPicada({ comercio }: { comercio: Comercio }) {
  const categoriaInfo = CATEGORIAS.find((c) => c.key === comercio.categoria);
  const estilo = CATEGORIA_STYLE[comercio.categoria];

  return (
    <div
      className={`
        relative overflow-hidden rounded-md border bg-white transition-all
        duration-200 hover:-translate-y-0.5 hover:shadow-md
        ${estilo.border}
      `}
    >
      {/* Acento superior — cinta de categoría */}
      <div className={`h-0.5 w-full ${estilo.dot}`} />

      <div className="p-3">
        {/* Header: nombre + badge pro */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-display text-sm font-bold leading-tight text-tierra-900 truncate">
                {comercio.nombre}
              </h4>
              {comercio.es_pro && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-chicha-50 px-1.5 py-0.5 shrink-0">
                  <Star size={9} fill="#D97706" strokeWidth={0} className="text-chicha" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-chicha-700">
                    Socio
                  </span>
                </span>
              )}
            </div>

            {/* Categoría pill */}
            <span
              className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${estilo.bg} ${estilo.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${estilo.dot}`} />
              {categoriaInfo?.label ?? comercio.categoria}
            </span>
          </div>

          {/* Verificado */}
          {comercio.verificado && (
            <BadgeCheck
              size={16}
              strokeWidth={1.5}
              className="shrink-0 text-parral-400 mt-0.5"
              aria-label="Verificado en terreno"
            />
          )}
        </div>

        {/* Descripción */}
        <p className="mt-1.5 font-serif text-[11px] italic leading-relaxed text-tierra-700 line-clamp-2">
          {comercio.descripcion_vecina}
        </p>

        {/* Dirección */}
        {comercio.direccion && (
          <div className="mt-2 flex items-start gap-1 text-[10px] text-tierra-400">
            <MapPin size={10} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            <span className="leading-tight line-clamp-1">{comercio.direccion}</span>
          </div>
        )}

        {/* Teléfono — acción principal */}
        {comercio.telefono && (
          <a
            href={`tel:${comercio.telefono.replace(/\s/g, "")}`}
            className={`
              mt-2 flex items-center gap-1.5 rounded-md px-2.5 py-1.5
              text-[11px] font-bold transition-colors
              ${estilo.bg} ${estilo.text} hover:opacity-80
            `}
            aria-label={`Llamar ${comercio.nombre}`}
          >
            <Phone size={11} strokeWidth={2.5} />
            {comercio.telefono}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Filtros de categoría ─────────────────────────────────────────────────────
const FILTROS: { key: CategoriaComercio | "todas"; label: string }[] = [
  { key: "todas", label: "🗺️ Todas" },
  { key: "picadas", label: "🍽️ Picadas" },
  { key: "dulces", label: "🍪 Dulces" },
  { key: "chicha", label: "🍇 Chicha" },
  { key: "tramites", label: "🏛️ Trámites" },
];

// ─── Skill principal ──────────────────────────────────────────────────────────
interface Props {
  categoriaInicial?: CategoriaComercio;
  onCerrar?: () => void;
}

export default function PicadasSkill({ categoriaInicial, onCerrar }: Props) {
  const [categoriaActiva, setCategoriaActiva] = React.useState<
    CategoriaComercio | "todas"
  >(categoriaInicial ?? "todas");

  const picadas = filtrarPicadas(
    categoriaActiva === "todas" ? undefined : categoriaActiva
  );

  return (
    <div className="mx-3 mb-3 overflow-hidden rounded-md border border-tierra-100 bg-white shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-tierra-100 bg-crema-100 px-4 py-2.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-tierra-700">
            Recomendados del Valle
          </p>
          <p className="text-[10px] text-tierra-400">
            {picadas.length} verificados en terreno
          </p>
        </div>
        {onCerrar && (
          <button
            onClick={onCerrar}
            className="rounded-full p-1 text-tierra-300 hover:text-tierra-600"
            aria-label="Cerrar recomendador"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros de categoría */}
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setCategoriaActiva(f.key as CategoriaComercio | "todas")}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
              categoriaActiva === f.key
                ? "bg-parral-700 text-crema"
                : "border border-tierra-200 bg-white text-tierra-600 hover:border-parral-200 hover:text-parral-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de tarjetas */}
      <div className="max-h-[340px] overflow-y-auto px-3 pb-3">
        {picadas.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p className="font-serif text-[11px] italic leading-relaxed text-tierra-700">
              "Mire vecino, ese dato no lo tengo verificado todavía, pero puede probar en la **Avenida O'Higgins** — es el eje comercial del valle y ahí encuentra de todo."
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {picadas.map((c) => (
              <TarjetaPicada key={c.id} comercio={c} />
            ))}
          </div>
        )}
      </div>

      {/* Footer — link al directorio completo */}
      <div className="border-t border-tierra-100 bg-crema-100 px-4 py-2.5">
        <Link
          to="/directorio"
          className="flex items-center gap-1 text-[11px] font-semibold text-parral-700 hover:underline"
        >
          Ver directorio completo
          <ChevronRight size={11} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

// Necesitamos React en scope por useState arriba
import React from "react";
