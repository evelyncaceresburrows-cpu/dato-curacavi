/**
 * Agenda — pantalla de eventos Dato 68 redesign C (mockup Claude Design).
 *
 * Estructura:
 *   1. AppHeader title="Agenda" + botón Publicar
 *   2. Mini-calendario del mes con dots de eventos (lectura)
 *   3. Filter chips (Todos / por categoría)
 *   4. Lista de eventos con sello de fecha + título + lugar + hora + badge categoría
 *
 * Mantiene: useEventos, SEO, navegación a /evento/:slug.
 */
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useEventos } from "@/data/hooks/useEventos";
import { SEO } from "@/components/SEO";
import { AppHeader } from "@/components/lovable/AppHeader";

type CategoriaEvento = "musica" | "gastro" | "cultura" | "deporte" | "naturaleza" | "tradicional";

const ETIQUETA_CATEGORIA: Record<CategoriaEvento, string> = {
  musica: "Música",
  gastro: "Gastro",
  cultura: "Cultura",
  deporte: "Deporte",
  naturaleza: "Naturaleza",
  tradicional: "Tradición",
};

const FILTROS_AGENDA: { key: "todos" | CategoriaEvento; label: string; emoji: string }[] = [
  { key: "todos", label: "Todos", emoji: "" },
  { key: "musica", label: "Música", emoji: "🎵" },
  { key: "gastro", label: "Gastro", emoji: "🍽️" },
  { key: "cultura", label: "Cultura", emoji: "🎭" },
  { key: "deporte", label: "Deporte", emoji: "⚽" },
  { key: "naturaleza", label: "Naturaleza", emoji: "🌿" },
  { key: "tradicional", label: "Tradición", emoji: "🇨🇱" },
];

