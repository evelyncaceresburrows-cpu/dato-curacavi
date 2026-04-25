"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MapPin, Zap, Star, Palette } from "lucide-react";
import Link from "next/link";

const LAB_PROJECTS = [
  {
    id: "landing-lanzamiento",
    title: "Landing Lanzamiento",
    description: "Página de alto impacto para la campaña oficial de Dato Curacaví.",
    icon: Sparkles,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    href: "/landing-lanzamiento",
  },
  {
    id: "socio-pro",
    title: "Socio Pro",
    description: "Portal de captación para negocios y emprendedores locales.",
    icon: Star,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    href: "/socio-pro",
  },
  {
    id: "campana-ruta-68",
    title: "Campaña Ruta 68",
    description: "Piezas interactivas orientadas a turistas de paso.",
    icon: MapPin,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    href: "/ruta-68",
  },
  {
    id: "mejoras-visuales",
    title: "Mejoras Visuales",
    description: "Componentes exportables para el ecosistema principal.",
    icon: Palette,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    href: "/mejoras-visuales",
  },
  {
    id: "branding-experimental",
    title: "Branding Experimental",
    description: "Exploración de la identidad visual Bosque & Arena.",
    icon: Zap,
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    href: "/branding-experimental",
  },
];

export default function CreativeLabHome() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-brand-primary/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-accent/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-brand-primary dark:text-brand-accent" />
            <span>Dato Curacaví</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
            Creative Lab
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 text-balance leading-relaxed">
            Entorno de pruebas y desarrollo de activos de alto impacto. 
            Todo lo creado aquí es exportable a la plataforma principal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LAB_PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={project.href} className="block group h-full">
                <div className={`h-full p-8 rounded-3xl border bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 ${project.color.split(' ')[2]}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${project.color.split(' ').slice(0, 2).join(' ')}`}>
                    <project.icon className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{project.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold uppercase tracking-wider group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors">
                    Explorar
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
