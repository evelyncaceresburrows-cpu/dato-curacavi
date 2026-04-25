"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Store, 
  CalendarHeart, 
  ChevronRight,
  Search,
  MapPin,
  Sun,
  Clock,
  Home,
  Megaphone,
  Coffee,
  ShoppingBag,
  Ticket,
  Tent,
  Wrench
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PremiumLanding() {
  return (
    <div className="min-h-screen bg-arena-100 text-bosque-900 font-sans selection:bg-terracota-500 selection:text-white overflow-hidden">
      
      {/* Navbar Lovable Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-arena-100/90 backdrop-blur-md border-b border-bosque-900/5">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              {/* Lovable Pin Logo Approximation */}
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-bosque-900">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
                <circle cx="12" cy="7" r="2" fill="#F7F3ED"/>
                <path d="M7 11c0 2 5 7 5 7s5-5 5-7" stroke="#F7F3ED" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-bosque-900">
              Dato <span className="text-terracota italic font-serif">Curacaví</span>
            </span>
          </div>
          <button className="w-10 h-10 rounded-full border border-bosque-900/10 flex items-center justify-center hover:bg-bosque-900/5 transition-colors">
            <Search className="w-5 h-5 text-bosque-900" />
          </button>
        </div>
      </nav>

      {/* Main Content wrapper (Mobile First Centered) */}
      <div className="max-w-md mx-auto bg-arena-100 min-h-screen shadow-2xl shadow-bosque-900/5 sm:max-w-xl md:max-w-2xl border-x border-bosque-900/5">
        
        {/* 1. HERO IMPACTANTE (LOVABLE STYLE) */}
        <section className="relative pt-16">
          <div className="relative h-[65vh] min-h-[450px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-bosque-900 via-bosque-900/40 to-transparent z-10" />
            {/* Background image simulating the valley sunset */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
            
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-6">
              <div className="flex items-center gap-2 text-white/90 text-xs font-bold tracking-widest uppercase mt-6">
                <MapPin className="w-4 h-4" />
                Curacaví • Valle Central
              </div>

              <div className="mb-6">
                <h1 className="font-serif text-6xl sm:text-7xl font-bold tracking-tight mb-4 leading-[1] text-white">
                  Lo bueno <br/>
                  del pueblo, <br/>
                  <span className="text-mostaza italic">a mano.</span>
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-white/90 mb-6 font-medium">
                  <div className="flex items-center gap-2">
                    <CalendarHeart className="w-4 h-4" />
                    Jueves 23 De Abril
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-white/30" />
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-mostaza" />
                    22°C • despejado
                  </div>
                </div>
                <button className="text-mostaza font-bold text-sm flex items-center gap-1 hover:underline transition-all group">
                  2 panoramas hoy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SEARCH & CATEGORIES */}
        <section className="relative -mt-6 z-30 px-6">
          <div className="bg-white rounded-full p-2 pl-6 pr-2 flex items-center shadow-tarjeta border border-bosque-900/5 mb-8">
            <Search className="w-5 h-5 text-terracota" />
            <input 
              type="text" 
              placeholder="¿Qué buscas hoy en Curacaví?" 
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-bosque-900 placeholder:text-bosque-900/60 font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-3 mb-12">
            {[
              { label: 'Comer', icon: Utensils },
              { label: 'Tomar', icon: Coffee },
              { label: 'Comprar', icon: ShoppingBag },
              { label: 'Servicios', icon: Wrench },
              { label: 'Panoramas', icon: MapPin },
              { label: 'Ferias', icon: Tent },
            ].map((cat, i) => (
              <button key={i} className="px-5 py-2.5 rounded-full bg-white border border-bosque-900/10 text-bosque-900 text-sm font-semibold hover:bg-arena-200 transition-colors shadow-sm flex items-center gap-2">
                <cat.icon className="w-4 h-4 text-bosque-900/70" />
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. AGENDA / QUÉ HACER HOY */}
        <section className="px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-terracota/30" />
            <span className="text-terracota text-xs font-bold tracking-widest uppercase">01 — Agenda</span>
          </div>

          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-terracota text-xs font-bold tracking-widest uppercase mb-1">Qué hacer hoy</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bosque-900">Hoy en Curacaví</h2>
            </div>
            <button className="text-terracota text-xs font-bold tracking-widest flex items-center gap-1 hover:underline uppercase pb-1">
              Ver Agenda <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { type: "FERIA", title: "Feria Criolla en la Plaza", time: "9:00 — 14:00", date: "23", month: "ABR" },
              { type: "MÚSICA", title: "Música en vivo · Trío del Valle", time: "19:30", date: "23", month: "ABR" }
            ].map((event, i) => (
              <div key={i} className="bg-white rounded-[1.5rem] p-4 flex items-center gap-5 shadow-tarjeta border border-bosque-900/5 hover:border-terracota/30 transition-colors cursor-pointer group">
                <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-arena-200 flex flex-col items-center justify-center shrink-0 group-hover:bg-terracota-100 transition-colors">
                  <span className="font-serif text-[1.75rem] font-bold text-terracota leading-none">{event.date}</span>
                  <span className="text-[10px] font-bold text-bosque-900/60 mt-1">{event.month}</span>
                </div>
                <div>
                  <p className="text-terracota text-[10px] font-bold tracking-widest uppercase mb-1">{event.type}</p>
                  <h3 className="font-serif text-lg font-bold text-bosque-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-bosque-900/70 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PARA NEGOCIOS */}
        <section className="px-6 py-12 mt-4 bg-gradient-to-b from-transparent to-terracota-50/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-terracota/30" />
            <span className="text-terracota text-xs font-bold tracking-widest uppercase">02 — Comercios</span>
            <div className="h-px flex-1 bg-terracota/30" />
          </div>

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-tarjeta mb-6 border border-bosque-900/5">
              <Store className="w-8 h-8 text-terracota" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-bosque-900 mb-4">¿Tienes un negocio?</h2>
            <p className="text-bosque-900/80 font-medium leading-relaxed text-lg px-4">
              Digitaliza tu local sin fricción. Llega al celular de miles de personas que buscan exactamente lo que tú ofreces en el valle.
            </p>
          </div>

          <button className="w-full h-14 rounded-full bg-terracota text-white font-bold text-lg hover:bg-terracota-600 transition-colors shadow-cta flex items-center justify-center gap-2">
            Publicar mi negocio
            <ChevronRight className="w-5 h-5" />
          </button>
        </section>

        {/* Bottom padding for navigation bar */}
        <div className="h-24"></div>

      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-arena-100 border-t border-bosque-900/10 pb-safe">
        <div className="max-w-md mx-auto px-6 h-[4.5rem] flex items-center justify-between">
          <button className="flex flex-col items-center gap-1.5 text-terracota">
            <Home className="w-6 h-6" />
            <span className="text-[11px] font-bold">Inicio</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-bosque-900/50 hover:text-bosque-900 transition-colors">
            <Store className="w-6 h-6" />
            <span className="text-[11px] font-bold">Comercios</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-bosque-900/50 hover:text-bosque-900 transition-colors">
            <CalendarHeart className="w-6 h-6" />
            <span className="text-[11px] font-bold">Agenda</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-bosque-900/50 hover:text-bosque-900 transition-colors">
            <Megaphone className="w-6 h-6" />
            <span className="text-[11px] font-bold">Publica</span>
          </button>
        </div>
      </nav>

    </div>
  );
}

function Utensils(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
}

