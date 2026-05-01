/**
 * Directory — pantalla de búsqueda Dato 68 redesign C (mockup Claude Design).
 *
 * Estructura:
 *   1. AppHeader title="Directorio" (mobile only — desktop usa NavBar global)
 *   2. Search bar input controlado
 *   3. Filter chips horizontales scrollables (Todos + categorías)
 *   4. Counter "{n} lugar(es)"
 *   5. Lista vertical de cards horizontales: foto + categoría + nombre + subtítulo + rating + status
 *
 * Mantiene: useComercios, useSearchParams (deep link cat=), analytics, SEO.
 */
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, Search, Filter, MapPin } from "lucide-react";
import {
  CATEGORIAS,
  CATEGORIAS_HOME_KEYS,
  categoriaDef,
  type Categoria,
  type Comercio,
} from "@/data/seed";
import { useComercios } from "@/data/hooks/useComercios";
import { SEO } from "@/components/SEO";
import { track, Events } from "@/lib/analytics";
import { AppHeader } from "@/components/lovable/AppHeader";
import { StatusBadge } from "@/components/lovable/StatusBadge";

export default function Directory() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat") ?? "todos";
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState(initialCat);

  // Sincroniza ?cat= en la URL para deep links / share.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (selectedCat === "todos") next.delete("cat");
    else next.set("cat", selectedCat);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCat]);

  function handleCatChange(cat: string) {
    setSelectedCat(cat);
    track(Events.CATEGORIA_FILTRO, { cat });
  }

  const { data: comercios = [] } = useComercios();

  // Barra de chips: home primero, luego el resto.
  // Filtramos categorías vacías (sin comercios publicados) para no mostrar
  // chips que llevan a "0 lugares" → mejor UX, sin contenido falso.
  const chipsCategorias = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of comercios) {
      counts.set(c.categoria, (counts.get(c.categoria) ?? 0) + 1);
    }
    const orden = [
      ...CATEGORIAS_HOME_KEYS.map((k) => categoriaDef(k)),
      ...CATEGORIAS.filter((c) => !CATEGORIAS_HOME_KEYS.includes(c.key)),
    ];
    return orden.filter((c) => (counts.get(c.key) ?? 0) > 0);
  }, [comercios]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return comercios.filter((c) => {
      const matchCat = selectedCat === "todos" || c.categoria === selectedCat;
      const matchQuery =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.subtitulo.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedCat, query, comercios]);

  const catLabel =
    selectedCat === "todos"
      ? "Explorar todos los lugares"
      : `Lugares · ${categoriaDef(selectedCat as Categoria).label}`;

  return (
    <div style={{ background: "var(--cream)" }} className="min-h-screen pb-32 md:pb-16">
      <SEO
        title={`${catLabel} — Dato 68`}
        description="Directorio vecinal del valle de Curacaví: picadas, viñas, panaderías, ferias y servicios verificados por la comunidad."
        path={selectedCat === "todos" ? "/directorio" : `/directorio?cat=${selectedCat}`}
      />

      {/* Mobile-only header (desktop usa NavBar global) */}
      <div className="md:hidden">
        <AppHeader
          title="Directorio"
          action={
            <button
              type="button"
              aria-label="Filtrar"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--border-soft)",
                color: "var(--ink)",
              }}
            >
              <Filter size={16} strokeWidth={2} />
            </button>
          }
        />
      </div>

      <div className="mx-auto w-full max-w-2xl md:max-w-none md:px-6 md:pt-12" style={{ maxWidth: "100%" }}>
        <div className="md:mx-auto" style={{ maxWidth: 1400 }}>
        {/* ─── Search ────────────────────────────────────────────────── */}
        <div className="px-5 pb-3.5 pt-1">
          <div
            className="flex items-center gap-2.5 rounded-2xl"
            style={{
              background: "var(--cream)",
              border: "1.5px solid var(--border)",
              padding: "12px 14px",
            }}
          >
            <Search
              size={18}
              strokeWidth={2}
              style={{ color: "var(--muted)" }}
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en el valle…"
              aria-label="Buscar comercios"
              className="font-inter-tight flex-1 bg-transparent outline-none"
              style={{
                fontSize: 14,
                color: "var(--ink)",
                border: "none",
              }}
            />
          </div>
        </div>

        {/* ─── Filter chips horizontales ─────────────────────────────── */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-4">
          <CategoryChipMockup
            label="Todos"
            active={selectedCat === "todos"}
            onClick={() => handleCatChange("todos")}
          />
          {chipsCategorias.map((c) => (
            <CategoryChipMockup
              key={c.key}
              label={c.short}
              icon={<c.Icon size={14} strokeWidth={1.8} />}
              active={selectedCat === c.key}
              onClick={() => handleCatChange(c.key)}
            />
          ))}
        </div>

        {/* ─── Counter ───────────────────────────────────────────────── */}
        <div
          className="font-inter-tight px-5 pb-3"
          style={{
            fontSize: 12,
            color: "var(--muted)",
            fontWeight: 600,
          }}
        >
          {filtrados.length} {filtrados.length === 1 ? "lugar" : "lugares"} · ordenado por relevancia
        </div>

        {/* ─── Lista vertical mobile / grid 2-col desktop ───────────── */}
        <div className="px-5 pb-6 space-y-3 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 lg:grid-cols-3 lg:gap-6">
          {filtrados.map((c) => (
            <ComercioRow
              key={c.id}
              comercio={c}
              onClick={() => navigate(`/lugar/${c.slug}`)}
            />
          ))}
        </div>

        {/* ─── No results ────────────────────────────────────────────── */}
        {filtrados.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: "var(--paper)",
                color: "var(--muted)",
              }}
            >
              <Search size={32} strokeWidth={1.6} />
            </div>
            <h3
              className="font-fraunces mt-5"
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              Sin resultados
            </h3>
            <p
              className="font-inter-tight mt-2"
              style={{ fontSize: 14, color: "var(--muted)" }}
            >
              Probá con otra categoría o término.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCat("todos");
                setQuery("");
              }}
              className="font-inter-tight mt-6 rounded-xl"
              style={{
                background: "var(--valley)",
                color: "var(--cream)",
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
              }}
            >
              Ver todos los lugares
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponentes locales ────────────────────────────────────────────

