"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BellRing, Settings, User, Store } from "lucide-react";
import Link from "next/link";

export default function MejorasVisuales() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Componentes Exportables
          </div>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Mejoras Visuales
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Catálogo de componentes UI refinados, listos para ser integrados en la aplicación principal de Dato Curacaví.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Component: Premium Cards */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2">Tarjetas Premium</h2>
            
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Directorio de Negocios</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 leading-relaxed">
                    Nuevo estilo de tarjeta con hover effects sutiles y bordes refinados para la lista de locales.
                  </p>
                  <button className="text-sm font-semibold text-brand-primary dark:text-brand-accent flex items-center gap-1 group/btn">
                    Ver demo <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Glassmorphism Card */}
            <div className="p-8 rounded-3xl relative overflow-hidden bg-slate-900 text-white">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-accent rounded-full mix-blend-multiply filter blur-2xl opacity-50" />
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2">Tarjeta Glassmorphism</h3>
                <p className="text-slate-300 text-sm mb-6">Ideal para destacar promociones especiales o features premium como Socio Pro.</p>
                <div className="w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center px-4 justify-between">
                  <span className="text-sm font-medium">Plan Pro Activo</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                </div>
              </div>
            </div>
          </section>

          {/* Component: Interactive Elements */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2">Elementos Interactivos</h2>
            
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
              
              {/* Dynamic Buttons */}
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-4">Botones Dinámicos</p>
                <div className="flex flex-wrap gap-4">
                  <button className="h-12 px-6 rounded-full bg-brand-primary text-white font-medium hover:bg-brand-secondary active:scale-95 transition-all shadow-lg shadow-brand-primary/25">
                    Acción Principal
                  </button>
                  <button className="h-12 px-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all">
                    Secundario
                  </button>
                </div>
              </div>

              {/* Floating Nav Demo */}
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-4">Navegación Flotante (Pill)</p>
                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-inner">
                  <button className="px-4 py-2 rounded-full bg-white dark:bg-zinc-700 shadow-sm text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" /> Perfil
                  </button>
                  <button className="px-4 py-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2">
                    <BellRing className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </section>
        </div>
        
        <div className="mt-16 text-center">
           <Link href="/" className="text-brand-primary dark:text-brand-accent font-semibold hover:underline flex items-center justify-center gap-2">
             <ArrowRight className="w-4 h-4 rotate-180" /> Volver al Lab
           </Link>
        </div>
      </div>
    </div>
  );
}

