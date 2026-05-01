/**
 * StatusBadge — pill "Abierto · cierra 20:00" / "Cerrado · vuelve sábado" /
 * "Abierto 24/7" para emergencias y servicios continuos.
 */
interface Props {
  estado: "abierto" | "cerrado-hoy" | "cerrado" | "siempre";
  cierra?: string; // "20:00" o "sábado" según corresponda
}

export function StatusBadge({ estado, cierra }: Props) {
  const isOpen = estado === "abierto" || estado === "siempre";
  const dot = isOpen ? "var(--valley-mid)" : "var(--terracotta)";
  const label =
    estado === "siempre"
      ? "Abierto 24/7"
      : estado === "abierto"
      ? `Abierto${cierra ? ` · cierra ${cierra}` : ""}`
      : `Cerrado${cierra ? ` · vuelve ${cierra}` : ""}`;
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
      {label}
    </div>
  );
}
