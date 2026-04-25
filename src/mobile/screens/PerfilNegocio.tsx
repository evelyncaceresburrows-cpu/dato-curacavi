import {
  ArrowLeft,
  Clock,
  Globe,
  Heart,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  Star,
  ChevronDown,
} from "lucide-react";
import { LUGARES } from "../data/mockData";

interface Props {
  lugarId: string;
  onBack: () => void;
}

export default function PerfilNegocio({ lugarId, onBack }: Props) {
  const l = LUGARES.find((x) => x.id === lugarId) ?? LUGARES[0];
  const abierto = Boolean(l.abiertoHasta);

  return (
    <div className="pb-32">
      {/* Hero */}
      <div
        className="relative h-60 w-full"
        style={{ background: l.imagen }}
      >
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-3">
          <button
            onClick={onBack}
            aria-label="Volver"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-tarjeta"
          >
            <ArrowLeft size={18} strokeWidth={2} className="text-carbon" />
          </button>
          <div className="flex items-center gap-2">
            <button
              aria-label="Favorito"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-tarjeta"
            >
              <Heart size={18} strokeWidth={2} className="text-carbon" />
            </button>
            <button
              aria-label="Compartir"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-tarjeta"
            >
              <Share2 size={18} strokeWidth={2} className="text-carbon" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-3 right-5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
          1/12
        </div>
      </div>

      {/* Card info superpuesta */}
      <div className="relative z-10 -mt-6 px-4">
        <div className="rounded-3xl bg-white p-4 shadow-elevada">
          <div className="flex items-start gap-3">
            {/* Sello logo */}
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-carbon/10 bg-white shadow-tarjeta">
              <span className="text-center font-mont text-[9px] font-extrabold leading-none text-carbon">
                {l.nombre
                  .split(" ")
                  .slice(0, 3)
                  .map((w) => w[0]?.toUpperCase())
                  .join("")}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mont text-[20px] font-extrabold leading-tight text-carbon">
                {l.nombre}
              </p>
              <p className="text-[13px] text-humo">{l.subtitulo}</p>
              <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-carbon">
                <Star size={13} fill="#E1A63B" strokeWidth={0} />
                <span>{l.rating}</span>
                <span className="text-humo">({l.reviews} reseñas)</span>
                <span className="text-humo">·</span>
                <span>{l.precio}</span>
                <span className="text-humo">·</span>
                <span>Chilena</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  abierto
                    ? "bg-bosque-600 text-white"
                    : "bg-humo text-white"
                }`}
              >
                {abierto ? "Abierto" : "Cerrado"}
              </span>
              {l.abiertoHasta && (
                <span className="text-[11px] text-humo">
                  Cierra {l.abiertoHasta}
                </span>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <ActionButton label="Llamar" Icon={Phone} />
            <ActionButton
              label="WhatsApp"
              Icon={MessageCircle}
              color="#25D366"
            />
            <ActionButton label="Cómo llegar" Icon={Navigation} />
            <ActionButton label="Sitio web" Icon={Globe} />
          </div>
        </div>
      </div>

      {/* Dirección & horario */}
      <section className="mt-4 space-y-3 px-5">
        <div className="flex items-start gap-2 text-[13.5px] text-carbon">
          <MapPin
            size={16}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-bosque-600"
          />
          <span className="flex-1">{l.direccion}</span>
          {l.distanciaKm && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bosque-50 px-2 py-0.5 text-[11.5px] font-semibold text-bosque-700">
              <Navigation size={11} strokeWidth={2.2} />
              {l.distanciaKm} km
            </span>
          )}
        </div>
        <button className="flex w-full items-center gap-2 text-[13px] text-carbon">
          <Clock size={16} strokeWidth={2} className="text-bosque-600" />
          <span className="font-semibold">
            Hoy 08:00 – {l.abiertoHasta ?? "22:00"}
          </span>
          <ChevronDown size={14} strokeWidth={2.2} className="text-humo" />
        </button>

        <p className="text-[13.5px] leading-relaxed text-carbon">
          {l.descripcion}
          <button className="ml-1 font-semibold text-bosque-700">
            Ver más
          </button>
        </p>

        {/* Destacados */}
        {l.destacados && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {l.destacados.map((d) => (
              <span
                key={d}
                className="rounded-full bg-bosque-50 px-3 py-1 text-[11.5px] font-semibold text-bosque-700"
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Galería */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <h2 className="font-mont text-[16px] font-bold text-carbon">
            Galería
          </h2>
          <button className="text-[12.5px] font-semibold text-bosque-600">
            Ver todas
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <GalleryTile bg="linear-gradient(135deg,#d6b380,#a87847)" emoji="🍽️" />
          <GalleryTile bg="linear-gradient(135deg,#b08968,#7a5a38)" emoji="🪑" />
          <GalleryTile bg="linear-gradient(135deg,#e2b8a2,#b57855)" emoji="🍰" />
        </div>
      </section>

      {/* Reseñas */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <h2 className="font-mont text-[16px] font-bold text-carbon">
            Opiniones destacadas
          </h2>
          <button className="text-[12.5px] font-semibold text-bosque-600">
            Ver todas
          </button>
        </div>
        <div className="mt-3 rounded-2xl bg-white p-4 shadow-tarjeta">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-bosque-600 font-mont text-[13px] font-bold text-white">
              M
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-carbon">María José</p>
              <p className="inline-flex items-center gap-0.5 text-[11px] text-[#E1A63B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={10} fill="#E1A63B" strokeWidth={0} />
                ))}
              </p>
            </div>
            <span className="text-[11px] text-humo">Hace 2 días</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-carbon">
            Excelente comida, la atención increíble y el lugar hermoso. 100%
            recomendado 👌
          </p>
        </div>
      </section>

      {/* CTA principal */}
      <div className="mt-6 px-5">
        <button className="btn-bosque w-full !py-4">
          <Navigation size={18} strokeWidth={2.2} /> Cómo llegar
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  Icon,
  color,
}: {
  label: string;
  Icon: typeof Phone;
  color?: string;
}) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-2xl bg-bosque-50 py-3 text-[11px] font-semibold text-bosque-700 transition-colors hover:bg-bosque-100">
      <span
        className="grid h-9 w-9 place-items-center rounded-full bg-white"
        style={{ color: color ?? "#1F6B45" }}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      {label}
    </button>
  );
}

function GalleryTile({ bg, emoji }: { bg: string; emoji: string }) {
  return (
    <div
      className="relative flex h-24 items-end justify-end overflow-hidden rounded-xl p-2 text-xl"
      style={{ background: bg }}
    >
      <span aria-hidden>{emoji}</span>
    </div>
  );
}
