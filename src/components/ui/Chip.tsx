import type { ReactNode } from "react";

export type ChipTone =
  | "bosque"
  | "neutral"
  | "arena"
  | "alerta"
  | "socio"
  | "pastel";

interface Props {
  children: ReactNode;
  tone?: ChipTone;
  size?: "sm" | "md";
  icon?: ReactNode;
  bg?: string; // color de fondo custom (chipColor de evento)
  className?: string;
}

const TONES: Record<ChipTone, string> = {
  bosque: "bg-bosque-50 text-bosque-700 border-bosque-600/10",
  neutral: "bg-white text-carbon border-bosque-600/10 shadow-tarjeta",
  arena: "bg-arena-100 text-carbon border-bosque-600/10",
  alerta: "bg-red-50 text-red-700 border-red-200",
  socio: "bg-bosque-600 text-white border-transparent shadow-cta",
  pastel: "text-carbon border-bosque-600/10",
};

const SIZES = {
  sm: "text-[10px] px-2.5 py-1 tracking-widest",
  md: "text-[11px] px-3 py-1.5 tracking-[0.18em]",
};

/**
 * Chip — etiqueta/categoría/estado.
 * Usar `bg` para overridear el fondo (e.g. `chipColor` del evento).
 */
export function Chip({
  children,
  tone = "neutral",
  size = "sm",
  icon,
  bg,
  className = "",
}: Props) {
  const style = bg ? { backgroundColor: bg } : undefined;
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-bold uppercase ${TONES[tone]} ${SIZES[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
