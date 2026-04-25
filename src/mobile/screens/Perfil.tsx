import {
  Bookmark,
  ChevronRight,
  History,
  LogOut,
  Settings,
  Star,
} from "lucide-react";
import { LUGARES } from "../data/mockData";

interface Props {
  onOpenLugar: (id: string) => void;
}

export default function Perfil({ onOpenLugar }: Props) {
  const favs = LUGARES.slice(0, 3);

  return (
    <div className="pb-32">
      {/* Hero card */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-3 rounded-3xl bg-bosque-600 p-4 text-white shadow-cta">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 font-mont text-[18px] font-bold">
            C
          </div>
          <div className="flex-1">
            <p className="font-mont text-[18px] font-extrabold">Camila R.</p>
            <p className="text-[12.5px] opacity-90">📍 Curacaví</p>
          </div>
          <button className="rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-semibold">
            Editar perfil
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        <Stat label="Guardados" value="28" Icon={Bookmark} />
        <Stat label="Eventos asistidos" value="12" Icon={Star} />
        <Stat label="Reseñas" value="5" Icon={History} />
      </div>

      {/* Mis favoritos */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <h2 className="font-mont text-[15px] font-bold text-carbon">
            Mis favoritos
          </h2>
          <button className="text-[12.5px] font-semibold text-bosque-600">
            Ver todo
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {favs.map((l) => (
            <button
              key={l.id}
              onClick={() => onOpenLugar(l.id)}
              className="aspect-[4/3] rounded-xl shadow-tarjeta"
              style={{ background: l.imagen }}
              aria-label={l.nombre}
            />
          ))}
        </div>
      </section>

      {/* Menú */}
      <section className="mt-6 space-y-2 px-4">
        <Row label="Historial de búsquedas" Icon={History} />
        <Row label="Preferencias" Icon={Settings} />
        <Row label="Cerrar sesión" Icon={LogOut} accent />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Bookmark;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white py-3 shadow-tarjeta">
      <Icon size={18} className="text-bosque-600" strokeWidth={2} />
      <p className="mt-1 font-mont text-[16px] font-extrabold text-carbon">
        {value}
      </p>
      <p className="text-[11px] text-humo">{label}</p>
    </div>
  );
}

function Row({
  label,
  Icon,
  accent = false,
}: {
  label: string;
  Icon: typeof Bookmark;
  accent?: boolean;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-tarjeta">
      <span
        className={`grid h-8 w-8 place-items-center rounded-full ${
          accent ? "bg-red-50 text-red-600" : "bg-bosque-50 text-bosque-600"
        }`}
      >
        <Icon size={16} strokeWidth={2} />
      </span>
      <span className="flex-1 text-[13.5px] font-semibold text-carbon">
        {label}
      </span>
      <ChevronRight size={16} className="text-humo" />
    </button>
  );
}
