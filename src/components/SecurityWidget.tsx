/**
 * SecurityWidget.tsx
 * Widget de emergencias del Concierge del Valle.
 * Se activa automáticamente ante palabras de emergencia.
 * Directiva Inquebrantable #1: Prioridad de Seguridad.
 */

import { Phone, X, AlertTriangle, Shield } from "lucide-react";

interface NumeroEmergencia {
  etiqueta: string;
  numero: string;
  descripcion: string;
  urgencia: "alta" | "media";
}

const NUMEROS: NumeroEmergencia[] = [
  {
    etiqueta: "Seguridad Municipal",
    numero: "*4129",
    descripcion: "Patrullaje 24/7 y denuncia vecinal",
    urgencia: "alta",
  },
  {
    etiqueta: "Carabineros",
    numero: "133",
    descripcion: "Plan Cuadrante Curacaví",
    urgencia: "alta",
  },
  {
    etiqueta: "Bomberos",
    numero: "132",
    descripcion: "Emergencia e incendios",
    urgencia: "alta",
  },
  {
    etiqueta: "SAMU",
    numero: "131",
    descripcion: "Ambulancia y urgencia médica",
    urgencia: "alta",
  },
];

interface Props {
  onCerrar: () => void;
}

export default function SecurityWidget({ onCerrar }: Props) {
  return (
    <div className="mx-3 mb-3 overflow-hidden rounded-md border-2 border-red-500 bg-red-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 bg-red-600 px-4 py-3 text-white">
        <AlertTriangle size={18} strokeWidth={2} className="shrink-0 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-wider">
            Emergencias
          </p>
          <p className="text-[11px] opacity-80">Curacaví — activo 24/7</p>
        </div>
        <button
          onClick={onCerrar}
          className="rounded-full p-1 transition-colors hover:bg-red-700"
          aria-label="Cerrar widget de seguridad"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Números */}
      <ul className="divide-y divide-red-200 px-4 py-2">
        {NUMEROS.map((n) => (
          <li key={n.numero} className="flex items-center justify-between py-2.5">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                {n.etiqueta}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-red-600/70">
                {n.descripcion}
              </p>
            </div>
            <a
              href={`tel:${n.numero.replace(/\s/g, "")}`}
              className="ml-3 flex shrink-0 items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 font-mono text-sm font-bold text-white transition-colors hover:bg-red-700"
              aria-label={`Llamar ${n.etiqueta}: ${n.numero}`}
            >
              <Phone size={13} strokeWidth={2.5} />
              {n.numero}
            </a>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center gap-2 bg-red-100 px-4 py-2.5 text-red-700">
        <Shield size={12} strokeWidth={2} />
        <p className="text-[10px] font-medium">
          Guarde este panel — llame antes de escribir en una emergencia real
        </p>
      </div>
    </div>
  );
}
