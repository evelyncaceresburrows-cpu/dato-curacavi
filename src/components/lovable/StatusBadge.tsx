/**
 * StatusBadge — pill de estado horario.
 *
 *   abierto    → "Abierto · cierra 20:00"
 *   cerrado    → "Cerrado · vuelve sábado"
 *   siempre    → "Abierto 24/7"  (emergencias)
 *   desconocido→ "Consultar horario"  (cuando no tenemos data)
 *
 * El UI antes pintaba "Cerrado" cada vez que abierto_hasta era null,
 * cosa que mentia: una caleta de mariscos un domingo de almuerzo no
 * esta "cerrada", solo no tenemos la data cargada. "Consultar horario"
 * es honesto.
 */
interface Props {
  estado: "abierto" | "cerrado-hoy" | "cerrado" | "siempre" | "desconocido";
  cierra?: string; // "20:00" o "sábado" según corresponda
}

export function StatusBadge({ estado, cierra }: Props) {
  const isOpen = estado === "abierto" || estado === "siempre";
  const isUnknown = estado === "desconocido";
  const dot = isOpen
    ? "var(--valley-mid)"
    : isUnknown
    ? "var(--muted)"
    : "var(--terracotta)";
  const label =
    estado === "siempre"
      ? "Abierto 24/7"
      : estado === "abierto"
      ? `Abierto${cierra ? ` · cierra ${cierra}` : ""}`
      : estado === "desconocido"
      ? "Consultar horario"
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
