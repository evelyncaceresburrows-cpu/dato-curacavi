import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  ChevronDown, 
  ChevronRight, 
  Sun, 
  MapPin, 
  Star,
  Clock,
  Heart,
  Calendar,
  Search,
  Plus
} from "lucide-react";
import {
  CATEGORIAS_HOME_KEYS,
  categoriaDef,
  COMERCIOS,
  EVENTOS,
  eventoBySlug,
} from "@/data/seed";
import { TopographicPattern } from "../components/TopographicPattern";
import { LogoPrincipal } from "../components/Icons";
import { SEO } from "@/components/SEO";
import { organizationLd } from "@/lib/seoLd";
import { track, Events } from "@/lib/analytics";

export default function Home() {
  const [query, setQuery] = useState("");

  const datoDia = eventoBySlug("feria-libre")!;
  const eventosRecientes = EVENTOS.filter((e) =>
    ["fiesta-chicha-2026", "trekking-la-cruz"].includes(e.id)
  );
  const recomendados = COMERCIOS.filter((c) =>
    ["la-pica", "cafe-patio", "vina-altar-uco"].includes(c.id)
  );
  const categoriasHome = CATEGORIAS_HOME_KEYS.map((k) => categoriaDef(k));

  return (
    <div className="bg-arena min-h-screen">
      <SEO
        title="Dato Curacaví — La guía vecinal del valle"
        description="Descubre picadas, chicha, dulces, eventos y servicios del valle de Curacaví. La guía vecinal oficial hecha para los que vivimos acá."
        path="/"
        jsonLd={organizationLd()}
      />
      {/* ——— Hero Section ——— */}
      <section className="relative h-[600px] w-full overflow-hidden flex flex-col items-center justify-center px-6 bg-bosque-800">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: "url('/images/bg-curacavi.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-bosque-800/90" />
        
        {/* Topographic Pattern Overlay */}
        <TopographicPattern className="text-white" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center">
           <LogoPrincipal className="h-40 md:h-56 w-auto mb-6 drop-shadow-elevada" />
           
           <h1 className="font-mont text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
             Descubre lo mejor <br />
             <span className="text-white/90">del Valle</span>
           </h1>
           
           <p className="mt-4 text-lg font-bold text-white/80 max-w-md mx-auto">
             Panoramas, servicios y picadas <br className="hidden md:block" />
             en el corazón de Curacaví.
           </p>

           {/* Search Box inside Hero */}
           <div className="mt-10 w-full relative group">
              <div className="absolute inset-y-0 left-6 flex items-center text-humo">
                <Search size={22} />
              </div>
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué buscas hoy en el valle?"
                className="w-full rounded-[32px] bg-white/95 backdrop-blur-md py-6 pl-16 pr-8 text-lg font-bold text-carbon shadow-elevada outline-none ring-bosque-600/20 focus:ring-8 transition-all"
              />
              <button
                onClick={() => query.trim() && track(Events.BUSCAR, { q: query.trim().slice(0, 60) })}
                className="absolute right-3 top-3 bottom-3 bg-bosque-600 text-white px-8 rounded-[24px] font-bold shadow-cta active:scale-95 transition-transform"
              >
                Buscar
              </button>
           </div>
        </div>
      </section>

      {/* ——— Main Content Wrapper ——— */}
      <div className="mx-auto max-w-screen-xl px-4 md:px-12 py-16">
        {/* Context Bar (Weather / Location) */}
        <div className="flex items-center gap-3 mb-16">
          <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-carbon shadow-tarjeta border border-bosque-600/5">
            <MapPin size={18} className="text-bosque-600" />
            Todo Curacaví
            <ChevronDown size={14} className="ml-1 text-humo" />
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-carbon shadow-tarjeta border border-bosque-600/5">
            <Sun size={20} className="text-amber-500" />
            22°C &middot; Despejado
          </div>
        </div>

      {/* ——— Explora Curacaví ——— */}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="font-mont text-xl font-extrabold text-carbon">
            Explora Curacaví
          </h2>
          <Link to="/directorio" className="text-xs font-bold text-bosque-600 uppercase tracking-widest">
            Ver todo
          </Link>
        </div>
        
        <div className="mt-8 flex gap-8 overflow-x-auto pb-4 no-scrollbar">
          {categoriasHome.map((c) => (
            <Link
              key={c.key}
              to={`/directorio?cat=${c.key}`}
              className="flex flex-col items-center gap-3 shrink-0"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-[20px] text-white shadow-tarjeta transition-transform hover:scale-105 active:scale-95"
                style={{ background: c.color }}
              >
                <c.Icon size={28} />
              </div>
              <span className="text-[11px] font-bold text-humo uppercase tracking-wider text-center max-w-[80px]">
                {c.short}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ——— Dato del día ——— */}
      <section className="mt-16">
        <div className="ficha overflow-hidden bg-white p-6 shadow-tarjeta">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 order-2 md:order-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-humo">
                Dato del día
              </span>
              <h3 className="mt-3 font-mont text-xl font-extrabold text-carbon">
                {datoDia.titulo}
              </h3>
              <p className="mt-2 text-sm font-medium text-humo leading-relaxed">
                Hoy desde las {datoDia.hora} hrs.<br />
                <span className="flex items-center gap-1 mt-2">
                  <MapPin size={12} className="text-bosque-600" />
                  {datoDia.lugar}
                </span>
              </p>
            </div>
            <div 
              className="h-32 w-full md:w-48 rounded-2xl order-1 md:order-2"
              style={{ background: datoDia.imagen, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          </div>
        </div>
      </section>

      {/* ——— Eventos y panoramas ——— */}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="font-mont text-xl font-extrabold text-carbon">
            Eventos y panoramas
          </h2>
          <Link to="/agenda" className="text-xs font-bold text-bosque-600 uppercase tracking-widest">
            Ver calendario
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventosRecientes.map((e) => {
            const d = new Date(e.fecha + "T00:00:00");
            const diaSemana = d.toLocaleDateString("es-CL", { weekday: "short" }).toUpperCase();
            const diaNum = d.getDate();

            return (
              <Link
                key={e.id}
                to={`/evento/${e.slug}`}
                className="relative h-64 overflow-hidden rounded-3xl shadow-tarjeta group"
              >
                <div 
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                  style={{ background: e.imagen, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Date Tag */}
                <div className="absolute top-5 left-5 flex w-12 flex-col items-center rounded-xl bg-white/95 py-2 text-center shadow-tarjeta backdrop-blur">
                  <span className="text-[10px] font-bold text-bosque-700 leading-none">{diaSemana}</span>
                  <span className="text-xl font-extrabold text-carbon leading-none mt-0.5">{diaNum}</span>
                </div>

                <div className="absolute inset-x-6 bottom-6 text-white">
                  <h4 className="font-mont text-lg font-extrabold leading-tight shadow-sm">
                    {e.titulo}
                  </h4>
                  <p className="mt-1 text-xs font-medium text-white/80 line-clamp-1">
                    {e.lugar} &middot; {e.hora} hrs.
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ——— Recomendados para ti ——— */}
      <section className="mt-16 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="font-mont text-xl font-extrabold text-carbon">
            Recomendados para ti
          </h2>
          <Link to="/directorio" className="text-xs font-bold text-bosque-600 uppercase tracking-widest">
            Ver todo
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-6">
          {recomendados.map((l) => (
            <Link
              key={l.id}
              to={`/lugar/${l.slug}`}
              className="flex flex-col gap-3 group"
            >
              <div 
                className="aspect-square w-full rounded-2xl shadow-tarjeta overflow-hidden transition-transform group-hover:-translate-y-1"
                style={{ background: l.imagen, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div>
                <h4 className="font-mont text-[15px] font-extrabold text-carbon line-clamp-1 group-hover:text-bosque-600 transition-colors">
                  {l.nombre}
                </h4>
                <p className="text-[13px] font-medium text-humo line-clamp-1 mt-0.5">
                  {l.subtitulo} &middot; {l.precio}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}

