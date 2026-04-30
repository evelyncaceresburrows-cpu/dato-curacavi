/**
 * DateStamp — sello cuadrado de fecha (día grande + mes corto).
 * Usado por EventCard. Portado de Lovable.
 */
import { mesCorto, parseFecha } from "@/lib/format";

interface Props {
  iso: string; // formato YYYY-MM-DD
  size?: "md" | "lg";
}

export function DateStamp({ iso, size = "md" }: Props) {
  const d = parseFecha(iso);
  const big = size === "lg";
  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center rounded-2xl border text-center"
      style={{
        backgroundColor: "var(--paper)",
        borderColor: "color-mix(in oklab, var(--ink) 8%, transparent)",
        width: big ? 64 : 56,
        height: big ? 64 : 56,
      }}
    >
      <span
        className="tabular font-semibold leading-none"
        style={{
          color: "var(--terracotta)",
          fontSize: big ? 26 : 22,
          letterSpacing: "-0.02em",
          fontFamily: "'Fraunces', Georgia, serif",
        }}
      >
        {d.getDate()}
      </span>
      <span
        className="mt-1 text-[9.5px] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--muted-foreground)" }}
      >
        {mesCorto(d)}
      </span>
    </div>
  );
}
