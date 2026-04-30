/**
 * OpenBadge — pill "Abierto / Cerrado" con punto de estado.
 * Portado del repo Lovable (curacav-local-guide). Usa CSS vars del tema.
 */

interface Props {
  open: boolean;
}

export function OpenBadge({ open }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium tracking-wide"
      style={{
        borderColor: open
          ? "color-mix(in oklab, oklch(0.55 0.13 150) 30%, transparent)"
          : "color-mix(in oklab, var(--border) 100%, transparent)",
        backgroundColor: open
          ? "color-mix(in oklab, oklch(0.65 0.15 150) 8%, transparent)"
          : "transparent",
        color: open ? "oklch(0.42 0.12 150)" : "var(--muted-foreground)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: open ? "oklch(0.6 0.15 150)" : "oklch(0.55 0.05 65)",
          boxShadow: open ? "0 0 0 3px oklch(0.65 0.15 150 / 0.18)" : "none",
        }}
      />
      {open ? "Abierto" : "Cerrado"}
    </span>
  );
}
