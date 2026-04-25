import { useState } from "react";
import { Bell, Bookmark, CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { CATEGORIAS_AGENDA, EVENTOS, FECHAS_AGENDA } from "../data/mockData";
import EventListItem from "../components/EventListItem";

type Tab = "destacados" | "fin_semana" | "proximos" | "categoria";

interface Props {
  onOpenPublicar: () => void;
}

export default function Agenda({ onOpenPublicar }: Props) {
  const [tab, setTab] = useState<Tab>("destacados");
  const [dateIdx, setDateIdx] = useState(2); // SÁB 25 MAY
  const [cat, setCat] = useState<string>("todos");

  const destacado = EVENTOS.find((e) => e.id === "feria-libre")!;
  const resto = EVENTOS.filter((e) => e.id !== "feria-libre");

  return (
    <div className="pb-32">
      <div className="px-5 pt-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div />
          <button className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-tarjeta">
            <Bell size={18} strokeWidth={2} className="text-carbon" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-bosque-600" />
          </button>
        </div>

        <h1 className="mt-2 font-mont text-[40px] font-extrabold leading-none text-carbon">
          Agenda
        </h1>
        <p className="mt-1 text-[14px] text-humo">
          Descubre lo mejor que pasa en Curacaví
        </p>

        {/* Tabs arriba */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {(
            [
              { key: "destacados", label: "Destacados" },
              { key: "fin_semana", label: "Este fin de semana" },
              { key: "proximos", label: "Próximos" },
              { key: "categoria", label: "Por categoría" },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                tab === t.key
                  ? "border-bosque-600 bg-bosque-600 text-white"
                  : "border-black/5 bg-white text-carbon"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Franja fechas */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-tarjeta">
          <div className="flex flex-1 gap-1.5 overflow-x-auto">
            {FECHAS_AGENDA.map((f, i) => {
              const a = i === dateIdx;
              return (
                <button
                  key={`${f.dia}-${f.num}`}
                  onClick={() => setDateIdx(i)}
                  className={`date-cap ${a ? "date-cap-active" : ""}`}
                >
                  <span
                    className={`text-[9.5px] font-bold ${
                      a ? "text-white/80" : "text-humo"
                    }`}
                  >
                    {f.dia}
                  </span>
                  <span
                    className={`text-[20px] font-extrabold leading-tight ${
                      a ? "text-white" : "text-carbon"
                    }`}
                  >
                    {f.num}
                  </span>
                  <span
                    className={`text-[9.5px] font-bold ${
                      a ? "text-white/80" : "text-humo"
                    }`}
                  >
                    {f.mes}
                  </span>
                  <span
                    className={`mt-1 h-1 w-1 rounded-full ${
                      a
                        ? "bg-white"
                        : f.hasEvent
                        ? "bg-bosque-600"
                        : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <button
            aria-label="Ver calendario"
            className="flex shrink-0 flex-col items-center rounded-xl bg-bosque-50 px-2 py-2 text-bosque-700"
          >
            <CalendarDays size={20} strokeWidth={2} />
            <span className="mt-0.5 text-[9.5px] font-bold leading-tight">
              Ver
              <br />
              calendario
            </span>
          </button>
        </div>

        {/* Categorías circulares */}
        <div className="mt-5 flex gap-4 overflow-x-auto pb-1">
          {CATEGORIAS_AGENDA.map((c) => {
            const a = cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <span
                  className="relative flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    background: c.key === "todos" ? "#EAF4EC" : c.color,
                    color: c.key === "todos" ? "#1F6B45" : "#4a3a2a",
                  }}
                >
                  <c.Icon
                    size={20}
                    strokeWidth={c.key === "todos" ? 2.4 : 2}
                  />
                </span>
                <span
                  className={`text-[11.5px] font-semibold ${
                    a ? "text-bosque-700" : "text-carbon"
                  }`}
                >
                  {c.label}
                </span>
                {a && (
                  <span className="h-0.5 w-5 rounded-full bg-bosque-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Evento destacado */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <h2 className="font-mont text-[17px] font-bold text-carbon">
            Eventos destacados
          </h2>
          <button className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-bosque-600">
            Ver todos <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="mt-3 flex overflow-hidden rounded-3xl bg-white shadow-tarjeta">
          <div
            className="relative h-auto w-[42%] shrink-0"
            style={{ background: destacado.imagen }}
          >
            <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-bosque-700">
              Destacado
            </span>
          </div>
          <div className="flex-1 p-4">
            <p className="font-mont text-[17px] font-bold leading-tight text-carbon">
              {destacado.titulo}
            </p>
            <ul className="mt-2 space-y-1 text-[12.5px] text-humo">
              <li className="inline-flex items-center gap-1.5">
                <CalendarDays size={12} strokeWidth={2} className="text-bosque-600" />
                Sábado 25 de mayo
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="text-bosque-600">⏱</span>
                Desde las {destacado.hora} hrs.
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin size={12} strokeWidth={2} className="text-bosque-600" />
                {destacado.lugar}
              </li>
            </ul>
            <p className="mt-2 text-[12px] leading-snug text-humo">
              {destacado.descripcionCorta}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {destacado.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-bosque-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-bosque-700"
                >
                  {t}
                </span>
              ))}
              <Bookmark
                size={18}
                strokeWidth={1.6}
                className="ml-auto text-humo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Todos los eventos */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <h2 className="font-mont text-[17px] font-bold text-carbon">
            Todos los eventos
          </h2>
          <button className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-humo">
            Filtrar
            <span className="inline-block h-3 w-3 rounded-full border border-humo" />
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {resto.map((e) => (
            <EventListItem key={e.id} evento={e} />
          ))}
        </div>
      </section>

      {/* CTA publicar */}
      <section className="mt-6 px-5">
        <div className="flex items-center gap-3 rounded-2xl bg-bosque-50 p-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-bosque-600 shadow-tarjeta">
            <CalendarDays size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mont text-[13.5px] font-bold text-carbon">
              ¿Tienes un evento que quieres publicar?
            </p>
            <p className="text-[11.5px] text-humo">
              Compártelo con la comunidad
            </p>
          </div>
          <button
            onClick={onOpenPublicar}
            className="btn-bosque !rounded-full !px-4 !py-2 text-[12.5px]"
          >
            Publicar evento
          </button>
        </div>
      </section>
    </div>
  );
}
