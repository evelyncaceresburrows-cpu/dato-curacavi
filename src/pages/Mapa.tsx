import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  Star,
  ChevronRight,
  Navigation,
  Phone,
  Clock,
  X,
} from "lucide-react";
import {
  COMERCIOS,
  CATEGORIAS_HOME_KEYS,
  categoriaDef,
  ordenarComercios,
  type Comercio,
} from "@/data/seed";
import { SEO } from "@/components/SEO";
import { track, Events } from "@/lib/analytics";

const LUGARES_MAPA = ordenarComercios(COMERCIOS);

export default function Mapa() {
  const [selectedLugar, setSelectedLugar] = useState<Comercio>(LUGARES_MAPA[0]);
  const [query, setQuery] = useState("");
  const [showDetail, setShowDetail] = useState(true);

  const filtered = LUGARES_MAPA.filter((l) =>
    l.nombre.toLowerCase().includes(query.toLowerCase())
  );

  const chipsCategorias = CATEGORIAS_HOME_KEYS.map((k) => categoriaDef(k));

  return (
    <div className="flex h-[calc(100vh-88px)] overflow-hidden bg-arena">
      <SEO
        title="Mapa de Curacaví"
        description="Encuentra picadas, ferias, alojamientos y panoramas en el mapa vecinal de Curacaví. Cómo llegar, horarios y contacto."
        path="/mapa"
      />
      {/* ——— Sidebar: List of Places ——— */}
      <aside className="z-20 hidden lg:flex w-[400px] flex-col bg-white border-r border-bosque-600/5">
        <div className="p-8">
          <h1 className="font-mont text-2xl font-extrabold text-carbon">
            Mapa del Valle
          </h1>
          
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-humo" size={18} />
            <input 
              type="text" 
              placeholder="Buscar lugares..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl bg-arena-100 py-3.5 pl-12 pr-4 text-sm font-medium text-carbon outline-none border-2 border-transparent focus:border-bosque-600/20 transition-all"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {chipsCategorias.map((c) => (
              <button
                key={c.key}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-humo border border-bosque-600/10 hover:border-bosque-600/30 transition-all shadow-sm"
              >
                {c.short.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
          {filtered.map((l) => (
            <button
              key={l.id}
              onClick={() => {setSelectedLugar(l); setShowDetail(true);}}
              className={`flex w-full items-start gap-4 rounded-3xl p-4 transition-all text-left ${
                selectedLugar.id === l.id 
                  ? "bg-bosque-50 shadow-sm" 
                  : "bg-white hover:bg-arena-50"
              }`}
            >
              <div 
                className="h-16 w-16 shrink-0 rounded-2xl shadow-sm"
                style={{ background: l.imagen, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div className="min-w-0">
                <h3 className="font-mont font-extrabold text-carbon truncate">
                  {l.nombre}
                </h3>
                <p className="text-xs font-medium text-humo truncate mt-0.5">
                  {l.subtitulo}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-carbon">
                    <Star size={12} fill="currentColor" className="text-amber-500" />
                    {l.rating}
                  </div>
                  <span className="text-[10px] text-humo font-bold uppercase tracking-wider">• {l.precio}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ——— Map Area ——— */}
      <main className="relative flex-1 bg-[#f0f2f5]">
        {/* Abstract Map UI */}
        <div className="absolute inset-0 overflow-hidden">
           {/* Abstract Grid */}
           <div className="absolute inset-0 opacity-[0.15]" style={{ 
              backgroundImage: 'radial-gradient(#1F6B45 1px, transparent 1px)', 
              backgroundSize: '32px 32px' 
           }} />
           
           {/* Visual Map Elements */}
           <div className="absolute left-1/4 top-1/4 h-[600px] w-4 rounded-full bg-bosque-600/5 -rotate-45 blur-3xl" />
           <div className="absolute right-1/4 bottom-1/4 h-8 w-[800px] bg-white/40 rotate-12 blur-2xl" />

           {/* Pins */}
           {filtered.map((l) => {
             const PinIcon = categoriaDef(l.categoria).Icon;
             return (
               <button
                 key={l.id}
                 onClick={() => { setSelectedLugar(l); setShowDetail(true); }}
                 className={`absolute flex flex-col items-center transition-all duration-500 ${
                   selectedLugar.id === l.id ? "z-30 scale-125" : "z-10"
                 }`}
                 style={{
                   left: `${l.coords.x}%`,
                   top: `${l.coords.y}%`,
                   transform: "translate(-50%, -100%)",
                 }}
               >
                  <div className="relative">
                    <div className={`h-12 w-12 rounded-2xl border-4 border-white shadow-elevada flex items-center justify-center text-white transition-all ${
                      selectedLugar.id === l.id ? "bg-bosque-600 -translate-y-2" : "bg-carbon"
                    }`}>
                      <PinIcon size={20} />
                    </div>
                    <div className={`absolute -bottom-1 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-r-4 border-b-4 border-white transition-colors ${
                      selectedLugar.id === l.id ? "bg-bosque-600" : "bg-carbon"
                    }`} />
                  </div>
               </button>
             );
           })}
        </div>

        {/* Selected Lugar Floating Card */}
        {showDetail && (
          <div className="absolute bottom-8 left-4 right-4 md:left-12 md:right-12 z-30 flex justify-center">
             <div className="w-full max-w-4xl overflow-hidden rounded-[40px] bg-white p-6 md:p-8 shadow-elevada border border-bosque-600/5 animate-in slide-in-from-bottom-12 duration-500">
                <button 
                  onClick={() => setShowDetail(false)}
                  className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-arena-100 text-carbon md:hidden"
                >
                   <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row items-center gap-8">
                   <div 
                     className="h-44 w-full md:w-64 shrink-0 rounded-[32px] shadow-tarjeta"
                     style={{ background: selectedLugar.imagen, backgroundSize: 'cover', backgroundPosition: 'center' }}
                   />
                   <div className="flex-1 w-full">
                      <div className="flex items-start justify-between">
                         <div className="flex-1 min-w-0">
                            <span className="inline-block rounded-full bg-bosque-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bosque-600">
                               {selectedLugar.categoria}
                            </span>
                            <h2 className="mt-3 font-mont text-3xl font-extrabold text-carbon truncate">
                               {selectedLugar.nombre}
                            </h2>
                            <p className="mt-1 text-humo font-medium text-lg truncate">
                               {selectedLugar.subtitulo}
                            </p>
                         </div>
                         <div className="hidden md:flex items-center gap-3 shrink-0">
                            <Link
                              to={`/lugar/${selectedLugar.slug}`}
                              className="flex h-14 items-center gap-3 rounded-2xl bg-white border border-bosque-600/10 px-5 text-carbon hover:bg-bosque-50 transition-all active:scale-95 font-bold"
                            >
                              Ver ficha
                              <ChevronRight size={18} />
                            </Link>
                            <a
                              href={
                                selectedLugar.lat && selectedLugar.lng
                                  ? `https://www.google.com/maps/dir/?api=1&destination=${selectedLugar.lat},${selectedLugar.lng}`
                                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLugar.direccion + " Curacaví")}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                track(Events.NAVEGAR_CLICK, {
                                  slug: selectedLugar.slug,
                                  origen: "mapa",
                                })
                              }
                              className="flex h-14 items-center gap-3 rounded-2xl bg-bosque-600 px-6 text-white shadow-cta hover:bg-bosque-700 transition-all active:scale-95"
                            >
                               <Navigation size={22} />
                               <span className="font-bold">Ir ahora</span>
                            </a>
                         </div>
                      </div>

                      <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-bosque-600/5 pt-8">
                         <div className="flex items-center gap-2.5 text-[15px] font-bold text-carbon">
                            <Star size={18} fill="currentColor" className="text-amber-500" />
                            {selectedLugar.rating} <span className="text-humo font-medium">({selectedLugar.reviews})</span>
                         </div>
                         <div className="flex items-center gap-2.5 text-[15px] font-bold text-carbon">
                            <Clock size={18} className="text-bosque-600" />
                            Abierto hasta {selectedLugar.abiertoHasta}
                         </div>
                         <div className="flex items-center gap-2.5 text-[15px] font-bold text-carbon">
                            <MapPin size={18} className="text-bosque-600" />
                            {selectedLugar.direccion}
                         </div>
                      </div>
                      
                      {/* Mobile Buttons */}
                      <div className="mt-8 flex gap-3 md:hidden">
                         <a
                           href={
                             selectedLugar.lat && selectedLugar.lng
                               ? `https://www.google.com/maps/dir/?api=1&destination=${selectedLugar.lat},${selectedLugar.lng}`
                               : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLugar.direccion + " Curacaví")}`
                           }
                           target="_blank"
                           rel="noopener noreferrer"
                           onClick={() =>
                             track(Events.NAVEGAR_CLICK, {
                               slug: selectedLugar.slug,
                               origen: "mapa_mobile",
                             })
                           }
                           className="flex-1 flex h-14 items-center justify-center gap-3 rounded-2xl bg-bosque-600 text-white shadow-cta font-bold"
                         >
                            <Navigation size={20} />
                            Ir ahora
                         </a>
                         {selectedLugar.telefono && (
                           <a
                             href={`tel:${selectedLugar.telefono}`}
                             onClick={() =>
                               track(Events.LLAMADA_CLICK, {
                                 slug: selectedLugar.slug,
                                 origen: "mapa_mobile",
                               })
                             }
                             className="h-14 w-14 flex items-center justify-center rounded-2xl bg-arena-100 text-carbon"
                           >
                              <Phone size={20} />
                           </a>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute right-8 top-8 hidden md:flex flex-col gap-3">
           <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white font-extrabold text-xl text-carbon shadow-tarjeta hover:bg-arena-50">+</button>
           <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white font-extrabold text-xl text-carbon shadow-tarjeta hover:bg-arena-50">-</button>
        </div>
      </main>
    </div>
  );
}
