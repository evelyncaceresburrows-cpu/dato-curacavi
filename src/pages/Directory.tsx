import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Star,
  Filter,
  Search,
} from "lucide-react";
import {
  CATEGORIAS,
  CATEGORIAS_HOME_KEYS,
  categoriaDef,
  type Categoria,
} from "@/data/seed";
import { useComercios } from "@/data/hooks/useComercios";
import { SEO } from "@/components/SEO";
import { track, Events } from "@/lib/analytics";

export default function Directory() {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat") ?? "todos";
  const [query, setQuery] = useState(initialCat === "todos" ? "" : "");
  const [selectedCat, setSelectedCat] = useState(initialCat);

  function handleCatChange(cat: string) {
    setSelectedCat(cat);
    track(Events.CATEGORIA_FILTRO, { cat });
  }

  const { data: comercios = [] } = useComercios();

  // Barra de chips: home primero, luego el resto (evitando duplicados).
  const chipsCategorias = [
    ...CATEGORIAS_HOME_KEYS.map((k) => categoriaDef(k)),
    ...CATEGORIAS.filter((c) => !CATEGORIAS_HOME_KEYS.includes(c.key)),
  ];

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return comercios.filter((c) => {
      const matchCat = selectedCat === "todos" || c.categoria === selectedCat;
      const matchQuery =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.subtitulo.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedCat, query, comercios]);

  void setParams; // reservado para futura persistencia del filtro

  const catLabel =
    selectedCat === "todos"
      ? "Explorar todos los lugares"
      : `Lugares · ${categoriaDef(selectedCat as Categoria).label}`;

  return (
    <div className="mx-auto max-w-screen-xl px-4 md:px-12 py-8 md:py-16 bg-arena min-h-screen">
      <SEO
        title={`${catLabel} — Dato Curacaví`}
        description="Directorio vecinal de Curacaví: picadas, chicha, dulces, alojamientos, servicios y trámites del valle."
        path={selectedCat === "todos" ? "/directorio" : `/directorio?cat=${selectedCat}`}
      />
      {/* ——— Header / Title ——— */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mont text-3xl font-extrabold text-carbon tracking-tight">
            Explorar
          </h1>
          <p className="mt-1 text-[15px] font-medium text-humo">
            Lo mejor de Curacaví en un solo lugar
          </p>
        </div>
        <div className="flex gap-2">
           <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-tarjeta text-carbon">
             <Search size={20} />
           </button>
           <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-tarjeta text-carbon">
             <Filter size={20} />
           </button>
        </div>
      </header>

      {/* ——— Categories Scroller ——— */}
      <section className="mb-12 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-3">
          <button
            onClick={() => handleCatChange("todos")}
            className={`whitespace-nowrap rounded-2xl px-6 py-3.5 text-[13px] font-extrabold transition-all ${
              selectedCat === "todos"
                ? "bg-bosque-600 text-white shadow-cta"
                : "bg-white text-carbon shadow-tarjeta"
            }`}
          >
            Todos
          </button>
          {chipsCategorias.map((c) => (
            <button
              key={c.key}
              onClick={() => handleCatChange(c.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-6 py-3.5 text-[13px] font-extrabold transition-all ${
                selectedCat === c.key
                  ? "bg-bosque-600 text-white shadow-cta"
                  : "bg-white text-carbon shadow-tarjeta"
              }`}
            >
              <c.Icon size={16} />
              {c.short}
            </button>
          ))}
        </div>
      </section>

      {/* ——— Grid de Resultados ——— */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtrados.map((l) => (
          <Link
            key={l.id}
            to={`/lugar/${l.slug}`}
            className="flex flex-col gap-4 group"
          >
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-tarjeta">
               <div 
                className="h-full w-full transition-transform duration-700 group-hover:scale-110"
                style={{ background: l.imagen, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              
              {/* Badge "Sello de Calidad" logic based on rating */}
              {l.rating >= 4.8 && (
                <div className="absolute top-4 left-4">
                   <div className="flex items-center gap-1.5 rounded-xl bg-bosque-600 px-3 py-2 shadow-cta">
                      <Star size={12} fill="white" className="text-white" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                        Sello de Calidad
                      </span>
                   </div>
                </div>
              )}

              {/* Rating overlay bottom right */}
              <div className="absolute bottom-4 right-4">
                 <div className="flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 shadow-tarjeta backdrop-blur">
                    <Star size={12} fill="currentColor" className="text-amber-500" />
                    <span className="text-[11px] font-bold text-carbon">
                      {l.rating}
                    </span>
                 </div>
              </div>
            </div>

            <div className="px-1">
              <h3 className="font-mont text-lg font-extrabold text-carbon line-clamp-1 group-hover:text-bosque-600 transition-colors">
                {l.nombre}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-humo line-clamp-1">
                {l.subtitulo} &middot; {l.precio}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ——— No Results ——— */}
      {filtrados.length === 0 && (
        <div className="mt-20 text-center py-20 bg-white rounded-3xl shadow-tarjeta">
           <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-arena flex items-center justify-center text-humo">
                 <Search size={40} />
              </div>
           </div>
           <h3 className="font-mont text-xl font-extrabold text-carbon">
              No encontramos resultados
           </h3>
           <p className="mt-2 text-humo font-medium">
              Prueba con otra categoría o término de búsqueda.
           </p>
           <button 
            onClick={() => {setSelectedCat("todos"); setQuery("");}}
            className="mt-8 btn-bosque px-8 py-3"
           >
              Ver todos los lugares
           </button>
        </div>
      )}

      {/* ——— CTA Section ——— */}
      <section className="mt-24 pb-20">
         <div className="rounded-[40px] bg-carbon p-10 md:p-16 text-white relative overflow-hidden shadow-elevada">
            <div className="absolute right-[-5%] top-[-10%] h-64 w-64 rounded-full bg-bosque-600/20 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
               <h3 className="font-mont text-3xl md:text-4xl font-extrabold leading-tight">
                  ¿Tu negocio aún no está en la guía?
               </h3>
               <p className="mt-4 text-arena/70 text-lg font-medium">
                  Únete a la red de comercio local más grande de Curacaví y aumenta tu visibilidad.
               </p>
               <Link to="/socio" className="mt-10 inline-block bg-white text-carbon px-10 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-transform">
                  Empezar ahora
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
