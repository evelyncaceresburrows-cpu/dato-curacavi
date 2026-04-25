"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Store, ShieldCheck, TrendingUp, Search, Smartphone, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SocioPro() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Store className="w-6 h-6 text-amber-500" />
            <span className="font-heading font-bold text-xl tracking-tight">Socio Pro</span>
          </Link>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-semibold transition-colors">
            Acceso Socios
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-bold mb-6">
              <ShieldCheck className="w-4 h-4" />
              Verificación Oficial
            </div>
            <h1 className="font-heading text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Haz crecer tu <br />
              <span className="text-amber-500">negocio local</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-xl">
              Únete a la red comercial más grande de Curacaví. Verifica tu perfil, destaca sobre la competencia y llega a miles de vecinos y turistas cada mes.
            </p>
            
            <div className="space-y-4 mb-10">
              {[
                "Control total de tu perfil y horarios",
                "Prioridad en las búsquedas del Concierge",
                "Distintivo de Socio Verificado",
                "Estadísticas de visitas a tu perfil"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>

            <button className="h-14 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
              Comenzar Verificación
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    <Image src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop" alt="Restaurant" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Restaurant El Cobre</h3>
                    <p className="text-slate-500 text-sm flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-amber-500" /> Socio Pro Verificado
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2"><Search className="w-4 h-4" /> Búsquedas</p>
                  <p className="text-3xl font-bold">+1,240</p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% este mes</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2"><Smartphone className="w-4 h-4" /> Clics a WhatsApp</p>
                  <p className="text-3xl font-bold">342</p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5% este mes</p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
                <Users className="w-5 h-5 shrink-0 mt-0.5" />
                <p>El Concierge te ha recomendado <strong>45 veces</strong> esta semana en preguntas sobre "dónde almorzar".</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-600 dark:text-slate-400">En tres simples pasos tu negocio estará optimizado para la era digital del valle.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Reclama tu perfil", desc: "Busca tu negocio en nuestra base de datos o agrégalo desde cero." },
              { num: "02", title: "Verifica identidad", desc: "Comprobamos que eres el dueño real para proteger tu marca y clientes." },
              { num: "03", title: "Optimiza y Crece", desc: "Añade fotos, menú, horarios y ofertas. Nuestro sistema hará el resto." }
            ].map((step, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <div className="text-6xl font-black text-slate-200 dark:text-slate-800 absolute top-4 right-6 pointer-events-none">
                  {step.num}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 mt-8">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
