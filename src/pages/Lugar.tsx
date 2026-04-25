import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Clock,
  Globe,
  MessageCircle,
  ArrowLeft,
  Navigation,
  BadgeCheck,
} from "lucide-react";
import { comercioBySlug, categoriaDef, COMERCIOS } from "@/data/seed";
import { Chip } from "../components/ui/Chip";
import { Card } from "../components/ui/Card";
import { Rating } from "../components/ui/Rating";
import { SEO } from "@/components/SEO";
import { localBusinessLd, breadcrumbLd } from "@/lib/seoLd";
import { track, Events } from "@/lib/analytics";

export default function Lugar() {
  const { slug = "" } = useParams();
  const comercio = comercioBySlug(slug);

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
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-mont text-3xl font-extrabold text-carbon">
          Lugar no encontrado
        </h1>
        <p className="mt-3 text-humo font-medium">
          El dato que buscabas no está en la guía.
        </p>
        <Link to="/directorio" className="mt-8 inline-block btn-bosque px-8 py-3">
          Volver al directorio
        </Link>
      </div>
    );
  }

  const cat = categoriaDef(comercio.categoria);
  const relacionados = COMERCIOS
    .filter((c) => c.categoria === comercio.categoria && c.id !== comercio.id)
    .slice(0, 3);

  const tel = comercio.telefono?.replace(/[^\d+*]/g, "");
  const wa = comercio.whatsapp?.replace(/[^\d+]/g, "");

  const mapsUrl =
    comercio.lat && comercio.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${comercio.lat},${comercio.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          comercio.direccion + " Curacaví",
        )}`;

  return (
    <div className="bg-arena min-h-screen pb-24">
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
      {/* Hero image */}
      <div className="relative h-[360px] md:h-[420px] w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: comercio.imagen, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        <div className="absolute top-6 left-4 md:left-12">
          <Link
            to="/directorio"
            className="grid h-12 w-12 place-items-center rounded-full bg-white/95 text-carbon shadow-tarjeta backdrop-blur transition-transform active:scale-90"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 md:px-12 pb-8 text-white">
          <div className="mx-auto max-w-screen-lg">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="socio" size="sm">
                {cat.label}
              </Chip>
              {comercio.estado === "socio_pro" && (
                <Chip tone="socio" size="sm" icon={<BadgeCheck size={11} />}>
                  Socio Pro
                </Chip>
              )}
              {comercio.estado === "verificado" && (
                <Chip tone="neutral" size="sm" icon={<BadgeCheck size={11} />}>
                  Verificado
                </Chip>
              )}
            </div>
            <h1 className="mt-4 font-mont text-4xl md:text-5xl font-extrabold leading-tight drop-shadow">
              {comercio.nombre}
            </h1>
            <p className="mt-2 text-white/85 font-medium text-lg">{comercio.subtitulo}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-lg px-4 md:px-12 -mt-6">
        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-4 shadow-tarjeta border border-bosque-600/5">
          <Rating value={comercio.rating} reviews={comercio.reviews} size={16} />
          <span className="text-humo/30">·</span>
          <span className="text-sm font-bold text-carbon uppercase tracking-wider">
            {comercio.precio}
          </span>
          {comercio.abiertoHasta && (
            <>
              <span className="text-humo/30">·</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-carbon">
                <Clock size={14} className="text-bosque-600" />
                Abierto hasta {comercio.abiertoHasta}
              </span>
            </>
          )}
          <div className="ml-auto flex gap-2">
            {tel && (
              <a
                href={`tel:${tel}`}
                onClick={() =>
                  track(Events.LLAMADA_CLICK, { slug: comercio.slug })
                }
                className="grid h-11 w-11 place-items-center rounded-2xl bg-arena-100 text-carbon hover:bg-bosque-50 transition-colors"
                aria-label="Llamar"
              >
                <Phone size={18} />
              </a>
            )}
            {wa && (
              <a
                href={`https://wa.me/${wa.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track(Events.WHATSAPP_CLICK, { slug: comercio.slug })
                }
                className="grid h-11 w-11 place-items-center rounded-2xl bg-arena-100 text-carbon hover:bg-bosque-50 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track(Events.NAVEGAR_CLICK, {
                  slug: comercio.slug,
                  origen: "lugar",
                })
              }
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-bosque-600 px-5 text-white font-bold shadow-cta hover:bg-bosque-700 active:scale-95 transition-all"
            >
              <Navigation size={18} />
              Ir ahora
            </a>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="grid gap-8 md:grid-cols-3 mt-10">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="font-mont text-xs font-bold uppercase tracking-[0.2em] text-humo">
                Sobre el lugar
              </h2>
              <p className="mt-4 text-carbon/90 font-medium text-lg leading-relaxed">
                {comercio.descripcion}
              </p>
            </section>

            {comercio.destacados && comercio.destacados.length > 0 && (
              <section>
                <h2 className="font-mont text-xs font-bold uppercase tracking-[0.2em] text-humo">
                  Lo que destaca
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {comercio.destacados.map((d) => (
                    <Chip key={d} tone="arena" size="md">
                      {d}
                    </Chip>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="p-6">
              <h3 className="font-mont text-xs font-bold uppercase tracking-[0.2em] text-humo">
                Datos de contacto
              </h3>
              <ul className="mt-4 space-y-4 text-sm font-medium text-carbon">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-bosque-600 shrink-0" />
                  <span>{comercio.direccion}</span>
                </li>
                {comercio.telefono && (
                  <li className="flex items-center gap-3">
                    <Phone size={16} className="text-bosque-600 shrink-0" />
                    <a href={`tel:${tel}`} className="hover:text-bosque-600">
                      {comercio.telefono}
                    </a>
                  </li>
                )}
                {comercio.web && (
                  <li className="flex items-center gap-3">
                    <Globe size={16} className="text-bosque-600 shrink-0" />
                    <a
                      href={`https://${comercio.web}`}
                      target="_blank"
                      rel="noopener"
                      className="hover:text-bosque-600 truncate"
                    >
                      {comercio.web}
                    </a>
                  </li>
                )}
              </ul>
            </Card>
          </aside>
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between">
              <h2 className="font-mont text-xl font-extrabold text-carbon">
                Más de {cat.label.toLowerCase()}
              </h2>
              <Link
                to={`/directorio?cat=${cat.key}`}
                className="text-xs font-bold text-bosque-600 uppercase tracking-widest"
              >
                Ver todo
              </Link>
            </div>
            <div className="mt-6 grid gap-6 grid-cols-2 lg:grid-cols-3">
              {relacionados.map((r) => (
                <Card key={r.id} to={`/lugar/${r.slug}`} className="overflow-hidden">
                  <div
                    className="aspect-[4/3] w-full"
                    style={{ background: r.imagen, backgroundSize: "cover", backgroundPosition: "center" }}
                  />
                  <div className="p-5">
                    <h4 className="font-mont font-extrabold text-carbon truncate">
                      {r.nombre}
                    </h4>
                    <p className="mt-0.5 text-xs font-medium text-humo truncate">
                      {r.subtitulo}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Rating value={r.rating} size={12} />
                      <span className="text-[11px] text-humo font-bold">· {r.precio}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
