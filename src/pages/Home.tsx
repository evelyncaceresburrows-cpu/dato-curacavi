/**
 * Home — pantalla de inicio Dato 68 redesign C (mockup Claude Design).
 *
 * Estructura:
 *   1. AppHeader (mobile only — desktop usa NavBar global)
 *   2. Saludo dinámico ("Buenos días, vecino")
 *   3. Hero search → /directorio
 *   4. Grid 4-col de categorías → /directorio?cat=...
 *   5. Banner Ruta 68 → /ruta
 *   6. SectionHead "Del día" + carousel destacados
 *   7. SectionHead "Esta semana" + card próximo evento
 *   8. CTA Publica → /socio
 *
 * Mantiene: useComercios, useEventos no se usan acá (Home muestra destacados
 * directos de COMERCIOS/EVENTOS seed por simplicidad). SEO + analytics intacto.
 *
 * Responsive:
 *   - mobile: 1 col, hero a 100% ancho.
 *   - md+: contenedor max-w-2xl centrado (mockup-look). En desktop se ve
 *     como una columna ancha al medio sobre cream.
 */
import { useNavigate } from "react-router-dom";
import { Search, Bell, ArrowRight, Plus, Clock, ChevronRight } from "lucide-react";
import { CATEGORIAS_HOME_KEYS, categoriaDef } from "@/data/seed";
import { useComercios } from "@/data/hooks/useComercios";
import { useEventos } from "@/data/hooks/useEventos";
import { SEO } from "@/components/SEO";
import { organizationLd } from "@/lib/seoLd";
import { track, Events } from "@/lib/analytics";
import { getSaludo } from "@/lib/saludo";
import { AppHeader } from "@/components/lovable/AppHeader";
import { SectionHead } from "@/components/lovable/SectionHead";
import { StatusBadge } from "@/components/lovable/StatusBadge";
import { DatoMark } from "@/components/lovable/DatoMark";

