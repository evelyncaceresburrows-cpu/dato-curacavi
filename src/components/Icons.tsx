/**
 * Iconos ilustrados para Dato Curacaví.
 * Trazo a mano, inspirado en grabados de etiquetas
 * artesanales. Color por defecto: verde parral.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

const base: IconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 28,
  height: 28,
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Plato con cubiertos — Picadas
export const IconPlato = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="24" cy="28" r="12" />
    <circle cx="24" cy="28" r="8" strokeDasharray="1 2" />
    <path d="M12 10 v18" />
    <path d="M10 10 v8 q0 4 2 4" />
    <path d="M14 10 v8 q0 4 -2 4" />
    <path d="M36 10 q-3 0 -3 5 q0 5 3 5 v8" />
  </svg>
);

// Empolvado / dulce — Dulces Issa & Tradición
export const IconDulce = (p: IconProps) => (
  <svg {...base} {...p}>
    <ellipse cx="24" cy="30" rx="14" ry="8" />
    <path d="M10 30 q7 -10 14 -10 q7 0 14 10" />
    <path d="M18 22 q2 -4 6 -4 q4 0 6 4" />
    <circle cx="20" cy="30" r="0.9" fill="currentColor" />
    <circle cx="27" cy="32" r="0.9" fill="currentColor" />
    <circle cx="32" cy="28" r="0.9" fill="currentColor" />
  </svg>
);

// Botella de chicha — Chicherías
export const IconBotella = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 6 h8 v6 q0 2 1 3 l2 3 q2 2 2 5 v18 q0 3 -3 3 h-12 q-3 0 -3 -3 v-18 q0 -3 2 -5 l2 -3 q1 -1 1 -3 v-6 z" />
    <path d="M18 24 h12" />
    <rect x="19" y="26" width="10" height="8" strokeDasharray="2 1.5" />
    <path d="M22 4 h4" />
  </svg>
);

// Maletín — Trámites y Muni
export const IconMaletin = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="8" y="16" width="32" height="22" rx="2" />
    <path d="M18 16 v-3 q0 -2 2 -2 h8 q2 0 2 2 v3" />
    <path d="M8 26 h32" />
    <path d="M22 24 h4 v4 h-4 z" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

// Campana / sirena — Emergencias
export const IconCampana = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M24 8 q-10 0 -10 14 v6 l-2 4 h24 l-2 -4 v-6 q0 -14 -10 -14 z" />
    <path d="M20 36 q0 4 4 4 q4 0 4 -4" />
    <path d="M24 5 v-3" />
    <path d="M10 14 l-3 -3" />
    <path d="M38 14 l3 -3" />
  </svg>
);

// Hoja de parral — usado en el logo
export const IconHoja = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M24 40 q-14 -6 -14 -20 q0 -8 6 -12 q4 -2 10 4 q6 -6 10 -4 q6 4 6 12 q0 14 -14 20 z" />
    <path d="M24 40 v-18" />
    <path d="M24 28 l-6 -4" />
    <path d="M24 28 l6 -4" />
    <path d="M24 22 l-5 -6" />
    <path d="M24 22 l5 -6" />
  </svg>
);

// Sello / verificado
export const IconSello = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M24 6 l4 3 l5 -1 l2 4 l4 3 l-1 5 l2 5 l-4 3 l-1 5 l-5 1 l-4 3 l-4 -3 l-5 -1 l-1 -5 l-4 -3 l2 -5 l-1 -5 l4 -3 l2 -4 l5 1 z" />
    <path d="M18 24 l4 4 l8 -8" />
  </svg>
);

// Teléfono
export const IconTelefono = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 10 h6 l3 8 l-4 3 q3 6 9 9 l3 -4 l8 3 v6 q0 3 -3 3 q-18 -1 -25 -25 q0 -3 3 -3 z" />
  </svg>
);

// Pin mapa
export const IconMapa = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M24 42 s-12 -10 -12 -22 a12 12 0 0 1 24 0 q0 12 -12 22 z" />
    <circle cx="24" cy="20" r="4" />
  </svg>
);

// Lupa
export const IconLupa = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="21" cy="21" r="11" />
    <path d="m38 38 -8 -8" />
  </svg>
);

// Logo Principal — Usando la imagen oficial para fidelidad total
export const LogoPrincipal = (p: { className?: string }) => (
  <img 
    src="/images/logo-oficial.png" 
    alt="Dato Curacaví" 
    className={`object-contain ${p.className || ""}`}
  />
);

// Inicio
export const IconCasa = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 22 18 -14 18 14" />
    <path d="M10 20 v18 q0 2 2 2 h24 q2 0 2 -2 v-18" />
    <path d="M20 40 v-10 h8 v10" />
  </svg>
);
