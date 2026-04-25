import { MapPin } from "lucide-react";

/**
 * Portal de Bienvenida — la entrada al valle.
 * Banner con cerros al fondo (Cuesta Barriga + serranía),
 * título serifa grande y subtítulo geográfico que conecta
 * los dos polos del territorio: Cuesta Barriga ↔ Estadio
 * Julio Riesco.
 */
export default function HeroValle({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-linea bg-white/70 shadow-valle backdrop-blur-sm">
      <span className="cinta-valle absolute inset-x-0 top-0" />

      {/* Cerros al fondo */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-56 w-full opacity-50"
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="cieloPortal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDFBF7" stopOpacity="0" />
            <stop offset="100%" stopColor="#F0F5EF" />
          </linearGradient>
        </defs>
        <rect width="1200" height="220" fill="url(#cieloPortal)" />
        {/* Cerros lejanos */}
        <path
          d="M0,150 L80,90 L160,120 L240,70 L320,100 L420,50 L520,100 L620,60 L720,110 L820,70 L920,120 L1020,80 L1120,110 L1200,90 L1200,220 L0,220 Z"
          fill="#2D5A27"
          fillOpacity="0.18"
        />
        {/* Cerros intermedios */}
        <path
          d="M0,180 L100,140 L200,160 L320,120 L440,150 L560,130 L680,160 L800,125 L920,160 L1040,135 L1200,155 L1200,220 L0,220 Z"
          fill="#2D5A27"
          fillOpacity="0.30"
        />
        {/* Línea de viñedos al frente */}
        <g stroke="#2D5A27" strokeOpacity="0.45" strokeWidth="1.2">
          {Array.from({ length: 80 }).map((_, i) => (
            <line key={i} x1={i * 16} y1={200} x2={i * 16} y2={220} />
          ))}
        </g>
      </svg>

      <div className="relative px-6 py-16 sm:px-14 sm:py-24">
        {/* Marca de portal */}
        <div className="flex flex-wrap items-center gap-3 text-tierra-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-tierra-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-valle">
            <MapPin size={12} strokeWidth={1.5} />
            Valle de Curacaví
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-tierra-400">
            Edición vecinal &middot; 2026
          </span>
        </div>

        <h1 className="mt-7 max-w-4xl font-display text-[42px] font-bold leading-[1.02] tracking-tight text-tierra-900 sm:text-6xl md:text-7xl">
          <span className="block">Dato Curacaví:</span>
          <span className="block italic text-parral">La Guía del Valle.</span>
        </h1>

        <p className="mt-6 max-w-2xl font-serif text-lg italic leading-snug text-tierra-700 sm:text-xl">
          Desde la Cuesta Barriga hasta el Estadio Julio Riesco, todo en un
          solo lugar.
        </p>

        {children && <div className="mt-12 max-w-2xl">{children}</div>}
      </div>
    </section>
  );
}