export default function Home() {
  const navigate = useNavigate();
  const saludo = getSaludo();

  // Datos reales desde Supabase (fallback al seed si Supabase falla).
  const { data: comercios = [] } = useComercios();
  const { data: eventos = [] } = useEventos();

  // Top 3 con mejor rating, SOLO categorias que un vecino "sale a visitar".
  // Bomberos / Carabineros / Municipalidad / mecanica no van en destacados —
  // se buscan cuando hace falta, no como panorama del dia.
  const CATEGORIAS_DESTACADAS = new Set([
    "picadas", "chicha", "dulces", "panoramas",
    "cultura", "emprendimientos", "alojamientos",
  ]);
  const destacados = [...comercios]
    .filter((c) => CATEGORIAS_DESTACADAS.has(c.categoria))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);

  // Próximo evento publicado.
  const proxEvento = eventos[0];

  // Categorías home, filtrando vacías (sin comercios publicados).
  const categoriasHome = (() => {
    const counts = new Map<string, number>();
    for (const c of comercios) counts.set(c.categoria, (counts.get(c.categoria) ?? 0) + 1);
    return CATEGORIAS_HOME_KEYS
      .map((k) => categoriaDef(k))
      .filter((c) => (counts.get(c.key) ?? 0) > 0);
  })();

  return (
    <div style={{ background: "var(--cream)" }} className="min-h-screen pb-32 md:pb-16">
      <SEO
        title="Dato 68 — La guía vecinal del valle"
        description="Picadas, viñas, chicha, ferias y eventos del valle de Curacaví. La guía vecinal oficial del corredor Ruta 68."
        path="/"
        jsonLd={organizationLd()}
      />

      {/* Mobile-only header (desktop usa NavBar global del shell) */}
      <div className="md:hidden">
        <AppHeader
          action={
            <button
              type="button"
              aria-label="Notificaciones"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--border-soft)",
                color: "var(--ink)",
              }}
            >
              <Bell size={16} strokeWidth={2} />
            </button>
          }
        />
      </div>

      {/* ─── HERO desktop only — gradient crepúsculo + cordillera SVG ─── */}
      <section
        className="relative hidden overflow-hidden md:flex md:items-center"
        style={{
          background:
            "linear-gradient(180deg, #E8A878 0%, #C8895A 30%, #8B6B52 60%, #5A4A3D 100%)",
          minHeight: 460,
          padding: "80px 0 64px",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=\"1600\" height=\"600\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3ClinearGradient id=\"sky\" x1=\"0%25\" y1=\"0%25\" x2=\"0%25\" y2=\"100%25\"%3E%3Cstop offset=\"0%25\" style=\"stop-color:%23F4C24A;stop-opacity:0.5\"/%3E%3Cstop offset=\"100%25\" style=\"stop-color:%23C8623A;stop-opacity:0.3\"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\"1600\" height=\"600\" fill=\"url(%23sky)\"/%3E%3Cpath d=\"M0,380 Q200,340 400,360 T800,350 T1200,370 T1600,350 L1600,600 L0,600 Z\" fill=\"%23A8844D\" opacity=\"0.6\"/%3E%3Cpath d=\"M0,420 Q250,380 500,400 T1000,390 T1600,410 L1600,600 L0,600 Z\" fill=\"%238B6B4D\" opacity=\"0.7\"/%3E%3Cpath d=\"M0,460 Q300,420 600,440 T1200,430 T1600,450 L1600,600 L0,600 Z\" fill=\"%236B5340\" opacity=\"0.75\"/%3E%3Cpath d=\"M0,500 Q350,460 700,480 T1400,470 T1600,490 L1600,600 L0,600 Z\" fill=\"%234A3A30\" opacity=\"0.8\"/%3E%3C/svg%3E')",
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(245,240,230,0.3) 100%)",
          }}
        />
        <div
          className="relative mx-auto w-full text-center"
          style={{ maxWidth: 1400, padding: "0 24px", zIndex: 2 }}
        >
          <div
            className="font-inter-tight uppercase mx-auto mb-3"
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 1px 6px rgba(31,26,20,0.3)",
            }}
          >
            {saludo.icon} {saludo.sub}
          </div>
          <h1
            className="font-fraunces"
            style={{
              fontSize: 56,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 16,
              color: "white",
              textShadow: "0 2px 20px rgba(31,26,20,0.4)",
            }}
          >
            {saludo.saludo},{" "}
            <em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>
              vecino
            </em>
          </h1>
          <p
            className="mx-auto"
            style={{
              fontSize: 18,
              maxWidth: 600,
              lineHeight: 1.6,
              marginBottom: 32,
              color: "rgba(255,255,255,0.95)",
              textShadow: "0 1px 8px rgba(31,26,20,0.3)",
            }}
          >
            Todo lo que buscas en Curacaví y la Ruta 68: panaderías, viñas,
            ferias, restaurantes y más.
          </p>
          <button
            type="button"
            onClick={() => navigate("/directorio")}
            className="mx-auto flex items-center gap-3 rounded-2xl"
            style={{
              maxWidth: 600,
              width: "100%",
              background: "white",
              border: "2px solid var(--border)",
              padding: "14px 20px",
              boxShadow: "0 4px 24px rgba(31,26,20,0.08)",
            }}
          >
            <Search size={20} strokeWidth={2} style={{ color: "var(--valley)" }} />
            <span
              className="font-inter-tight flex-1 text-left"
              style={{ fontSize: 16, color: "var(--muted)" }}
            >
              Buscar panaderías, viñas, ferias…
            </span>
          </button>
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl md:max-w-none md:px-6 md:pt-12">
        {/* ─── Saludo (mobile) ───────────────────────────────────────── */}
        <div className="px-5 pt-2 pb-5 md:hidden">
          <div
            className="mb-1.5 font-inter-tight uppercase"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            {saludo.icon} {saludo.sub}
          </div>
          <h1
            className="font-fraunces"
            style={{
              margin: 0,
              fontWeight: 500,
              fontSize: "clamp(28px, 6vw, 38px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            {saludo.saludo},
            <br />
            <em
              style={{
                fontStyle: "italic",
                color: "var(--terracotta)",
                fontWeight: 500,
              }}
            >
              vecino
            </em>
            .
          </h1>
        </div>

        {/* ─── Hero search (mobile only — desktop ya tiene el hero gradient) ─── */}
        <div className="px-5 pb-6 md:hidden">
          <button
            type="button"
            onClick={() => navigate("/directorio")}
            className="flex w-full items-center gap-3 rounded-2xl text-left"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--border-soft)",
              padding: "16px 18px",
            }}
          >
            <Search
              size={20}
              strokeWidth={2}
              style={{ color: "var(--muted)" }}
              aria-hidden
            />
            <span
              className="font-inter-tight flex-1"
              style={{ fontSize: 15, color: "var(--muted)" }}
            >
              Buscar pan, viñas, ferias…
            </span>
            <span
              className="font-inter-tight"
              style={{
                background: "var(--valley)",
                color: "var(--cream)",
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              ⌘K
            </span>
          </button>
        </div>

        {/* ─── Categorías 4-col mobile / 8-col desktop ──────────────── */}
        <SectionHead title="Categorías" sub="Lo que mueve al valle" />
        <div className="grid grid-cols-4 gap-2 px-3.5 pb-7 md:grid-cols-8 md:gap-3 md:px-0">
          {categoriasHome.slice(0, 8).map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => navigate(`/directorio?cat=${c.key}`)}
              className="flex flex-col items-center gap-1.5 rounded-2xl"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--border-soft)",
                padding: "14px 4px",
              }}
            >
              <c.Icon size={26} strokeWidth={1.6} style={{ color: "var(--ink)" }} />
              <span
                className="font-inter-tight text-center"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--ink)",
                  letterSpacing: "-0.005em",
                }}
              >
                {c.short}
              </span>
            </button>
          ))}
        </div>

        {/* ─── Banner Ruta 68 ────────────────────────────────────────── */}
        <div className="px-5 pb-7">
          <button
            type="button"
            onClick={() => navigate("/ruta")}
            className="relative w-full overflow-hidden rounded-3xl text-left"
            style={{
              // Foto Unsplash de viñedo con cordillera (placeholder hasta que
              // subas la tuya: editar `comercios.imagen` o pasar URL aquí).
              backgroundImage:
                "linear-gradient(135deg, rgba(31,74,45,0.78) 0%, rgba(63,123,71,0.55) 100%), url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80&auto=format&fit=crop&fm=jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "var(--cream)",
              padding: "32px 24px",
              minHeight: 220,
              border: "none",
            }}
          >
            <div
              className="font-inter-tight uppercase"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                opacity: 0.7,
                marginBottom: 8,
              }}
            >
              Ruta 68 · Curacaví → Valpo
            </div>
            <div
              className="font-fraunces"
              style={{
                fontSize: "clamp(22px, 5vw, 28px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              Arma tu domingo
              <br />
              por el{" "}
              <em style={{ fontStyle: "italic", color: "var(--sun)" }}>valle</em>.
            </div>
            <div
              className="inline-flex items-center gap-1.5"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              Empezar ruta
              <ArrowRight size={14} strokeWidth={2.4} />
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: -12,
                bottom: -16,
                opacity: 0.18,
              }}
            >
              <DatoMark size={120} />
            </div>
          </button>
        </div>

        {/* ─── Destacados ────────────────────────────────────────────── */}
        <SectionHead
          title="Del día"
          sub="Comercios destacados"
          action={
            <button
              type="button"
              onClick={() => navigate("/directorio")}
              className="font-inter-tight"
              style={{
                background: "none",
                border: "none",
                color: "var(--terracotta)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              VER TODO →
            </button>
          }
        />
        <div className="flex gap-3 overflow-x-auto px-5 pb-7 no-scrollbar md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {destacados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/lugar/${c.slug}`)}
              className="shrink-0 overflow-hidden rounded-3xl text-left md:w-auto"
              style={{
                width: 220,
                background: "var(--paper)",
                border: "1px solid var(--border-soft)",
                padding: 0,
              }}
            >
              <div
                style={{
                  height: 130,
                  // Si imagen es URL http(s) usamos url(); si no, asumimos
                  // que es un gradiente CSS (linear-gradient, etc).
                  background: /^https?:\/\//.test(c.imagen)
                    ? `url("${c.imagen}") center/cover no-repeat`
                    : c.imagen,
                  position: "relative",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="font-inter-tight"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "var(--cream)",
                    borderRadius: 999,
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  ★ {c.rating.toFixed(1)}
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div
                  className="font-inter-tight uppercase"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--terracotta)",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  {categoriaDef(c.categoria).label}
                </div>
                <div
                  className="font-fraunces"
                  style={{
                    fontWeight: 500,
                    fontSize: 17,
                    letterSpacing: "-0.02em",
                    color: "var(--ink)",
                    marginBottom: 4,
                    lineHeight: 1.15,
                  }}
                >
                  {c.nombre}
                </div>
                <div
                  className="font-inter-tight"
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    lineHeight: 1.4,
                    marginBottom: 8,
                  }}
                >
                  {c.subtitulo}
                </div>
                <StatusBadge
                  estado={
                    c.categoria === "emergencias"
                      ? "siempre"
                      : c.abiertoHasta
                      ? "abierto"
                      : "cerrado"
                  }
                  cierra={c.abiertoHasta}
                />
              </div>
            </button>
          ))}
        </div>

        {/* ─── Próximo evento ────────────────────────────────────────── */}
        <SectionHead
          title="Esta semana"
          sub="Próximos eventos"
          action={
            <button
              type="button"
              onClick={() => {
                track(Events.BUSCAR, { q: "agenda-home" });
                navigate("/agenda");
              }}
              className="font-inter-tight"
              style={{
                background: "none",
                border: "none",
                color: "var(--terracotta)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              AGENDA →
            </button>
          }
        />
        {proxEvento && (() => {
          const d = new Date(proxEvento.fecha + "T00:00:00");
          const mes = d.toLocaleDateString("es-CL", { month: "short" }).toUpperCase().replace(".", "");
          const dia = d.getDate();
          return (
            <div className="px-5 pb-7">
              <button
                type="button"
                onClick={() => navigate(`/evento/${proxEvento.slug}`)}
                className="flex w-full items-center gap-3.5 rounded-2xl text-left"
                style={{
                  background: "var(--cream)",
                  border: "1px solid var(--border)",
                  padding: 14,
                }}
              >
                <div
                  className="flex shrink-0 flex-col items-center justify-center rounded-xl"
                  style={{
                    width: 56,
                    height: 64,
                    background: "var(--terracotta)",
                    color: "var(--cream)",
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
                    className="font-fraunces"
                    style={{
                      fontSize: 17,
                      fontWeight: 500,
                      color: "var(--ink)",
                      letterSpacing: "-0.015em",
                      marginBottom: 4,
                    }}
                  >
                    {proxEvento.titulo}
                  </div>
                  <div
                    className="font-inter-tight"
                    style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}
                  >
                    {proxEvento.lugar}
                  </div>
                  <div
                    className="font-inter-tight inline-flex items-center gap-1"
                    style={{
                      fontSize: 12,
                      color: "var(--valley-mid)",
                      fontWeight: 600,
                    }}
                  >
                    <Clock size={12} strokeWidth={2} /> {proxEvento.hora}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: "var(--muted)" }} />
              </button>
            </div>
          );
        })()}

        {/* ─── CTA Publica ───────────────────────────────────────────── */}
        <div className="px-5 pb-6">
          <button
            type="button"
            onClick={() => navigate("/socio")}
            className="flex w-full items-center gap-3.5 rounded-2xl text-left"
            style={{
              background: "var(--paper)",
              border: "1.5px dashed var(--terracotta)",
              padding: "16px 18px",
            }}
          >
            <div
              className="flex shrink-0 items-center justify-center rounded-xl"
              style={{
                width: 40,
                height: 40,
                background: "var(--terracotta)",
                color: "var(--cream)",
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="font-fraunces"
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "var(--ink)",
                  letterSpacing: "-0.015em",
                }}
              >
                ¿Tienes un negocio en Curacaví?
              </div>
              <div
                className="font-inter-tight"
                style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}
              >
                Publícalo gratis en Dato 68
              </div>
            </div>
            <ChevronRight size={14} strokeWidth={2.2} style={{ color: "var(--muted)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
