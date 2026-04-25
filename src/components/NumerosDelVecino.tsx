import { IconCampana, IconTelefono } from "./Icons";
import { NUMEROS_DEL_VECINO } from "../lib/mockData";

/**
 * Widget lateral con los números del vecino.
 * Formato "libreta pegada al teléfono":
 * fondo crema, tipografía monoespaciada en los dígitos,
 * sello de cinta superior.
 */
export default function NumerosDelVecino() {
  return (
    <aside className="sticky top-24 rounded-sm border border-tierra-200 bg-crema shadow-label">
      <header className="relative flex items-center gap-2 border-b border-tierra-200 bg-parral-700 px-5 py-3 text-crema">
        <IconCampana width="20" height="20" strokeWidth={1.8} />
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em]">
          Números del vecino
        </h3>
      </header>

      <ul className="divide-y divide-dashed divide-tierra-200 px-5 py-3">
        {NUMEROS_DEL_VECINO.map((n) => (
          <li key={n.numero} className="py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-chicha-700">
              {n.titulo}
            </p>
            <a
              href={`tel:${n.numero.replace(/\s+/g, "")}`}
              className="mt-1 flex items-center gap-2 font-mono text-lg font-bold tracking-wider text-parral-700 hover:underline"
            >
              <IconTelefono width="16" height="16" strokeWidth={1.8} />
              {n.numero}
            </a>
            <p className="mt-0.5 text-xs text-tierra-700/80">{n.nota}</p>
          </li>
        ))}
      </ul>

      <footer className="border-t border-dashed border-tierra-200 bg-crema-100 px-5 py-3 text-[11px] italic text-tierra-700">
        Guarde esta página en sus favoritos, vecino — para cuando de verdad pica.
      </footer>
    </aside>
  );
}
