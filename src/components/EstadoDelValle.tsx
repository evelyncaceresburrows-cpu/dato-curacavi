import { useEffect, useState } from "react";
import { Building2, Cloud, Sun, CloudSun, Clock } from "lucide-react";

/**
 * Widget "Estado del Valle".
 * Calcula en tiempo real si la Municipalidad de Curacaví
 * está atendiendo (lunes a viernes, 8:30 a 17:00) y muestra
 * un clima representativo del valle.
 *
 * El clima es un mock estacional: en producción se conecta
 * a OpenWeather o a la API de la DMC con la coordenada
 * de Curacaví (-33.40, -71.16).
 */

const HORARIO_MUNI = {
  desde: { h: 8, m: 30 },
  hasta: { h: 17, m: 0 },
};

function muniAbierta(now = new Date()) {
  const dia = now.getDay(); // 0 dom — 6 sáb
  if (dia === 0 || dia === 6) return false;
  const minutos = now.getHours() * 60 + now.getMinutes();
  const desde = HORARIO_MUNI.desde.h * 60 + HORARIO_MUNI.desde.m;
  const hasta = HORARIO_MUNI.hasta.h * 60 + HORARIO_MUNI.hasta.m;
  return minutos >= desde && minutos < hasta;
}

function climaPorMes(now = new Date()) {
  const mes = now.getMonth(); // 0 ene — 11 dic
  // Curacaví: clima mediterráneo, verano caluroso seco,
  // invierno fresco con heladas matinales en el valle.
  if ([11, 0, 1].includes(mes))
    return { label: "Despejado", temp: 28, Icon: Sun, tono: "verano" };
  if ([2, 3, 4].includes(mes))
    return { label: "Parcial", temp: 21, Icon: CloudSun, tono: "otoño" };
  if ([5, 6, 7].includes(mes))
    return { label: "Frío y nuboso", temp: 11, Icon: Cloud, tono: "invierno" };
  return { label: "Soleado", temp: 19, Icon: Sun, tono: "primavera" };
}

export default function EstadoDelValle() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const abierta = muniAbierta(now);
  const clima = climaPorMes(now);
  const hora = now.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <aside className="ficha overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-linea bg-crema-100 px-5 py-3">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.22em] text-tierra-900">
          Estado del Valle
        </h3>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-tierra-400">
          <Clock size={12} strokeWidth={1.5} />
          {hora}
        </span>
      </header>

      <div className="grid grid-cols-2 divide-x divide-dashed divide-tierra-200">
        {/* Municipalidad */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-tierra-700">
            <Building2 size={16} strokeWidth={1.25} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Municipalidad
            </span>
          </div>
          <p className="mt-2 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                abierta ? "bg-parral animate-ambar-pulse" : "bg-tierra-200"
              }`}
              aria-hidden
            />
            <span
              className={`font-display text-lg font-bold ${
                abierta ? "text-parral" : "text-tierra-700"
              }`}
            >
              {abierta ? "Atendiendo" : "Cerrada"}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-tierra-700/80">
            Lun a vie · 8:30 a 17:00 hrs
          </p>
        </div>

        {/* Clima */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-tierra-700">
            <clima.Icon size={16} strokeWidth={1.25} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Clima del valle
            </span>
          </div>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold text-tierra-900">
              {clima.temp}°
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-tierra-700/70">
              {clima.label}
            </span>
          </p>
          <p className="mt-1 text-[11px] capitalize text-tierra-700/80">
            {clima.tono} en Curacaví
          </p>
        </div>
      </div>
    </aside>
  );
}
