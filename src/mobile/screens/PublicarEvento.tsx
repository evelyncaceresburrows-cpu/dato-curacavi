import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Clock,
  Image as ImageIcon,
  MapPin,
  Plus,
  Tag,
  X,
} from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function PublicarEvento({ onClose }: Props) {
  const [tipo, setTipo] = useState<"evento" | "negocio">("evento");
  const [outdoor, setOutdoor] = useState(true);

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-3">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-tarjeta"
        >
          <X size={18} strokeWidth={2} className="text-carbon" />
        </button>
        <h1 className="font-mont text-[17px] font-bold text-carbon">
          Publicar
        </h1>
        <span className="w-10" />
      </div>

      {/* Toggle tipo */}
      <div className="mx-5 mt-5 flex rounded-2xl bg-white p-1 shadow-tarjeta">
        <button
          onClick={() => setTipo("evento")}
          className={`flex-1 rounded-xl py-2.5 text-[13.5px] font-bold transition-colors ${
            tipo === "evento"
              ? "bg-bosque-600 text-white shadow-cta"
              : "text-humo"
          }`}
        >
          Evento
        </button>
        <button
          onClick={() => setTipo("negocio")}
          className={`flex-1 rounded-xl py-2.5 text-[13.5px] font-bold transition-colors ${
            tipo === "negocio"
              ? "bg-bosque-600 text-white shadow-cta"
              : "text-humo"
          }`}
        >
          Negocio / Servicio
        </button>
      </div>

      {/* Fotos */}
      <section className="mt-5 px-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <PhotoTile bg="linear-gradient(135deg,#4a6a41,#b9d28f)" />
          <PhotoTile bg="linear-gradient(135deg,#dba055,#fcd78b)" />
          <PhotoTile bg="linear-gradient(135deg,#5c7a5c,#a9c3a7)" />
          <button className="flex h-[82px] w-[82px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-bosque-200 bg-bosque-50 text-bosque-700">
            <Plus size={20} strokeWidth={2.2} />
            <span className="text-[10.5px] font-semibold">Agregar fotos</span>
          </button>
        </div>
      </section>

      {/* Formulario */}
      <section className="mt-5 space-y-4 px-5">
        <Field label="Título del evento">
          <input
            placeholder="Ej: Feria Libre de Curacaví"
            className="w-full bg-transparent text-[14px] text-carbon outline-none placeholder:text-humo"
          />
        </Field>

        <Field label="Descripción" multiline>
          <textarea
            rows={3}
            placeholder="Cuéntanos más sobre tu evento..."
            className="w-full resize-none bg-transparent text-[14px] text-carbon outline-none placeholder:text-humo"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha" icon={<CalendarDays size={14} />}>
            <div className="flex items-center justify-between text-[13.5px] text-carbon">
              <span>Sáb 25 de mayo, 2026</span>
              <ChevronDown size={16} className="text-humo" />
            </div>
          </Field>

          <Field label="Hora" icon={<Clock size={14} />}>
            <div className="flex items-center justify-between text-[13.5px] text-carbon">
              <span>08:00</span>
              <ChevronDown size={16} className="text-humo" />
            </div>
          </Field>
        </div>

        <Field label="Ubicación" icon={<MapPin size={14} />}>
          <div className="flex items-center justify-between text-[13.5px] text-carbon">
            <span>Plaza Presidente Balmaceda</span>
            <ChevronDown size={16} className="text-humo" />
          </div>
        </Field>

        <Field label="Categoría" icon={<Tag size={14} />}>
          <div className="flex items-center justify-between text-[13.5px] text-carbon">
            <span>Feria</span>
            <ChevronDown size={16} className="text-humo" />
          </div>
        </Field>

        {/* Switch */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-tarjeta">
          <div>
            <p className="text-[13.5px] font-bold text-carbon">
              Evento al aire libre
            </p>
            <p className="text-[11.5px] text-humo">
              Se mostrará con ícono de naturaleza
            </p>
          </div>
          <button
            onClick={() => setOutdoor((v) => !v)}
            aria-label="Toggle outdoor"
            className={`relative h-6 w-11 rounded-full transition-colors ${
              outdoor ? "bg-bosque-600" : "bg-[#D0D5DD]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                outdoor ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-6 px-5">
        <button className="btn-bosque w-full !py-4">
          Publicar {tipo === "evento" ? "evento" : "negocio"}
        </button>
        <p className="mt-2 text-center text-[11px] text-humo">
          Al publicar aceptas nuestros Términos y Condiciones
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  multiline = false,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-humo">
        {icon && <span className="text-bosque-600">{icon}</span>}
        {label}
      </p>
      <div
        className={`rounded-2xl bg-white px-4 ${
          multiline ? "py-3" : "py-3"
        } shadow-tarjeta`}
      >
        {children}
      </div>
    </div>
  );
}

function PhotoTile({ bg }: { bg: string }) {
  return (
    <div
      className="flex h-[82px] w-[82px] shrink-0 items-end justify-end rounded-2xl p-1.5"
      style={{ background: bg }}
    >
      <ImageIcon size={14} className="text-white/80" strokeWidth={2} />
    </div>
  );
}
