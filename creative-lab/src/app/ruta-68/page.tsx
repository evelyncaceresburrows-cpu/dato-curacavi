"use client";

import { motion } from "framer-motion";
import { Navigation, Coffee, Map, Clock, ArrowRight, Sun, Utensils } from "lucide-react";
import Link from "next/link";

export default function Ruta68() {
  return (
    <div className="min-h-screen bg-[#0A100D] text-slate-50 font-sans selection:bg-emerald-500/30">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A100D]/40 via-[#0A100D]/80 to-[#0A100D] z-10" />
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" 
          style={{ transform: 'translateZ(-10px) scale(1.5)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="font-heading font-bold text-xl flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">68</span>
            Ruta Escala
          </Link>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <Map className="w-4 h-4 text-emerald-400" />
            Km 45 - Curacaví
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-sm mb-8 tracking-wide">
                <Navigation className="w-4 h-4" />
                Tu Parada Estratégica
              </div>
              
              <h1 className="font-heading text-6xl lg:text-8xl font-black mb-8 leading-[0.95] tracking-tighter">
                No pases <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">de largo.</span>
              </h1>
              
              <p className="text-2xl text-slate-300 mb-12 max-w-2xl leading-relaxed font-light">
                A solo 45 minutos de Santiago. Descubre la verdadera chicha, las empanadas premiadas y el descanso que necesitas antes de llegar a la costa.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6 mb-16">
              {[
                { icon: Coffee, title: "Desayuno Acampado", time: "Abierto ahora", desc: "Pan amasado, huevos de campo y café en grano." },
                { icon: Utensils, title: "Almuerzo Tradicional", time: "Desde las 12:30", desc: "Costillar, pastel de choclo y cazuela de pava." }
              ].map((stop, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                  className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <stop.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {stop.time}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{stop.title}</h3>
                  <p className="text-slate-400 text-sm">{stop.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button className="h-16 px-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg transition-all flex items-center gap-3 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20">
                Ver Mapa de Picadas
                <ArrowRight className="w-6 h-6" />
              </button>
              <p className="mt-4 text-sm text-slate-400 flex items-center gap-2">
                <Sun className="w-4 h-4" /> El clima en Curacaví: 24°C, Despejado
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
