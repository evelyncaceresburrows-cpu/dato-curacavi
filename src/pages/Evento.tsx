import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  CalendarDays,
  ArrowLeft,
  Ticket,
  BadgeCheck,
} from "lucide-react";
import { eventoBySlug, comercioBySlug, EVENTOS } from "@/data/seed";
import { Chip } from "../components/ui/Chip";
import { Card } from "../components/ui/Card";
import { DateCap } from "../components/ui/DateCap";
import { SEO } from "@/components/SEO";
import { eventoLd, breadcrumbLd } from "@/lib/seoLd";
import { track, Events } from "@/lib/analytics";

export default function Evento() {
  const { slug = "" } = useParams();
  const evento = eventoBySlug(slug);

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
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-mont text-3xl font-extrabold text-carbon">
          Evento no encontrado
        </h1>
        <p className="mt-3 text-humo font-medium">
          Puede que ya haya terminado o que el enlace esté mal.
        </p>
        <Link to="/agenda" className="mt-8 inline-block btn-bosque px-8 py-3">
          Volver a la agenda
        </Link>
      </div>
    );
  }

  const organizador = evento.comercioId ? comercioBySlug(evento.comercioId) : undefined;
  const otros = EVENTOS.filter((e) => e.id !== evento.id).slice(0, 3);

  return (
    <div className="bg-arena min-h-screen pb-24">
      <SEO
        title={`${evento.titulo} — Agenda Curacaví`}
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
      <div className="relative h-[360px] md:h-[420px] w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: evento.imagen, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        <div className="absolute top-6 left-4 md:left-12">
          <Link
            to="/agenda"
            className="grid h-12 w-12 place-items-center rounded-full bg-white/95 text-carbon shadow-tarjeta backdrop-blur transition-transform active:scale-90"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="absolute top-6 right-4 md:right-12">
          <DateCap iso={evento.fecha} size="md" />
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 md:px-12 pb-8 text-white">
          <div className="mx-auto max-w-screen-lg">
            <div className="flex flex-wrap items-center gap-2">
              <Chip bg={evento.chipColor} size="sm" tone="pastel">
                {evento.categoria}
              </Chip>
              {evento.gratis && (
                <Chip tone="socio" size="sm" icon={<Ticket size={11} />}>
                  Entrada liberada
                </Chip>
              )}
              {evento.estado === "socio_pro" && (
                <Chip tone="socio" size="sm" icon={<BadgeCheck size={11} />}>
                  Socio Pro
                </Chip>
              )}
            </div>
            <h1 className="mt-4 font-mont text-4xl md:text-5xl font-extrabold leading-tight drop-shadow">
              {evento.titulo}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-lg px-4 md:px-12 -mt-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-3xl bg-white p-6 shadow-tarjeta border border-bosque-600/5">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-carbon">
            <CalendarDays size={16} className="text-bosque-600" />
            {new Date(evento.fecha + "T00:00:00").toLocaleDateString("es-CL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-carbon">
            <Clock size={16} className="text-bosque-600" />
            {evento.hora} hrs.
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-carbon">
            <MapPin size={16} className="text-bosque-600" />
            {evento.lugar}
          </span>
          {evento.precio && !evento.gratis && (
            <span className="inline-flex items-center gap-2 text-sm font-bold text-carbon">
              <Ticket size={16} className="text-bosque-600" />
              {evento.precio}
            </span>
          )}
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="font-mont text-xs font-bold uppercase tracking-[0.2em] text-humo">
              Qué es
            </h2>
            <p className="mt-4 text-carbon/90 font-medium text-lg leading-relaxed">
              {evento.descripcion}
            </p>
            {evento.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {evento.tags.map((t) => (
                  <Chip key={t} tone="arena" size="md">
                    {t}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          {organizador && (
            <aside>
              <Card to={`/lugar/${organizador.slug}`} className="overflow-hidden">
                <div
                  className="aspect-[4/3] w-full"
                  style={{
                    background: organizador.imagen,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-humo">
                    Organiza
                  </p>
                  <h4 className="mt-1 font-mont font-extrabold text-carbon">
                    {organizador.nombre}
                  </h4>
                  <p className="mt-1 text-xs font-medium text-humo">
                    {organizador.subtitulo}
                  </p>
                </div>
              </Card>
            </aside>
          )}
        </div>

        {otros.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between">
              <h2 className="font-mont text-xl font-extrabold text-carbon">
                Otros datos en agenda
              </h2>
              <Link
                to="/agenda"
                className="text-xs font-bold text-bosque-600 uppercase tracking-widest"
              >
                Ver todo
              </Link>
            </div>
            <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-3">
              {otros.map((e) => (
                <Card key={e.id} to={`/evento/${e.slug}`} className="overflow-hidden">
                  <div
                    className="relative aspect-[4/3] w-full"
                    style={{
                      background: e.imagen,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute top-3 left-3">
                      <DateCap iso={e.fecha} size="sm" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-mont font-extrabold text-carbon line-clamp-1">
                      {e.titulo}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-humo line-clamp-1">
                      {e.lugar} · {e.hora} hrs.
                    </p>
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
