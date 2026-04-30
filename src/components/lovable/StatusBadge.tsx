/**
 * StatusBadge — pill "Abierto · cierra 20:00" / "Cerrado · vuelve sábado".
 * Más informativo que el OpenBadge anterior. Portado del mockup Claude Design.
 */
interface Props {
  estado: "abierto" | "cerrado-hoy" | "cerrado";
  cierra?: string; // "20:00" o "sábado" según corresponda
}

export function StatusBadge({ estado, cierra }: Props) {
  const isOpen = estado === "abierto";
  const dot = isOpen ? "var(--valley-mid)" : "var(--terracotta)";
  return (
    <div
      className="inline-flex items-center gap-1.5 font-inter-tight"
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "var(--muted)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: dot,
        }}
      />
      {isOpen
        ? `Abierto${cierra ? ` · cierra ${cierra}` : ""}`
        : `Cerrado${cierra ? ` · vuelve ${cierra}` : ""}`}
    </div>
  );
}
