/**
 * Lugar — ficha individual de comercio. Redesign C (mockup Claude Design > screen-ficha.jsx).
 *
 * Layout:
 *   1. Hero 280px con foto del comercio + AppHeader back/share encima
 *   2. Sheet paper que sube -28px sobre el hero (radius top 28px)
 *      - eyebrow categoría terracotta
 *      - h1 Fraunces
 *      - tagline Fraunces italic
 *      - meta row: rating + reviews + distancia + StatusBadge
 *      - 3 botones: WhatsApp (valley) · Llamar (cream/border) · Mi ruta (toggle terracotta)
 *      - descripción Fraunces
 *      - productos chips
 *      - card horarios + dirección + mini-mapa con DatoMark
 *
 * Mantiene: SEO, JSON-LD localBusiness/breadcrumb, analytics LUGAR_VIEW.
 */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  ChevronLeft,
  Star,
  Clock,
  MapPin,
} from "lucide-react";
import { comercioBySlug, categoriaDef, COMERCIOS } from "@/data/seed";
import { SEO } from "@/components/SEO";
import { localBusinessLd, breadcrumbLd } from "@/lib/seoLd";
import { track, Events } from "@/lib/analytics";
import { StatusBadge } from "@/components/lovable/StatusBadge";
import { DatoMark } from "@/components/lovable/DatoMark";
import { BusinessCard } from "@/components/lovable/BusinessCard";

