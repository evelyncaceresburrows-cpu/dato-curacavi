import { Signal, Wifi, BatteryFull } from "lucide-react";

/**
 * Barra de estado iOS — "9:41" izquierda, íconos derechos.
 * Color adaptable (light/dark) según la pantalla que la use.
 */
export default function StatusBar({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const color = variant === "dark" ? "text-carbon" : "text-white";
  return (
    <div
      className={`flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-semibold ${color}`}
    >
      <span className="tabular-nums">9:41</span>
      <div className="flex items-center gap-1">
        <Signal size={14} strokeWidth={2.4} />
        <Wifi size={14} strokeWidth={2.4} />
        <BatteryFull size={18} strokeWidth={2.2} />
      </div>
    </div>
  );
}
