interface Props {
  iso: string; // "2026-05-25"
  size?: "sm" | "md";
  className?: string;
}

/**
 * DateCap — tarjetita de fecha (día semana + número) estilo esquina.
 * Usa locale `es-CL` para los nombres de día.
 */
export function DateCap({ iso, size = "md", className = "" }: Props) {
  const d = new Date(iso + "T00:00:00");
  const diaSemana = d
    .toLocaleDateString("es-CL", { weekday: "short" })
    .toUpperCase()
    .replace(".", "");
  const diaNum = d.getDate();

  const dims =
    size === "sm"
      ? "w-12 py-1.5 gap-0"
      : "w-14 py-2 gap-1";
  const fontWeek = size === "sm" ? "text-[10px]" : "text-[11px]";
  const fontDay = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div
      className={`flex ${dims} flex-col items-center rounded-2xl bg-white/95 text-center shadow-tarjeta backdrop-blur ${className}`}
    >
      <span className={`${fontWeek} font-bold text-bosque-700 leading-none`}>
        {diaSemana}
      </span>
      <span className={`${fontDay} font-extrabold text-carbon leading-none`}>
        {diaNum}
      </span>
    </div>
  );
}