export default function Lugar() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const comercio = comercioBySlug(slug);
  const [enRuta, setEnRuta] = useState(false);

  useEffect(() => {
    if (comercio) {
      track(Events.LUGAR_VIEW, {
        slug: comercio.slug,
        categoria: comercio.categoria,
      });
    }
  }, [comercio]);

  if (!comercio) {
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
          Lugar no encontrado
        </h1>
        <p
          className="font-inter-tight mt-3"
          style={{ fontSize: 15, color: "var(--muted)" }}
        >
          El dato que buscabas no está en la guía.
        </p>
        <Link
          to="/directorio"
          className="font-inter-tight mt-8 inline-flex items-center gap-2 rounded-xl"
          style={{
            background: "var(--valley)",
            color: "var(--cream)",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Volver al directorio
        </Link>
      </div>
    );
  }

  const cat = categoriaDef(comercio.categoria);
  const relacionados = COMERCIOS.filter(
    (c) => c.categoria === comercio.categoria && c.id !== comercio.id
  ).slice(0, 3);

  const tel = comercio.telefono?.replace(/[^\d+*]/g, "");
  const wa = comercio.whatsapp?.replace(/[^\d+]/g, "");

  const mapsUrl =
    comercio.lat && comercio.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${comercio.lat},${comercio.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          comercio.direccion + " Curacaví",
        )}`;

  // Detecta si imagen es URL o gradiente CSS para usar background apropiado.
  const isUrl =
    comercio.imagen.startsWith("http") || comercio.imagen.startsWith("/");
  const heroBg = isUrl
    ? `url(${comercio.imagen}) center/cover`
    : comercio.imagen;

  return (
    <div style={{ background: "var(--cream)" }} className="min-h-screen pb-32 md:pb-16">
      <SEO
        title={`${comercio.nombre} — ${cat.label}`}
        description={comercio.descripcion}
        path={`/lugar/${comercio.slug}`}
        type="article"
        jsonLd={[
          localBusinessLd(comercio),
          breadcrumbLd([
            { name: "Inicio", url: "/" },
            { name: cat.label, url: `/directorio?cat=${cat.key}` },
            { name: comercio.nombre, url: `/lugar/${comercio.slug}` },
          ]),
        ]}
      />

      {/* ─── Hero (foto + back) ──────────────────────────────────────── */}
      <div
        className="relative"
        style={{ height: 280, background: heroBg }}
      >
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

      {/* ─── Sheet paper que sube sobre el hero ──────────────────────── */}
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
            {cat.label}
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
            {comercio.nombre}
          </h1>
          <div
            className="font-fraunces italic"
            style={{
              fontSize: 14,
              color: "var(--ink-soft)",
              lineHeight: 1.4,
            }}
          >
            {comercio.subtitulo}
          </div>

          {/* Meta row: rating + reviews + distancia + status */}
          <div
            className="font-inter-tight mt-3.5 flex flex-wrap items-center gap-3.5"
            style={{ fontSize: 12, color: "var(--muted)" }}
          >
            <span className="inline-flex items-center gap-1">
              <Star
                size={12}
                style={{ color: "var(--sun)", fill: "var(--sun)" }}
              />
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                {comercio.rating.toFixed(1)}
              </span>
              <span>({comercio.reviews})</span>
            </span>
            {comercio.distanciaKm !== undefined && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} strokeWidth={1.8} />
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

          {/* ─── Botones WhatsApp / Llamar / Mi ruta ────────────────── */}
          <div className="mt-5 flex gap-2">
            {wa ? (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track(Events.WHATSAPP_CLICK, { slug: comercio.slug })
                }
                className="font-inter-tight flex flex-1 items-center justify-center gap-2 rounded-xl"
                style={{
                  background: "var(--valley)",
                  color: "var(--cream)",
                  padding: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  textDecoration: "none",
                }}
              >
                <MessageCircle size={14} strokeWidth={2} />
                WhatsApp
              </a>
            ) : null}
            {tel ? (
              <a
                href={`tel:${tel}`}
                onClick={() =>
                  track(Events.LLAMADA_CLICK, { slug: comercio.slug })
                }
                className="font-inter-tight flex flex-1 items-center justify-center gap-2 rounded-xl"
                style={{
                  background: "var(--cream)",
                  color: "var(--ink)",
                  border: "1.5px solid var(--border)",
                  padding: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <Phone size={14} strokeWidth={2} />
                Llamar
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setEnRuta(!enRuta)}
              aria-pressed={enRuta}
              aria-label={enRuta ? "Quitar de mi ruta" : "Agregar a mi ruta"}
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 50,
                background: enRuta ? "var(--terracotta)" : "var(--cream)",
                color: enRuta ? "var(--cream)" : "var(--ink)",
                border: `1.5px solid ${
                  enRuta ? "var(--terracotta)" : "var(--border)"
                }`,
                padding: 14,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4 V 10 a 3 3 0 0 0 3 3 h 6 a 3 3 0 0 1 3 3 v 4" />
                <circle cx="6" cy="3" r="2" fill="currentColor" />
                <circle cx="18" cy="21" r="2" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Descripción */}
          <p
            className="font-fraunces"
            style={{
              margin: "24px 0 0",
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
            }}
          >
            {comercio.descripcion}
          </p>

          {/* Productos / destacados */}
          {comercio.destacados && comercio.destacados.length > 0 && (
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
                Lo que encuentras
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {comercio.destacados.map((p) => (
                  <span
                    key={p}
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
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card Horario + Dirección con mini-mapa */}
          <div
            className="mt-6 rounded-2xl"
            style={{
              background: "var(--cream)",
              border: "1px solid var(--border-soft)",
              padding: 16,
            }}
          >
            {comercio.abiertoHasta && (
              <div
                className="flex items-start gap-3 pb-3.5"
                style={{ borderBottom: "1px solid var(--border-soft)" }}
              >
                <Clock
                  size={18}
                  strokeWidth={2}
                  style={{ color: "var(--valley)", flexShrink: 0, marginTop: 2 }}
                />
                <div className="flex-1">
                  <div
                    className="font-inter-tight uppercase"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Horario
                  </div>
                  <div
                    className="font-inter-tight"
                    style={{
                      fontSize: 14,
                      color: "var(--ink)",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    Abierto · cierra {comercio.abiertoHasta}
                  </div>
                </div>
              </div>
            )}
            <div
              className="flex items-start gap-3"
              style={{ paddingTop: comercio.abiertoHasta ? 14 : 0 }}
            >
              <MapPin
                size={18}
                strokeWidth={2}
                style={{ color: "var(--valley)", flexShrink: 0, marginTop: 2 }}
              />
              <div className="flex-1">
                <div
                  className="font-inter-tight uppercase"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  Dirección
                </div>
                <div
                  className="font-inter-tight"
                  style={{
                    fontSize: 14,
                    color: "var(--ink)",
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  {comercio.direccion}
                </div>

                {/* Mini-mapa decorativo con DatoMark */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track(Events.NAVEGAR_CLICK, { slug: comercio.slug })
                  }
                  className="relative mt-3 block overflow-hidden rounded-xl"
                  style={{
                    height: 110,
                    background:
                      "linear-gradient(135deg, var(--field) 0%, var(--valley-mid) 100%)",
                  }}
                  aria-label="Ver en Google Maps"
                >
                  <svg
                    viewBox="0 0 200 110"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    <path
                      d="M 0 60 Q 50 40 100 55 T 200 50"
                      fill="none"
                      stroke="var(--cream)"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                    <path
                      d="M 20 90 Q 80 70 150 85"
                      fill="none"
                      stroke="var(--cream)"
                      strokeWidth="1"
                      opacity="0.4"
                    />
                  </svg>
                  <div
                    className="absolute"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -90%)",
                    }}
                  >
                    <DatoMark size={28} />
                  </div>
                  <span
                    className="font-inter-tight absolute uppercase"
                    style={{
                      bottom: 8,
                      right: 12,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--cream)",
                      letterSpacing: "0.08em",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    Ver mapa →
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Galería de fotos extras (hasta 6) */}
          {comercio.imagenesExtra && comercio.imagenesExtra.length > 0 && (
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
                Galería
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {comercio.imagenesExtra.slice(0, 6).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl"
                    style={{
                      aspectRatio: "1",
                      background: "var(--paper)",
                    }}
                    aria-label={`Foto ${i + 1} de ${comercio.nombre}`}
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Relacionados */}
          {relacionados.length > 0 && (
            <div className="mt-8">
              <h3
                className="font-fraunces"
                style={{
                  margin: "0 0 12px",
                  fontSize: 19,
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                }}
              >
                Más {cat.label.toLowerCase()}
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {relacionados.map((r) => (
                  <BusinessCard
                    key={r.id}
                    comercio={r}
                    variant="grid"
                    onClick={() => navigate(`/lugar/${r.slug}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
