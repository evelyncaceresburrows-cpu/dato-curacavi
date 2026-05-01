/**
 * Evento — ficha individual de evento. Redesign C basado en patrón Lugar/Ficha.
 *
 * Layout idéntico al de Lugar pero con datos de evento:
 *   - Hero foto + back
 *   - Sheet paper con eyebrow categoría + h1 + lugar/hora/fecha + descripción
 *   - Card organizador (link a /lugar/:slug)
 *   - Otros eventos (grid 3-col)
 *
 * Mantiene: SEO + JSON-LD eventoLd + breadcrumb + analytics EVENTO_VIEW.
 */
import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Clock, CalendarDays, Ticket } from "lucide-react";
import { useEventos } from "@/data/hooks/useEventos";
import { useComercios } from "@/data/hooks/useComercios";
import { SEO } from "@/components/SEO";
import { eventoLd, breadcrumbLd } from "@/lib/seoLd";
import { track, Events } from "@/lib/analytics";
import { EventCard } from "@/components/lovable/EventCard";

const ETIQUETA_CATEGORIA: Record<string, string> = {
  musica: "Música",
  gastro: "Gastro",
  cultura: "Cultura",
  deporte: "Deporte",
  naturaleza: "Naturaleza",
  tradicional: "Tradición",
};

