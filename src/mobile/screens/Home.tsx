import { useState } from "react";
import { Bell, ChevronDown, ChevronRight, Sun, MapPin } from "lucide-react";
import SearchInput from "../components/SearchInput";
import RecommendedCard from "../components/RecommendedCard";
import {
  CATEGORIAS_HOME,
  LUGARES,
  EVENTOS,
} from "../data/mockData";

interface Props {
  onOpenLugar: (id: string) => void;
  onOpenAgenda: () => void;
}

export default function Home({ onOpenLugar, onOpenAgenda }: Props) {
  const [query, setQuery] = useState("");

  const datoDia = EVENTOS.find((e) => e.id === "feria-libre")!;
  const recomendados = LUGARES.filter((l) =>
    ["la-pica", "cafe-patio", "vina-altar-uco", "farmacia-curacavi"].includes(l.id)
  );

  return (
    <div className="relative pb-32">
      {/* ——— Header con greeting ——— */}
      <div className="px-5 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mont text-[22px] font-extrabold leading-tight text-carbon">
              ¡Hola, Camila! <span aria-hidden>👋</span>
            </p>
            <p className="mt-0.5 text-[13.5px] text-humo">
              ¿Qué planes hay hoy?
            </p>
          </div>
          <button
            aria-label="Notificaciones"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-tarjeta"
          >
            <Bell size={18} strokeWidth={2} className="text-carbon" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-bosque-600" />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mt-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar panoramas, lugares, servicios..."
          />
        </div>

        {/* Pill ubicación + clima */}
        <div className="mt-3 flex items-center justify-between">
          <button className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-4 py-2 text-[13.5px] font-semibold text-carbon shadow-tarjeta">
            <MapPin size={14} strokeWidth={2.2} className="text-bosque-600" />
            Curacaví
            <ChevronDown size={14} strokeWidth={2.2} className="text-humo" />
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5 text-[13px] font-semibold text-carbon shadow-tarjeta">
            <Sun size={16} className="text-[#E1A63B]" fill="#F4C24A" strokeWidth={0} />
            22°C
          </div>
        </div>
      </div>

      {/* ——— Explora Curacaví ——— */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <h2 className="font-mont text-[17px] font-bold text-carbon">
            Explora Curacaví
          </h2>
          <button className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-bosque-600">
            Ver todo <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-2 overflow-x-auto">
          {CATEGORIAS_HOME.map((c) => (
            <button
              key={c.key}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="quick-circle"
                style={{ background: c.color }}
              >
                <c.Icon size={22} strokeWidth={2.1} />
              </span>
              <span className="text-[10.5px] font-semibold leading-tight text-carbon">
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ——— Dato del día ——— */}
      <section className="mt-6 px-5">
        <button
          onClick={onOpenAgenda}
          className="flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-white p-3 text-left shadow-tarjeta transition-shadow hover:shadow-elevada"
        >
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-md bg-bosque-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-bosque-700">
              Dato del día
            </span>
            <p className="mt-2 font-mont text-[17px] font-bold leading-tight text-carbon">
              {datoDia.titulo}
            </p>
            <p className="mt-1 text-[12.5px] text-humo">
              Hoy desde las {datoDia.hora} hrs.
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-humo">
              <MapPin size={11} strokeWidth={2} className="text-bosque-600" />
              {datoDia.lugar}
            </p>
          </div>
          <div
            className="h-24 w-24 shrink-0 rounded-xl"
            style={{ background: datoDia.imagen }}
            aria-hidden
          />
        </button>
      </section>

      {/* ——— Recomendados para ti ——— */}
      <section className="mt-6">
        <div className="flex items-end justify-between px-5">
          <h2 className="font-mont text-[17px] font-bold text-carbon">
            Recomendados para ti
          </h2>
          <button className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-bosque-600">
            Ver todo <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
          {recomendados.map((l) => (
            <RecommendedCard
              key={l.id}
              lugar={l}
              onOpen={() => onOpenLugar(l.id)}
            />
          ))}
        </div>
      </section>

      {/* ——— Qué hacer este fin de semana (cards grandes) ——— */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <h2 className="font-mont text-[17px] font-bold text-carbon">
            Qué hacer este fin de semana
          </h2>
          <button
            onClick={onOpenAgenda}
            className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-bosque-600"
          >
            Ver calendario <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {EVENTOS.filter((e) =>
            ["noche-sabores", "trekking-la-cruz", "taller-ceramica"].includes(e.id)
          ).map((e) => {
            const d = new Date(e.fecha + "T00:00:00");
            const dia = d
              .toLocaleDateString("es-CL", { weekday: "short" })
              .slice(0, 3)
              .toUpperCase();
            const num = d.getDate();
            return (
              <button
                key={e.id}
                onClick={onOpenAgenda}
                className="relative h-44 min-w-[248px] overflow-hidden rounded-2xl p-4 text-left shadow-tarjeta"
                style={{ background: e.imagen }}
              >
                <div className="flex w-12 flex-col items-center rounded-xl bg-white py-1">
                  <span className="text-[10px] font-bold text-bosque-700">
                    {dia}
                  </span>
                  <span className="text-[20px] font-extrabold leading-none text-carbon">
                    {num}
                  </span>
                </div>
                <div className="absolute inset-x-4 bottom-3 text-white">
                  <p className="font-mont text-[16px] font-bold leading-tight drop-shadow">
                    {e.titulo}
                  </p>
                  <p className="text-[12px] opacity-90 drop-shadow">
                    {e.descripcionCorta}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
