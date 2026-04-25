import { useState } from "react";
import {
  Bookmark,
  Locate,
  Navigation,
  Star,
} from "lucide-react";
import SearchInput from "../components/SearchInput";
import PillButton from "../components/PillButton";
import { LUGARES } from "../data/mockData";

const CATS = [
  { key: "todos", label: "Todos" },
  { key: "comer", label: "Comer" },
  { key: "panoramas", label: "Panoramas" },
  { key: "servicios", label: "Servicios" },
  { key: "mas", label: "Más" },
];

interface Props {
  onOpenLugar: (id: string) => void;
}

export default function ExplorarMapa({ onOpenLugar }: Props) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("todos");
  const [selectedId, setSelectedId] = useState<string>("la-pica");

  const visibles = LUGARES.filter(
    (l) => cat === "todos" || cat === "mas" || l.categoria === cat
  );
  const sel = LUGARES.find((l) => l.id === selectedId)!;

  return (
    <div className="relative h-[calc(100vh-72px)] min-h-[760px] pb-32">
      {/* Top bar busqueda */}
      <div className="absolute inset-x-0 top-0 z-10 px-5 pt-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="¿Qué estás buscando?"
          filters
        />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {CATS.map((c) => (
            <PillButton
              key={c.key}
              label={c.label}
              active={cat === c.key}
              onClick={() => setCat(c.key)}
            />
          ))}
        </div>
      </div>

      {/* MAPA ——— SVG ilustrado de Curacaví */}
      <div className="absolute inset-0 top-0 h-full w-full overflow-hidden bg-[#EAF2DC]">
        <svg
          viewBox="0 0 400 780"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-hidden
        >
          {/* fondo verde claro */}
          <rect width="400" height="780" fill="#E4EECD" />
          {/* parches verdes (cerros, parcelas) */}
          <path
            d="M0,40 C80,20 160,80 240,50 S400,20 400,60 L400,140 L0,140 Z"
            fill="#BFD99A"
            opacity="0.6"
          />
          <path
            d="M0,600 C80,580 160,640 240,610 S400,580 400,620 L400,780 L0,780 Z"
            fill="#B9D28F"
            opacity="0.55"
          />
          {/* Ruta 68 — diagonal amarilla */}
          <path
            d="M-20,520 L420,240"
            stroke="#F4C24A"
            strokeWidth="14"
            opacity="0.7"
          />
          <path
            d="M-20,520 L420,240"
            stroke="#FDF5D8"
            strokeWidth="3"
            strokeDasharray="6 10"
          />
          {/* calle principal urbana — horizontal blanca */}
          <path
            d="M40,420 C140,390 250,410 370,380"
            stroke="#FFFFFF"
            strokeWidth="8"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M40,420 C140,390 250,410 370,380"
            stroke="#F0F0F0"
            strokeWidth="2"
            strokeDasharray="3 6"
            fill="none"
          />
          {/* Secundarias */}
          <path
            d="M120,180 L200,380 L260,560"
            stroke="#FFFFFF"
            strokeWidth="5"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M320,130 L280,320 L310,560"
            stroke="#FFFFFF"
            strokeWidth="4"
            fill="none"
            opacity="0.65"
          />
          {/* etiqueta "Curacaví" */}
          <text
            x="200"
            y="440"
            textAnchor="middle"
            fontFamily="Montserrat, sans-serif"
            fontSize="18"
            fontWeight="700"
            fill="#4a4a4a"
          >
            Curacaví
          </text>
          <text
            x="50"
            y="620"
            fontFamily="Inter, sans-serif"
            fontSize="10"
            fill="#7a7a7a"
          >
            Ruta 68
          </text>
        </svg>

        {/* Pins — posicionados sobre el mapa */}
        {visibles.map((l) => {
          const a = l.id === selectedId;
          return (
            <button
              key={l.id}
              onClick={() => setSelectedId(l.id)}
              style={{
                left: `${l.coords.x}%`,
                top: `${l.coords.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-full transition-transform"
            >
              <MapPinIcon color={l.pinColor} scale={a ? 1.2 : 1} />
              <span
                className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-carbon shadow-tarjeta ${
                  a ? "block" : "hidden"
                }`}
              >
                {l.nombre}
              </span>
            </button>
          );
        })}

        {/* Mini-pastilla "tú" */}
        <span className="absolute left-[46%] top-[48%] flex -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2F5AA0] ring-4 ring-white" />
      </div>

      {/* FABs */}
      <div className="absolute bottom-[210px] right-5 z-10 flex flex-col gap-3">
        <button
          aria-label="Mi ubicación"
          className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-elevada"
        >
          <Locate size={20} strokeWidth={2} className="text-bosque-600" />
        </button>
        <button
          aria-label="Brújula"
          className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-elevada"
        >
          <Navigation size={20} strokeWidth={2} className="text-bosque-600" />
        </button>
      </div>

      {/* Tarjeta inferior — lugar seleccionado */}
      <div className="absolute inset-x-4 bottom-[100px] z-10">
        <button
          onClick={() => onOpenLugar(sel.id)}
          className="flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-white p-2 pr-4 text-left shadow-elevada"
        >
          <div
            className="h-20 w-24 shrink-0 rounded-xl"
            style={{ background: sel.imagen }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mont text-[15px] font-bold text-carbon">
              {sel.nombre}
            </p>
            <p className="text-[12px] text-humo">{sel.subtitulo}</p>
            <div className="mt-1 flex items-center gap-2 text-[12px] font-semibold text-carbon">
              <span className="inline-flex items-center gap-1">
                <Star size={11} fill="#E1A63B" strokeWidth={0} />
                {sel.rating} ({sel.reviews})
              </span>
              <span className="text-humo">·</span>
              <span>{sel.precio}</span>
            </div>
            {sel.abiertoHasta && (
              <p className="text-[11px] font-semibold text-bosque-700">
                Abierto hasta {sel.abiertoHasta}
              </p>
            )}
          </div>
          <Bookmark size={18} strokeWidth={1.6} className="text-humo" />
        </button>
      </div>
    </div>
  );
}

/** Pin tipo gota de Google Maps, relleno de color categoría. */
function MapPinIcon({ color, scale = 1 }: { color: string; scale?: number }) {
  return (
    <div
      className="relative drop-shadow-md"
      style={{ transform: `scale(${scale})` }}
    >
      <svg width="34" height="42" viewBox="0 0 34 42" aria-hidden>
        <path
          d="M17 0 C7.6 0 0 7.4 0 16.6 C0 27 17 42 17 42 C17 42 34 27 34 16.6 C34 7.4 26.4 0 17 0 Z"
          fill={color}
          stroke="white"
          strokeWidth="2"
        />
        <circle cx="17" cy="16" r="6" fill="white" />
      </svg>
    </div>
  );
}