function CategoryChipMockup({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="font-inter-tight inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full"
      style={{
        padding: "8px 14px",
        background: active ? "var(--valley)" : "var(--cream)",
        color: active ? "var(--cream)" : "var(--ink)",
        border: `1px solid ${active ? "var(--valley)" : "var(--border)"}`,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "-0.005em",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function ComercioRow({
  comercio,
  onClick,
}: {
  comercio: Comercio;
  onClick: () => void;
}) {
  const cat = categoriaDef(comercio.categoria);
  const isUrl =
    comercio.imagen.startsWith("http") || comercio.imagen.startsWith("/");

  return (
    <button
      type="button"
      onClick={onClick}
      className="lift block w-full overflow-hidden rounded-3xl text-left"
      style={{
        background: "var(--cream)",
        border: "1px solid var(--border-soft)",
        padding: 12,
      }}
    >
      <div className="flex gap-3.5">
        <div
          className="shrink-0 overflow-hidden rounded-xl"
          style={{
            width: 88,
            height: 88,
            background: isUrl ? `url(${comercio.imagen}) center/cover` : comercio.imagen,
          }}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div
              className="font-inter-tight uppercase"
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--terracotta)",
                letterSpacing: "0.08em",
              }}
            >
              {cat.label}
            </div>
            <div
              className="font-fraunces mt-0.5 line-clamp-1"
              style={{
                fontSize: 17,
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {comercio.nombre}
            </div>
            <div
              className="font-inter-tight mt-1 line-clamp-2"
              style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.35 }}
            >
              {comercio.subtitulo}
            </div>
          </div>
          <div
            className="font-inter-tight mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1"
            style={{ fontSize: 11, color: "var(--muted)" }}
          >
            <span className="inline-flex items-center gap-1">
              <Star
                size={11}
                style={{ color: "var(--sun)", fill: "var(--sun)" }}
                aria-hidden
              />
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                {comercio.rating.toFixed(1)}
              </span>
            </span>
            {comercio.distanciaKm !== undefined && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} strokeWidth={1.8} aria-hidden />
                {comercio.distanciaKm} km
              </span>
            )}
            <StatusBadge
              estado={
                comercio.categoria === "emergencias"
                  ? "siempre"
                  : comercio.abiertoHasta
                  ? "abierto"
                  : "desconocido"
              }
              cierra={comercio.abiertoHasta}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
