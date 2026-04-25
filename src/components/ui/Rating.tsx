import { Star } from "lucide-react";

interface Props {
  value: number;
  reviews?: number;
  size?: number;
  className?: string;
}

/**
 * Rating — estrella + número + conteo opcional.
 * Shape compacto (14px) para listados; grande (18px) para hero.
 */
export function Rating({ value, reviews, size = 14, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 text-carbon font-bold ${className}`}>
      <Star size={size} fill="currentColor" className="text-amber-500" />
      <span>{value.toFixed(1)}</span>
      {typeof reviews === "number" && (
        <span className="text-humo font-medium">({reviews})</span>
      )}
    </span>
  );
}
