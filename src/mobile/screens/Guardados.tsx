import { Bookmark, Bell, ChevronRight } from "lucide-react";
import { LUGARES, EVENTOS } from "../data/mockData";

interface Props {
  onOpenLugar: (id: string) => void;
}

export default function Guardados({ onOpenLugar }: Props) {
  const lugaresGuardados = LUGARES.slice(0, 3);
  const eventosGuardados = EVENTOS.slice(0, 2);

  return (
    <div className="pb-32">
      <div className="flex items-center justify-between px-5 pt-3">
        <h1 className="font-mont text-[24px] font-extrabold text-carbon">
          Guardados
        </h1>
        <button className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-tarjeta">
          <Bell size={18} strokeWidth={2} className="text-carbon" />
        </button>
      </div>
      <p className="px-5 mt-1 text-[13px] text-humo">
        Los lugares y eventos que has marcado con ❤.
      </p>

      <section className="mt-6 px-5">
        <h2 className="font-mont text-[15px] font-bold text-carbon">
          Mis lugares
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {lugaresGuardados.map((l) => (
            <button
              key={l.id}
              onClick={() => onOpenLugar(l.id)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-2 text-left shadow-tarjeta"
            >
              <div
                className="h-16 w-20 shrink-0 rounded-xl"
                style={{ background: l.imagen }}
              />
              <div className="min-w-0 flex-1 pr-2">
                <p className="truncate font-mont text-[14.5px] font-bold text-carbon">
                  {l.nombre}
                </p>
                <p className="truncate text-[12px] text-humo">
                  {l.subtitulo}
                </p>
                <p className="text-[11.5px] font-semibold text-bosque-700">
                  {l.precio} · ⭐ {l.rating} ({l.reviews})
                </p>
              </div>
              <Bookmark
                size={18}
                strokeWidth={1.6}
                fill="#1F6B45"
                className="text-bosque-600"
              />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="font-mont text-[15px] font-bold text-carbon">
          Próximos eventos
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {eventosGuardados.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-tarjeta"
            >
              <div
                className="h-14 w-14 shrink-0 rounded-xl"
                style={{ background: e.imagen }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mont text-[14px] font-bold text-carbon">
                  {e.titulo}
                </p>
                <p className="text-[12px] text-humo">
                  {e.hora} hrs · {e.lugar}
                </p>
              </div>
              <ChevronRight size={18} className="text-humo" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
