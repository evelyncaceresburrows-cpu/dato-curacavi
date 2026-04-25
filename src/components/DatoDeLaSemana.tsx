import { Link } from "react-router-dom";
import { IconDulce } from "./Icons";
import { DATO_DE_LA_SEMANA, COMERCIOS_SEMILLA } from "../lib/mockData";

/**
 * "Dato Calado" — sección editorial fija.
 * Destaca un productor real del valle (ej: Dulces Issa o
 * la Chicha del Estadio Julio Riesco).
 */
export default function DatoDeLaSemana() {
  const destacado = COMERCIOS_SEMILLA.find(
    (c) => c.id === DATO_DE_LA_SEMANA.comercio_id
  );

  return (
    <section className="mt-14">
      <div className="mb-4 flex items-end gap-3">
        <h2 className="font-display text-2xl font-semibold text-parral-700">
          El Dato de la Semana
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-chicha">
          &middot; recién calado
        </span>
        <div className="ornamento flex-1 text-tierra-400" aria-hidden />
      </div>

      <article className="relative grid grid-cols-1 gap-6 overflow-hidden rounded-sm border border-tierra-200 bg-gradient-to-br from-chicha-50 via-crema to-parral-50 p-6 shadow-label md:grid-cols-[auto,1fr,auto] md:items-center md:p-8">
        {/* Cinta ornamental lateral */}
        <span className="absolute inset-y-0 left-0 w-1 bg-chicha" />

        <span className="flex h-20 w-20 items-center justify-center rounded-sm border-2 border-chicha-700/40 bg-crema text-chicha-700 shadow-stamp">
          <IconDulce width="44" height="44" strokeWidth={1.4} />
        </span>

        <div>
          <p className="font-serif text-sm italic text-tierra-700">
            {DATO_DE_LA_SEMANA.copete}
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-parral-700">
            {DATO_DE_LA_SEMANA.titular}
          </h3>
          <p className="mt-3 max-w-prose text-sm text-tierra-900">
            {DATO_DE_LA_SEMANA.nota}
          </p>
        </div>

        {destacado && (
          <Link
            to={`/directorio?q=${encodeURIComponent(destacado.nombre)}`}
            className="inline-flex items-center justify-center rounded-sm bg-chicha px-5 py-3 text-sm font-semibold tracking-wide text-crema shadow-stamp transition-colors hover:bg-chicha-700 md:self-center"
          >
            Ver ficha del productor
          </Link>
        )}
      </article>
    </section>
  );
}
