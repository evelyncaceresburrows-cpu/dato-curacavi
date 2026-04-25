import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-lg rounded-sm border border-tierra-200 bg-crema p-12 text-center shadow-label">
      <SEO title="Página no encontrada" noindex />

      <p className="font-display text-7xl font-bold text-parral-700">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-parral-700">
        ¡Chuta! Por aquí no hay nada.
      </h1>
      <p className="mt-2 font-serif italic text-tierra-700">
        Esta página se nos perdió en el camino. Vuelva al inicio y le mostramos
        lo bueno del valle.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-sm bg-parral-700 px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-crema hover:bg-parral-900"
      >
        Volver a la guía
      </Link>
    </section>
  );
}
