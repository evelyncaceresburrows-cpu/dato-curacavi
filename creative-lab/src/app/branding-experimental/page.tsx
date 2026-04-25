"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Hexagon } from "lucide-react";
import Link from "next/link";

export default function BrandingExperimental() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0C120F] text-[#2C3E35] dark:text-[#E8D5B5] font-sans selection:bg-[#E8D5B5] selection:text-[#0C120F]">
      {/* Editorial Navigation */}
      <nav className="p-8 border-b border-[#2C3E35]/10 dark:border-[#E8D5B5]/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="font-heading font-black tracking-widest uppercase text-sm">
            Estudio Visual 001
          </div>
          <div className="w-6" /> {/* spacer */}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Typographic Hero */}
          <div className="lg:col-span-7">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="font-heading text-7xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tighter mb-12"
            >
              Bosque <br />
              <span className="text-[#8B9D83] italic font-light">&</span> Arena
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-2xl font-light leading-relaxed max-w-xl"
            >
              Una exploración estética que captura la esencia de Curacaví: el verdor profundo de sus cerros contrastado con la calidez terrosa de su valle central. Un diseño editorial, rústico pero refinado.
            </motion.p>
          </div>

          {/* Color Palette Display */}
          <div className="lg:col-span-5 flex flex-col justify-end">
            <div className="space-y-4">
              <h3 className="font-heading uppercase tracking-widest text-xs font-bold mb-6 opacity-60">Paleta Principal</h3>
              {[
                { hex: "#1A472A", name: "Pino Oscuro", class: "bg-[#1A472A] text-white" },
                { hex: "#2C5E3D", name: "Hoja de Boldo", class: "bg-[#2C5E3D] text-white" },
                { hex: "#8B9D83", name: "Eucalipto Seco", class: "bg-[#8B9D83] text-[#0C120F]" },
                { hex: "#E8D5B5", name: "Arena del Valle", class: "bg-[#E8D5B5] text-[#0C120F]" },
                { hex: "#0C120F", name: "Sombra Nocturna", class: "bg-[#0C120F] text-[#E8D5B5] border border-[#E8D5B5]/20" }
              ].map((color, i) => (
                <motion.div 
                  key={color.hex}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 * i, ease: "easeOut" }}
                  className={`h-16 px-6 rounded-2xl flex items-center justify-between font-mono text-sm ${color.class}`}
                >
                  <span>{color.name}</span>
                  <span className="opacity-70">{color.hex}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Texture & Layout Exploration */}
        <section className="mt-32 border-t border-[#2C3E35]/10 dark:border-[#E8D5B5]/10 pt-32">
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="relative aspect-square w-full max-w-md mx-auto">
               <div className="absolute inset-0 bg-[#E8D5B5] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 blur-3xl transform -translate-x-1/4 -translate-y-1/4" />
               <div className="absolute inset-0 bg-[#2C5E3D] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 blur-3xl transform translate-x-1/4 translate-y-1/4" />
               <div className="relative z-10 w-full h-full border border-[#2C3E35]/20 dark:border-[#E8D5B5]/20 rounded-[3rem] p-8 flex flex-col justify-between backdrop-blur-sm bg-white/10 dark:bg-black/10">
                 <Hexagon className="w-12 h-12 stroke-[1] text-[#2C5E3D] dark:text-[#8B9D83]" />
                 <div>
                   <p className="font-mono text-xs uppercase tracking-widest mb-4">UI Rústico-Chic</p>
                   <h4 className="font-heading text-3xl font-bold leading-tight">Formas orgánicas con estructura matemática.</h4>
                 </div>
               </div>
             </div>
             
             <div>
               <h3 className="font-heading text-4xl font-bold mb-8">El protocolo de diseño</h3>
               <ul className="space-y-6 text-lg font-light">
                 <li className="flex items-start gap-4 border-b border-[#2C3E35]/10 dark:border-[#E8D5B5]/10 pb-6">
                   <span className="font-mono text-sm mt-1 opacity-50">01</span>
                   <p><strong>Tipografía:</strong> Contraste extremo entre <em>Outfit</em> (Geométrica, moderna para titulares) e <em>Inter</em> (Legibilidad absoluta para interfaces).</p>
                 </li>
                 <li className="flex items-start gap-4 border-b border-[#2C3E35]/10 dark:border-[#E8D5B5]/10 pb-6">
                   <span className="font-mono text-sm mt-1 opacity-50">02</span>
                   <p><strong>Márgenes:</strong> Uso de padding generoso (macro whitespace) para dar una sensación premium y editorial, respirable.</p>
                 </li>
                 <li className="flex items-start gap-4 border-b border-[#2C3E35]/10 dark:border-[#E8D5B5]/10 pb-6">
                   <span className="font-mono text-sm mt-1 opacity-50">03</span>
                   <p><strong>Interacción:</strong> Animaciones lentas (0.5s+) y fluidas. Sin rebotes bruscos. Elegancia en cada estado de hover.</p>
                 </li>
               </ul>
             </div>
           </div>
        </section>
      </main>
    </div>
  );
}