export default function Agenda() {
  const navigate = useNavigate();
  const { data: eventos = [] } = useEventos();
  const [filtro, setFiltro] = useState<"todos" | CategoriaEvento>("todos");

  // Filtra eventos pasados (con tolerancia de 1 dia para el evento de hoy mismo).
  // Antes mostrabamos eventos que ya pasaron en "Proximos eventos" — confuso.
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const eventosFuturos = useMemo(
    () =>
      eventos.filter((e) => {
        const d = new Date(e.fecha + "T00:00:00");
        return d.getTime() >= hoy.getTime();
      }),
    [eventos, hoy]
  );

  const eventosFiltrados = useMemo(
    () => (filtro === "todos" ? eventosFuturos : eventosFuturos.filter((e) => e.categoria === filtro)),
    [eventosFuturos, filtro]
  );

  // Mes del mini-calendario: SIEMPRE el mes actual. Antes saltaba al mes
  // del primer evento — si tenias evento en Abril y hoy era Mayo, abria
  // mostrando Abril (mes pasado). Confuso.
  const refDate = useMemo(() => new Date(), []);
  const mesNombre = refDate.toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
  const mesUpper = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);

  const diasDelMes = new Date(
    refDate.getFullYear(),
    refDate.getMonth() + 1,
    0
  ).getDate();

  const diasConEvento = useMemo(() => {
    const set = new Set<number>();
    // Marca solo eventos futuros — pasados no se resaltan.
    eventosFuturos.forEach((e) => {
      const d = new Date(e.fecha + "T00:00:00");
      if (
        d.getFullYear() === refDate.getFullYear() &&
        d.getMonth() === refDate.getMonth()
      ) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [eventosFuturos, refDate]);

  return (
    <div style={{ background: "var(--cream)" }} className="min-h-screen pb-32 md:pb-16">
      <SEO
        title="Agenda Cultural — Dato 68"
        description="Panoramas, ferias, fiestas y eventos del valle de Curacaví. Qué hacer este fin de semana, hoy y los próximos días."
        path="/agenda"
      />

      <div className="md:hidden">
        <AppHeader
          title="Agenda"
          action={
            <Link
              to="/socio?tab=evento"
              aria-label="Publicar evento"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: "var(--terracotta)",
                color: "var(--cream)",
              }}
            >
              <Plus size={16} strokeWidth={2.4} />
            </Link>
          }
        />
      </div>

      <div className="mx-auto w-full max-w-2xl px-5 pb-6 md:max-w-none md:px-6 md:pt-12">
      <div className="md:mx-auto" style={{ maxWidth: 1400 }}>
        {/* ─── Mini-calendario ───────────────────────────────────────── */}
        <div
          className="mb-5 rounded-3xl"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--border-soft)",
            padding: "20px 18px",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="font-fraunces"
              style={{
                margin: 0,
                fontSize: 19,
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              {mesUpper}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Mes anterior"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--cream)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                <ChevronLeft size={14} strokeWidth={2.4} style={{ color: "var(--ink)" }} />
              </button>
              <button
                type="button"
                aria-label="Mes siguiente"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--cream)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                <ChevronRight size={14} strokeWidth={2.4} style={{ color: "var(--ink)" }} />
              </button>
            </div>
          </div>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
          >
            {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
              <div
                key={i}
                className="font-inter-tight text-center"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  padding: "4px 0",
                }}
              >
                {d}
              </div>
            ))}
            {Array.from({ length: diasDelMes }, (_, i) => i + 1).map((dia) => {
              const tieneEvento = diasConEvento.has(dia);
              return (
                <button
                  key={dia}
                  type="button"
                  className="relative flex items-center justify-center rounded-lg font-inter-tight"
                  style={{
                    aspectRatio: "1",
                    background: tieneEvento ? "var(--valley)" : "transparent",
                    color: tieneEvento ? "var(--cream)" : "var(--ink)",
                    border: "none",
                    fontSize: 13,
                    fontWeight: tieneEvento ? 700 : 500,
                  }}
                >
                  {dia}
                  {tieneEvento && (
                    <span
                      aria-hidden
                      className="absolute"
                      style={{
                        bottom: 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 3,
                        height: 3,
                        borderRadius: 999,
                        background: "var(--sun)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Filtros ───────────────────────────────────────────────── */}
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
          {FILTROS_AGENDA.map((f) => {
            const active = filtro === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFiltro(f.key)}
                aria-pressed={active}
                className="font-inter-tight inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full"
                style={{
                  padding: "8px 14px",
                  background: active ? "var(--valley)" : "var(--cream)",
                  color: active ? "var(--cream)" : "var(--ink)",
                  border: `1px solid ${active ? "var(--valley)" : "var(--border)"}`,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {f.emoji && <span>{f.emoji}</span>}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ─── Lista próximos ────────────────────────────────────────── */}
        <h3
          className="font-fraunces mb-3.5"
          style={{
            margin: 0,
            fontSize: 19,
            fontWeight: 500,
            color: "var(--ink)",
            marginBottom: 14,
          }}
        >
          Próximos eventos
        </h3>

        {eventosFiltrados.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <div className="font-inter-tight" style={{ fontSize: 15, color: "var(--muted)" }}>
              No hay eventos de este tipo este mes.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-5">
            {eventosFiltrados.map((e, idx) => {
              const d = new Date(e.fecha + "T00:00:00");
              const mes = d
                .toLocaleDateString("es-CL", { month: "short" })
                .toUpperCase()
                .replace(".", "");
              const dia = d.getDate();
              const destacado = idx === 0; // primer evento como destacado visual

              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => navigate(`/evento/${e.slug}`)}
                  className="lift flex items-center gap-3.5 rounded-2xl text-left"
                  style={{
                    background: destacado ? "var(--valley)" : "var(--paper)",
                    color: destacado ? "var(--cream)" : "var(--ink)",
                    border: `1px solid ${destacado ? "var(--valley)" : "var(--border-soft)"}`,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    className="flex shrink-0 flex-col items-center justify-center rounded-xl"
                    style={{
                      width: 56,
                      height: 64,
                      background: destacado ? "var(--sun)" : "var(--cream)",
                      color: destacado ? "var(--ink)" : "var(--valley)",
                    }}
                  >
                    <div
                      className="font-inter-tight"
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        opacity: 0.85,
                      }}
                    >
                      {mes}
                    </div>
                    <div
                      className="font-fraunces"
                      style={{ fontSize: 26, fontWeight: 600, lineHeight: 1 }}
                    >
                      {dia}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="font-inter-tight"
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        marginBottom: 4,
                      }}
                    >
                      {e.titulo}
                    </div>
                    <div
                      className="font-inter-tight"
                      style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}
                    >
                      {e.lugar}
                    </div>
                    <div
                      className="font-inter-tight inline-flex items-center gap-1.5"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    >
                      <Clock size={12} strokeWidth={2} />
                      {e.hora}
                    </div>
                  </div>

                  <div
                    className="font-inter-tight uppercase"
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: destacado
                        ? "rgba(244,196,74,0.2)"
                        : "rgba(31,74,45,0.1)",
                      color: destacado ? "var(--cream)" : "var(--valley)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      flexShrink: 0,
                    }}
                  >
                    {ETIQUETA_CATEGORIA[e.categoria as CategoriaEvento] ?? e.categoria}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
