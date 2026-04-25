import { Star } from "lucide-react";
import type { Lugar } from "../data/mockData";

interface Props {
  lugar: Lugar;
  onOpen?: () => void;
}

export default function RecommendedCard({ lugar, onOpen }: Props) {
  return (
    <button
      onClick={onOpen}
      className="min-w-[156px] shrink-0 overflow-hidden rounded-2xl bg-white text-left shadow-tarjeta transition-shadow hover:shadow-elevada"
    >
      <div
        className="h-28 w-full"
        style={{ background: lugar.imagen }}
        aria-hidden
      />
      <div className="p-3">
        <p className="truncate font-mont text-[13.5px] font-bold text-carbon">
          {lugar.nombre}
        </p>
        <p className="truncate text-[11.5px] text-humo">{lugar.subtitulo}</p>
        <div className="mt-1.5 flex items-center justify-between text-[11.5px] font-semibold text-carbon">
          <span>{lugar.precio}</span>
          <span className="inline-flex items-center gap-1">
            <Star
              size={11}
              strokeWidth={2}
              fill="#E1A63B"
              className="text-[#E1A63B]"
            />
            {lugar.rating} ({lugar.reviews})
          </span>
        </div>
      </div>
    </button>
  );
}
