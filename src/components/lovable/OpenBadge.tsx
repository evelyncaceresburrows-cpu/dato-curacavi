/**
 * OpenBadge — pill "Abierto / Cerrado / 24/7 / Consultar horario".
 * Acepta prop `estado` con los 4 valores. Mantiene compat con `open` boolean
 * (deprecado) — true = abierto, false = desconocido (no "cerrado", porque
 * sin data la mayoria de comercios no estan cerrados, sino sin horario
 * cargado).
 */

type Estado = "abierto" | "cerrado" | "siempre" | "desconocido";

interface Props {
  open?: boolean;
  estado?: Estado;
}

export function OpenBadge({ open, estado }: Props) {
  // Si nos pasan estado explicito, lo usamos. Si no, mappeamos open boolean
  // (legacy) a abierto/desconocido — NUNCA a "cerrado" implicito.
  const e: Estado =
    estado ?? (open === true ? "abierto" : "desconocido");

  const isOpen = e === "abierto" || e === "siempre";
  const label =
    e === "siempre"
      ? "Abierto 24/7"
      : e === "abierto"
      ? "Abierto"
      : e === "desconocido"
      ? "Consultar horario"
      : "Cerrado";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium tracking-wide"
      style={{
        borderColor: isOpen
          ? "color-mix(in oklab, oklch(0.55 0.13 150) 30%, transparent)"
          : "color-mix(in oklab, var(--border) 100%, transparent)",
        backgroundColor: isOpen
          ? "color-mix(in oklab, oklch(0.65 0.15 150) 8%, transparent)"
          : "transparent",
        color: isOpen ? "oklch(0.42 0.12 150)" : "var(--muted-foreground)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: isOpen ? "oklch(0.6 0.15 150)" : "oklch(0.55 0.05 65)",
          boxShadow: isOpen ? "0 0 0 3px oklch(0.65 0.15 150 / 0.18)" : "none",
        }}
      />
      {label}
    </span>
  );
}
