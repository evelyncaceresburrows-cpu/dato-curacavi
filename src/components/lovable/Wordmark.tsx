/**
 * Wordmark — "Dato 68" en Inter Tight 800 con el "68" en terracotta.
 * Portado del mockup Claude Design.
 *
 * - inline=false → bloque con "Dato" arriba y "68" debajo (splash, hero).
 * - inline=true  → "Dato 68" en una línea (header móvil).
 */
interface Props {
  size?: number;
  inline?: boolean;
}

export function Wordmark({ size = 18, inline = false }: Props) {
  if (inline) {
    return (
      <span
        className="font-inter-tight uppercase"
        style={{
          fontWeight: 800,
          fontSize: size,
          letterSpacing: "0.02em",
          color: "var(--ink)",
        }}
      >
        Dato <span style={{ color: "var(--terracotta)" }}>68</span>
      </span>
    );
  }
  return (
    <div
      className="font-inter-tight uppercase"
      style={{
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: "0.02em",
        color: "var(--ink)",
      }}
    >
      <div>Dato</div>
      <div style={{ color: "var(--terracotta)" }}>68</div>
    </div>
  );
}
