import { MapPin } from "lucide-react";

/**
 * Logo "Dato Curacaví" reutilizable.
 * El símbolo es un pin verde con cerros + sol al interior,
 * inspirado en la identidad de los mockups.
 */
export default function BrandLogo({
  variant = "dark",
  size = "md",
}: {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const colorTitle = variant === "dark" ? "text-carbon" : "text-white";
  const tagColor = variant === "dark" ? "text-bosque-600" : "text-[#F4C24A]";
  const titleSize =
    size === "lg"
      ? "text-2xl"
      : size === "sm"
      ? "text-[15px] leading-tight"
      : "text-[18px] leading-tight";
  const pinSize = size === "lg" ? 40 : size === "sm" ? 28 : 32;

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: pinSize + 6, height: pinSize + 6 }}
      >
        <MapPin
          size={pinSize + 6}
          className="absolute inset-0 m-auto text-bosque-600"
          fill="#1F6B45"
          strokeWidth={0}
        />
        {/* Cerro + sol dentro del pin */}
        <svg
          viewBox="0 0 24 24"
          className="absolute top-1 h-4 w-4 text-white"
          aria-hidden
        >
          <circle cx="16" cy="9" r="2.2" fill="#F4C24A" />
          <path d="M3 16 L9 9 L14 14 L21 7" stroke="white" strokeWidth="1.6" fill="none" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span
          className={`font-mont font-extrabold uppercase tracking-tight ${colorTitle} ${titleSize}`}
        >
          Dato
          <br />
          Curacaví
        </span>
        {size !== "sm" && (
          <span className={`tagline mt-0.5 text-[11px] ${tagColor}`}>
            Todo lo que buscas, está aquí.
          </span>
        )}
      </div>
    </div>
  );
}
