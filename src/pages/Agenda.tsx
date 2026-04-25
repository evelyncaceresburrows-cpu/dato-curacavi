import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Filter,
  Plus,
} from "lucide-react";
import { FECHAS_AGENDA } from "@/data/seed";
import { useEventos } from "@/data/hooks/useEventos";
import { SEO } from "@/components/SEO";

export default function Agenda() {
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);

  const { data: eventos = [] } = useEventos();
  // `useEventos` ya devuelve los eventos ordenados por fecha asc +
  // Socio Pro primero dentro del mismo día; acá los consumimos tal cual.
  const proximosEventos = eventos;

  return (
    <div className="mx-auto max-w-screen-xl px-4 md:px-12 py-8 md:py-16 bg-arena min-h-screen">
      <SEO
        title="Agenda Cultural de Curacaví"
        description="Panoramas, ferias, fiestas y eventos del valle de Curacaví. Qué hacer este fin de semana, hoy y los próximos días."
        path="/agenda"
      />
      {/* ——— Header ——— */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-mont text-3xl font-extrabold text-carbon tracking-tight">
            Agenda Cultural
          </h1>
          <p className="mt-1 text-[15px] font-medium text-humo">
            No te pierdas nada en Curacaví
          </p>
        </div>
        <div className="flex gap-2">
           <Link to="/socio?tab=evento" className="hidden md:flex h-12 items-center gap-2 rounded-2xl bg-bosque-600 px-6 font-bold text-white shadow-cta">
             <Plus size={20} />
             Publicar
           </Link>
           <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-tarjeta text-carbon">
             <Filter size={20} />
           </button>
        </div>
      </header>

      {/* ——— Date Scroller ——— */}
      <section className="mt-10 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-4">
           {FECHAS_AGENDA.map((f, i) => (
             <button 
              key={`${f.dia}-${f.num}`}
              onClick={() => setSelectedDateIdx(i)}
              className={`flex flex-col items-center shrink-0 rounded-[24px] px-6 py-4 transition-all ${
                i === selectedDateIdx ? "bg-bosque-600 text-white shadow-cta scale-105" : "bg-white text-carbon shadow-tarjeta hover:bg-bosque-50"
              }`}
             >
               <span className={`text-[10px] font-bold uppercase tracking-widest ${i === selectedDateIdx ? "text-white/80" : "text-humo"}`}>{f.dia}</span>
               <span className="text-2xl font-extrabold mt-0.5">{f.num}</span>
             </button>
           ))}
        </div>
      </section>

      {/* ——— Contenido ——— */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-8">
           <h2 className="font-mont text-xl font-extrabold text-carbon">
              Qué hacer este fin de semana
           </h2>
        </div>

        <div className="space-y-8">
          {proximosEventos.map((e) => {
            const d = new Date(e.fecha + "T00:00:00");
            const diaSemana = d.toLocaleDateString("es-CL", { weekday: "short" }).toUpperCase();
            const diaNum = d.getDate();

            return (
              <Link
                key={e.id}
                to={`/evento/${e.slug}`}
                className="ficha block overflow-hidden bg-white shadow-tarjeta group cursor-pointer"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  <div className="relative h-64 md:h-auto md:w-80 shrink-0 overflow-hidden">
                    <div 
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                      style={{ background: e.imagen, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    {/* Date Tag Overlay */}
                    <div className="absolute top-5 left-5 flex w-14 flex-col items-center rounded-2xl bg-white/95 py-2 text-center shadow-tarjeta backdrop-blur">
                      <span className="text-[10px] font-bold text-bosque-700 leading-none">{diaSemana}</span>
                      <span className="text-2xl font-extrabold text-carbon leading-none mt-1">{diaNum}</span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 p-8">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="rounded-full bg-bosque-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bosque-600">
                          {e.categoria}
                       </span>
                    </div>
                    
                    <h3 className="font-mont text-2xl font-extrabold text-carbon leading-tight group-hover:text-bosque-600 transition-colors">
                      {e.titulo}
                    </h3>
                    
                    <p className="mt-4 text-humo font-medium leading-relaxed line-clamp-2">
                      {e.descripcion}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-6">
                       <div className="flex items-center gap-2 text-sm font-bold text-carbon">
                          <Clock size={16} className="text-bosque-600" />
                          {e.hora} hrs.
                       </div>
                       <div className="flex items-center gap-2 text-sm font-bold text-carbon">
                          <MapPin size={16} className="text-bosque-600" />
                          {e.lugar}
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ——— CTA Section ——— */}
      <section className="mt-20 pb-20 text-center">
         <div className="max-w-lg mx-auto">
            <h3 className="font-mont text-2xl font-extrabold text-carbon">
               ¿Tienes un evento?
            </h3>
            <p className="mt-3 text-humo font-medium">
               Aparece en la guía oficial y llega a toda la comunidad de Curacaví.
            </p>
            <Link to="/socio" className="mt-8 inline-block btn-bosque px-10 py-4">
               Publicar mi evento
            </Link>
         </div>
      </section>
    </div>
  );
}
