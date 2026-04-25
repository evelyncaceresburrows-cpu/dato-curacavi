import { BadgeCheck, MapPin, Phone } from "lucide-react";
import type { Comercio } from "../lib/types";
import { CATEGORIAS } from "../lib/types";

interface Props {
  comercio: Comercio;
}

/**
 * Etiqueta Artesanal — fondo blanco puro, borde tierra
 * muy fino, sombra difusa. Al hover sube y revela el
 * botón "Llamar al tiro". El sello "Calidad del Valle"
 * es circular, como sello de cera sobre la etiqueta.
 */
export default function ComercioCard({ comercio }: Props) {
  const cat = CATEGORIAS.find((c) => c.key === comercio.categoria);

  const telHref = comercio.telefono
    ? `tel:${comercio.telefono.replace(/\s+/g, "")}`
    : undefined;

  const mapsHref = `https://www.google.com/maps/search/${encodeURIComponent(
    `${comercio.nombre} Curacaví`
  )}`;

  return (
    <article className="ficha group flex flex-col gap-4 overflow-hidden p-6 pt-7">
      {/* Cinta superior tricolor */}
      <span className="cinta-valle absolute inset-x-0 top-0" />

      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-tierra-200 bg-crema text-tierra-900">
            {cat && <cat.Icon size={22} strokeWidth={1.25} />}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-chicha-700">
              {cat?.label ?? comercio.categoria}
            </p>
            <h3 className="mt-1 font-display text-xl font-bold leading-tight text-tierra-900">
              {comercio.nombre}
            </h3>
          </div>
        </div>

        {/* Sello circular "Calidad del Valle" — solo Pro */}
        {comercio.es_pro && (
          <span
            className="sello-circular shrink-0 -mt-1"
            aria-label="Calidad del Valle — Socio Pro verificado"
            title="Calidad del Valle — Socio Pro"
          >
            <span className="font-display text-[8px] font-bold uppercase leading-tight tracking-[0.18em]">
              Calidad
              <br />
              del Valle
            </span>
          </span>
        )}
      </header>

      <p className="font-serif text-[15.5px] italic leading-relaxed text-tierra-900">
        "{comercio.descripcion_vecina}"
      </p>

      <div className="space-y-1.5 border-t border-dashed border-tierra-200 pt-3 text-[13px] text-tierra-700">
        <p className="flex items-start gap-2">
          <MapPin size={15} strokeWidth={1.25} className="mt-0.5 shrink-0 text-parral" />
          <span>{comercio.direccion}</span>
        </p>
        {comercio.telefono && (
          <p className="flex items-center gap-2 font-mono text-xs tracking-wider">
            <Phone size={13} strokeWidth={1.25} className="shrink-0 text-parral" />
            <span>{comercio.telefono}</span>
          </p>
        )}
      </div>

      {comercio.verificado && (
        <p className="inline-flex w-fit items-center gap-1.5 rounded-md border border-parral-200 bg-parral-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-parral-700">
          <BadgeCheck size={13} strokeWidth={1.5} />
          Verificado por el equipo
        </p>
      )}

      {/* Acciones — Llamar al tiro aparece reforzado al hover */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {telHref && (
          <a
            href={telHref}
            className="btn-valle ring-2 ring-transparent transition-all group-hover:ring-parral-200"
          >
            <Phone size={16} strokeWidth={1.5} />
            Llamar al tiro
          </a>
        )}
        <a href={mapsHref} target="_blank" rel="noreferrer" className="btn-vecino">
          <MapPin size={16} strokeWidth={1.5} />
          Ver mapa
        </a>
      </div>
    </article>
  );
}
