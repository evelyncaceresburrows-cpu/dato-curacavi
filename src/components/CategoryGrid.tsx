import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { CATEGORIAS } from "../lib/types";
import type { Comercio, CategoriaComercio } from "../lib/types";
import { contarPorCategoria } from "../lib/types";

interface Props {
  comercios?: Comercio[] | null;
}

/**
 * Fichas de Catálogo — no son botones, son tarjetas de
 * enciclopedia ilustrada. Cada ficha trae un contador
 * real (ej: "12 Chicherías") y la categoría destacada
 * "Lo más buscado" lleva un realce ámbar sutil.
 */
export default function CategoryGrid({ comercios }: Props) {
  const conteo = contarPorCategoria(comercios ?? []);

  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-chicha-700">
            Catálogo del valle
          </span>
          <h2 className="mt-1 font-display text-3xl font-bold text-tierra-900">
            Explore por categoría
          </h2>
        </div>
        <div className="ornamento hidden flex-1 text-tierra-400 sm:block" aria-hidden />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIAS.map((cat) => {
          const n = conteo[cat.key as CategoriaComercio];
          const destacada = cat.destacada;
          return (
            <Link
              key={cat.key}
              to={`/directorio?categoria=${cat.key}`}
              className={`ficha group relative flex flex-col items-start gap-3 p-5 ${
                destacada
                  ? "realce-ambar border-chicha-300 shadow-ambar-glow"
                  : ""
              }`}
            >
              {destacada && (
                <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-chicha px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-crema shadow-valle">
                  <Sparkles size={11} strokeWidth={1.5} />
                  Lo más buscado
                </span>
              )}

              <div className="flex w-full items-start justify-between">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-md border border-tierra-200 bg-crema text-tierra-900 transition-colors group-hover:border-parral group-hover:bg-parral-50 group-hover:text-parral`}
                >
                  <cat.Icon size={26} strokeWidth={1.25} />
                </span>
                <span className="rounded-full border border-tierra-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-tierra-700">
                  {n === 0 ? "—" : `${n} ${n === 1 ? "local" : "locales"}`}
                </span>
              </div>

              <span className="mt-1 font-display text-xl font-bold leading-tight text-tierra-900">
                {cat.label}
              </span>
              <span className="-mt-1 text-[11px] font-semibold uppercase tracking-wider text-chicha-700">
                {cat.subtitulo}
              </span>
              <span className="font-sans text-xs leading-snug text-tierra-700/80">
                {cat.descripcion}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
