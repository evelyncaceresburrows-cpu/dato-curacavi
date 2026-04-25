/**
 * RegistroSocioSkill.tsx
 * Skill de registro de socio — Directiva Inquebrantable #2.
 * Se activa cuando el Concierge detecta que el usuario es un comerciante.
 * Formulario compacto integrado en el panel de chat.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, ChevronRight, X, CheckCircle2, Store } from "lucide-react";

interface Props {
  onCerrar: () => void;
}

type TipoNegocio =
  | ""
  | "gastronomia"
  | "comercio"
  | "servicios"
  | "turismo"
  | "otro";

const TIPOS = [
  { key: "gastronomia" as TipoNegocio, label: "🍽️ Gastronomía" },
  { key: "comercio" as TipoNegocio, label: "🛒 Comercio" },
  { key: "servicios" as TipoNegocio, label: "🔧 Servicios" },
  { key: "turismo" as TipoNegocio, label: "🌿 Turismo" },
];

export default function RegistroSocioSkill({ onCerrar }: Props) {
  const [tipo, setTipo] = useState<TipoNegocio>("");
  const [nombre, setNombre] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !tipo) return;
    // En producción: POST a Supabase membresía_pendiente
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="mx-3 mb-3 overflow-hidden rounded-md border border-parral-300 bg-parral-50 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={24} className="shrink-0 text-parral-700" strokeWidth={1.8} />
          <div>
            <p className="font-display text-sm font-bold text-parral-800">
              ¡Registro recibido, vecino!
            </p>
            <p className="mt-1 text-xs text-tierra-700">
              <strong>{nombre}</strong> está en lista de espera del piloto 2026.
              El equipo de Dato Curacaví le contactará en 48 hrs.
            </p>
            <Link
              to="/socio"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-parral-700 hover:underline"
            >
              Ver formulario completo <ChevronRight size={12} />
            </Link>
          </div>
          <button
            onClick={onCerrar}
            className="ml-auto shrink-0 rounded-full p-1 text-tierra-400 hover:text-tierra-700"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-3 overflow-hidden rounded-md border-2 border-chicha-300 bg-chicha-50 shadow-md animate-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 bg-chicha px-4 py-3 text-crema">
        <Store size={16} strokeWidth={1.8} className="shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-wider">
            Inscripción de Negocio
          </p>
          <p className="text-[11px] text-crema/80">Piloto 2026 · Sin costo</p>
        </div>
        <button
          onClick={onCerrar}
          className="rounded-full p-1 transition-colors hover:bg-chicha-700"
          aria-label="Cerrar registro"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {/* Nombre del negocio */}
        <div>
          <label
            htmlFor="concierge-nombre-negocio"
            className="block text-[11px] font-bold uppercase tracking-wider text-chicha-800"
          >
            Nombre del negocio
          </label>
          <input
            id="concierge-nombre-negocio"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Chichería Don Pancho"
            required
            className="mt-1.5 w-full rounded-sm border border-chicha-200 bg-white px-3 py-2 text-sm text-tierra-900 placeholder-tierra-300 focus:border-chicha focus:outline-none focus:ring-1 focus:ring-chicha"
          />
        </div>

        {/* Tipo de negocio */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-chicha-800">
            Tipo de negocio
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {TIPOS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTipo(t.key)}
                className={`rounded-sm px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                  tipo === t.key
                    ? "bg-chicha text-crema"
                    : "border border-chicha-200 bg-white text-tierra-700 hover:bg-chicha-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={!nombre.trim() || !tipo}
            className="flex-1 flex items-center justify-center gap-2 rounded-sm bg-chicha px-3 py-2 text-sm font-bold text-crema transition-colors hover:bg-chicha-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Briefcase size={14} strokeWidth={2} />
            Inscribir al tiro
          </button>
          <Link
            to="/socio"
            className="flex items-center gap-1 rounded-sm border border-chicha-300 px-3 py-2 text-xs font-semibold text-chicha-800 hover:bg-chicha-100"
          >
            + Info <ChevronRight size={12} />
          </Link>
        </div>
      </form>
    </div>
  );
}
