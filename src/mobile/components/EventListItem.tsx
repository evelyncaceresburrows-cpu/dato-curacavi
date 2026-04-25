import { Bookmark, Clock, MapPin } from "lucide-react";
import type { Evento } from "../data/mockData";

interface Props {
  evento: Evento;
  onOpen?: () => void;
}

/**
 * Item de evento estilo mockup "Todos los eventos":
 * imagen redondeada izquierda + cápsula de fecha sobrepuesta,
 * título + subtítulo + horario + chip categoría + bookmark.
 */
export default function EventListItem({ evento, onOpen }: Props) {
  const d = new Date(evento.fecha + "T00:00:00");
  const dia = d
    .toLocaleDateString("es-CL", { weekday: "short" })
    .slice(0, 3)
    .toUpperCase();
  const num = d.getDate();
  const mes = d
    .toLocaleDateString("es-CL", { month: "short" })
    .slice(0, 3)
    .toUpperCase();

  return (
    <button
      onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-2xl bg-white p-2 pr-4 text-left shadow-tarjeta transition-shadow hover:shadow-elevada"
    >
      <div
        className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl"
        style={{ background: evento.imagen }}
      >
        <div className="absolute right-1.5 top-1.5 flex w-10 flex-col items-center rounded-lg bg-white py-1 text-center">
          <span className="text-[9px] font-bold text-bosque-700">{dia}</span>
          <span className="text-[16px] font-extrabold leading-none text-carbon">
            {num}
          </span>
          <span className="text-[9px] font-semibold text-humo">{mes}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mont text-[15px] font-bold text-carbon">
          {evento.titulo}
        </p>
        <p className="mt-0.5 truncate text-[12.5px] text-humo">
          {evento.descripcionCorta}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-humo">
          <span className="inline-flex items-center gap-1">
            <Clock size={11} strokeWidth={2} />
            {evento.hora} hrs
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} strokeWidth={2} />
            {evento.lugar}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold text-carbon"
          style={{ background: evento.chipColor }}
        >
          {capitalize(evento.categoria)}
        </span>
        <Bookmark
          size={18}
          strokeWidth={1.6}
          className="text-humo group-hover:text-bosque-600"
        />
      </div>
    </button>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