export default function Evento() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  // Usar useEventos() para leer Supabase + seed unificado. Antes buscaba
  // sólo en EVENTOS local → la Feria Libre y eventos del corredor que viven
  // sólo en Supabase salian como "Evento no encontrado".
  const { data: eventos = [] } = useEventos();
  const { data: comercios = [] } = useComercios();
  const evento = eventos.find((e) => e.slug === slug || e.id === slug);

  useEffect(() => {
    if (evento) {
      track(Events.EVENTO_VIEW, {
        slug: evento.slug,
        categoria: evento.categoria,
      });
    }
  }, [evento]);

  if (!evento) {
    return (
      <div
        style={{ background: "var(--cream)" }}
        className="min-h-screen mx-auto max-w-xl px-6 py-24 text-center"
      >
        <h1
          className="font-fraunces"
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.025em",
          }}
        >
          Evento no encontrado
        </h1>
        <p
          className="font-inter-tight mt-3"
          style={{ fontSize: 15, color: "var(--muted)" }}
        >
          Puede que ya haya terminado o que el enlace esté mal.
        </p>
        <Link
          to="/agenda"
          className="font-inter-tight mt-8 inline-flex items-center gap-2 rounded-xl"
          style={{
            background: "var(--valley)",
            color: "var(--cream)",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Volver a la agenda
        </Link>
      </div>
    );
  }

  const organizador = evento.comercioId
    ? comercios.find((c) => c.slug === evento.comercioId || c.id === evento.comercioId)
    : undefined;
  // "Otros eventos": solo futuros — no mostramos eventos que ya pasaron.
  const otros = (() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return eventos
      .filter((e) => e.id !== evento.id)
      .filter((e) => new Date(e.fecha + "T00:00:00").getTime() >= hoy.getTime())
      .slice(0, 3);
  })();

  const isUrl =
    evento.imagen.startsWith("http") || evento.imagen.startsWith("/");
  const heroBg = isUrl ? `url(${evento.imagen}) center/cover` : evento.imagen;

  const fechaLarga = new Date(evento.fecha + "T00:00:00").toLocaleDateString(
    "es-CL",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div style={{ background: "var(--cream)" }} className="min-h-screen pb-32 md:pb-16">
      <SEO
        title={`${evento.titulo} — Agenda Dato 68`}
        description={evento.descripcion}
        path={`/evento/${evento.slug}`}
        type="article"
        jsonLd={[
          eventoLd(evento),
          breadcrumbLd([
            { name: "Inicio", url: "/" },
            { name: "Agenda", url: "/agenda" },
            { name: evento.titulo, url: `/evento/${evento.slug}` },
          ]),
        ]}
      />

      {/* Hero */}
      <div className="relative" style={{ height: 280, background: heroBg }}>
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--border-soft)",
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.4} style={{ color: "var(--ink)" }} />
          </button>
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0"
          style={{
            height: 120,
            background: "linear-gradient(to bottom, transparent, rgba(31,26,20,0.5))",
          }}
        />
      </div>

      {/* Sheet */}
      <div
        className="relative"
        style={{
          marginTop: -28,
          background: "var(--paper)",
          borderRadius: "28px 28px 0 0",
          padding: "24px 18px",
        }}
      >
        <div className="mx-auto w-full md:max-w-3xl">
          <div
            className="font-inter-tight uppercase"
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--terracotta)",
              letterSpacing: "0.16em",
            }}
          >
            {ETIQUETA_CATEGORIA[evento.categoria] ?? evento.categoria}
            {evento.gratis && " · Entrada liberada"}
          </div>
          <h1
            className="font-fraunces"
            style={{
              margin: "8px 0 6px",
              fontSize: "clamp(28px, 5vw, 36px)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            {evento.titulo}
          </h1>

          {/* Meta row */}
          <div
            className="font-inter-tight mt-4 flex flex-wrap items-center gap-3.5"
            style={{ fontSize: 13, color: "var(--muted)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} strokeWidth={1.8} style={{ color: "var(--valley)" }} />
              {fechaLarga}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} strokeWidth={1.8} style={{ color: "var(--valley)" }} />
              {evento.hora} hrs
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.8} style={{ color: "var(--valley)" }} />
              {evento.lugar}
            </span>
            {evento.precio && !evento.gratis && (
              <span className="inline-flex items-center gap-1.5">
                <Ticket size={14} strokeWidth={1.8} style={{ color: "var(--valley)" }} />
                {evento.precio}
              </span>
            )}
          </div>

          {/* Descripción */}
          <p
            className="font-fraunces"
            style={{
              margin: "20px 0 0",
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
            }}
          >
            {evento.descripcion}
          </p>

          {/* Tags */}
          {evento.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {evento.tags.map((t) => (
                <span
                  key={t}
                  className="font-inter-tight inline-flex rounded-full"
                  style={{
                    background: "var(--cream)",
                    border: "1px solid var(--border-soft)",
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Organizador */}
          {organizador && (
            <div className="mt-6">
              <h3
                className="font-fraunces"
                style={{
                  margin: "0 0 12px",
                  fontSize: 19,
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                }}
              >
                Organiza
              </h3>
              <button
                type="button"
                onClick={() => navigate(`/lugar/${organizador.slug}`)}
                className="lift flex w-full gap-3.5 rounded-2xl text-left"
                style={{
                  background: "var(--cream)",
                  border: "1px solid var(--border-soft)",
                  padding: 12,
                }}
              >
                <div
                  className="shrink-0 overflow-hidden rounded-xl"
                  style={{
                    width: 80,
                    height: 80,
                    background:
                      organizador.imagen.startsWith("http") ||
                      organizador.imagen.startsWith("/")
                        ? `url(${organizador.imagen}) center/cover`
                        : organizador.imagen,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="font-inter-tight uppercase"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--terracotta)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Organiza
                  </div>
                  <div
                    className="font-fraunces mt-0.5"
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "var(--ink)",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {organizador.nombre}
                  </div>
                  <div
                    className="font-inter-tight mt-1"
                    style={{ fontSize: 12, color: "var(--muted)" }}
                  >
                    {organizador.subtitulo}
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Otros eventos */}
          {otros.length > 0 && (
            <div className="mt-8">
              <div className="flex items-end justify-between mb-3">
                <h3
                  className="font-fraunces"
                  style={{
                    margin: 0,
                    fontSize: 19,
                    fontWeight: 500,
                    letterSpacing: "-0.025em",
                  }}
                >
                  Otros eventos
                </h3>
                <Link
                  to="/agenda"
                  className="font-inter-tight"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--terracotta)",
                    letterSpacing: "0.04em",
                  }}
                >
                  VER TODO →
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {otros.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => navigate(`/evento/${e.slug}`)}
                    className="text-left"
                    aria-label={`Ver detalle: ${e.titulo}`}
                  >
                    <EventCard evento={e} variant="horizontal" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
