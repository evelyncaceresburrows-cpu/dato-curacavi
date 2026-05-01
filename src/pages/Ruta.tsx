/**
 * /ruta — Arma tu Ruta
 *
 * Form sin reload: cambia inputs → recalcula `armarRuta(input, comercios, comunas)`.
 * Resultado se renderiza como timeline vertical (parada por parada),
 * usando el sistema visual existente (bosque-600, arena, shadow-tarjeta, etc.).
 *
 * Sin nueva paleta. Sin librerías de map. Sólo lógica + cards.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  DollarSign,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useComercios } from "@/data/hooks/useComercios";
import {
  armarRuta,
  type ArmarRutaInput,
  type ComercioRuta,
  type ComunaNodo,
} from "@/lib/armarRuta";
import { SEO } from "@/components/SEO";
import { track, Events } from "@/lib/analytics";

// ─── Catálogo local ──────────────────────────────────────────────────────────
// Mientras Supabase no esté conectado en el cliente, usamos las 8 comunas
// del seed de la migration 0004 (mismas y en el mismo orden).

const COMUNAS_SEED: ComunaNodo[] = [
  { id: "pudahuel",    nombre: "Pudahuel",     eje_ruta_km: 10 },
  { id: "curacavi",    nombre: "Curacaví",     eje_ruta_km: 43 },
  { id: "maria_pinto", nombre: "María Pinto",  eje_ruta_km: 56 },
  { id: "casablanca",  nombre: "Casablanca",   eje_ruta_km: 78 },
  { id: "algarrobo",   nombre: "Algarrobo",    eje_ruta_km: 100 },
  { id: "quintay",     nombre: "Quintay",      eje_ruta_km: 110 },
  { id: "placilla",    nombre: "Placilla",     eje_ruta_km: 115 },
  { id: "valparaiso",  nombre: "Valparaíso",   eje_ruta_km: 120 },
];

// Tags combinables (sincronizado con migration 0004 seed).
const TAGS_DISPONIBLES: { id: string; label: string; grupo: string }[] = [
  { id: "ninos",        label: "Niños",        grupo: "Público" },
  { id: "familia",      label: "Familia",      grupo: "Público" },
  { id: "pareja",       label: "Pareja",       grupo: "Público" },
  { id: "romantico",    label: "Romántico",    grupo: "Público" },
  { id: "pet_friendly", label: "Pet friendly", grupo: "Público" },
  { id: "barato",       label: "Barato",       grupo: "Presupuesto" },
  { id: "premium",      label: "Premium",      grupo: "Presupuesto" },
  { id: "vino",         label: "Vino",         grupo: "Experiencia" },
  { id: "comida",       label: "Comida",       grupo: "Experiencia" },
  { id: "naturaleza",   label: "Naturaleza",   grupo: "Experiencia" },
  { id: "de_paso",      label: "De paso",      grupo: "Logística" },
  { id: "rapido",       label: "Rápido",       grupo: "Logística" },
  { id: "bano",         label: "Baño",         grupo: "Logística" },
  { id: "lluvia",       label: "Lluvia",       grupo: "Logística" },
  { id: "finde",        label: "Finde",        grupo: "Temporal" },
  { id: "emergencia",   label: "Emergencia",   grupo: "Urgencia" },
];

// ─── Helpers UI ──────────────────────────────────────────────────────────────

const fmtClp = (v: number) =>
  v === 0 ? "Gratis" : `$${v.toLocaleString("es-CL")}`;

const fmtMin = (v: number) => {
  if (v < 60) return `${v} min`;
  const h = Math.floor(v / 60);
  const m = v % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

// ─── Página ──────────────────────────────────────────────────────────────────

export default function Ruta() {
  const [origen, setOrigen] = useState<ArmarRutaInput["origen"]>("santiago");
  const [direccion, setDireccion] = useState<ArmarRutaInput["direccion"]>("ida");
  // Defaults coherentes con los datos reales: 30 comercios distribuidos
  // km 11→110, mayoria en Curacavi (km 43) + viñas Casablanca (km 75-80).
  // Un domingo "tipo" sale 3h de tiempo, $25k presupuesto, 3 paradas.
  const [tiempoMin, setTiempoMin] = useState(180);
  const [presupuestoClp, setPresupuestoClp] = useState(25000);
  const [tagsSel, setTagsSel] = useState<string[]>([]);
  const [maxParadas, setMaxParadas] = useState(3);
  const [calculado, setCalculado] = useState(false);

  const { data: comercios = [] } = useComercios();

  function toggleTag(id: string) {
    setTagsSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // Recalculamos sólo si el usuario presionó "Armar". Evita recalcular en cada
  // tecla y deja al usuario probar combinaciones.
  const resultado = useMemo(() => {
    if (!calculado) return null;
    return armarRuta(
      {
        origen,
        direccion,
        tiempo_min: tiempoMin,
        presupuesto_clp: presupuestoClp,
        tags: tagsSel,
        max_paradas: maxParadas,
      },
      comercios as ComercioRuta[],
      COMUNAS_SEED
    );
  }, [calculado, origen, direccion, tiempoMin, presupuestoClp, tagsSel, maxParadas, comercios]);

  function handleArmar() {
    setCalculado(true);
    track(Events.ARMAR_RUTA, {
      origen,
      direccion: direccion ?? "ida",
      tiempo_min: tiempoMin,
      presupuesto_clp: presupuestoClp,
      tags: tagsSel.join(",") || "ninguno",
      max_paradas: maxParadas,
    });
  }

  // Agrupa tags por grupo para mostrar secciones legibles.
  const tagsPorGrupo = useMemo(() => {
    const out: Record<string, typeof TAGS_DISPONIBLES> = {};
    for (const t of TAGS_DISPONIBLES) {
      if (!out[t.grupo]) out[t.grupo] = [];
      out[t.grupo].push(t);
    }
    return out;
  }, []);

  return (
    <div
      style={{ background: "var(--cream)" }}
      className="mx-auto max-w-screen-xl px-4 md:px-12 pt-8 md:pt-16 pb-32 md:pb-16 min-h-screen"
    >
      <SEO
        title="Arma tu ruta — Ruta 68 a tu medida"
        description="Plan personalizado de Ruta 68: indícanos tiempo, presupuesto y tipo de panorama y te armamos un recorrido con paradas verificadas, de Santiago a Valparaíso."
        path="/ruta"
      />

      <header className="mb-10">
        <p
          className="font-inter-tight uppercase"
          style={{
            color: "var(--terracotta)",
            fontWeight: 700,
            letterSpacing: "0.16em",
            fontSize: 11,
          }}
        >
          Ruta 68 · Tu plan
        </p>
        <h1
          className="font-fraunces mt-2"
          style={{
            fontSize: "clamp(32px, 5vw, 44px)",
            fontWeight: 500,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            lineHeight: 1.05,
          }}
        >
          Arma tu <em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>ruta</em>
        </h1>
        <p
          className="font-inter-tight mt-3 max-w-2xl"
          style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.55 }}
        >
          Decinos cuánto tiempo tenés, cuánto querés gastar y qué te
          gustaría hacer. Te armamos un plan con paradas verificadas a lo
          largo de la Ruta 68.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* ——— Form ——— */}
        <section
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <div className="flex flex-col gap-6">
            {/* Origen */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-widest text-humo">
                Salida
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["santiago", "valparaiso"] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOrigen(o)}
                    aria-pressed={origen === o}
                    className="font-inter-tight rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all"
                    style={{
                      borderColor: origen === o ? "var(--valley)" : "var(--border-soft)",
                      background: origen === o ? "var(--valley)" : "var(--cream)",
                      color: origen === o ? "var(--cream)" : "var(--ink)",
                    }}
                  >
                    {o === "santiago" ? "Desde Santiago" : "Desde Valparaíso"}
                  </button>
                ))}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-widest text-humo">
                Dirección
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["ida", "vuelta", "circuito"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDireccion(d)}
                    aria-pressed={direccion === d}
                    className="font-inter-tight rounded-2xl border-2 px-3 py-2.5 text-sm font-bold capitalize transition-all"
                    style={{
                      borderColor: direccion === d ? "var(--valley)" : "var(--border-soft)",
                      background: direccion === d ? "var(--valley)" : "var(--cream)",
                      color: direccion === d ? "var(--cream)" : "var(--ink)",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Tiempo */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="ruta-tiempo" className="text-xs font-extrabold uppercase tracking-widest text-humo flex items-center gap-2">
                  <Clock size={14} /> Tiempo total
                </label>
                <span className="font-bold text-carbon tabular-nums">{fmtMin(tiempoMin)}</span>
              </div>
              <input
                id="ruta-tiempo"
                type="range"
                min={60}
                max={600}
                step={30}
                value={tiempoMin}
                onChange={(e) => setTiempoMin(Number(e.target.value))}
                aria-label={`Tiempo total: ${fmtMin(tiempoMin)}`}
                aria-valuetext={fmtMin(tiempoMin)}
                className="mt-3 w-full"
                style={{ accentColor: "var(--valley)" }}
              />
            </div>

            {/* Presupuesto */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="ruta-presupuesto" className="text-xs font-extrabold uppercase tracking-widest text-humo flex items-center gap-2">
                  <Wallet size={14} /> Presupuesto
                </label>
                <span className="font-bold text-carbon tabular-nums">{fmtClp(presupuestoClp)}</span>
              </div>
              <input
                id="ruta-presupuesto"
                type="range"
                min={0}
                max={150000}
                step={5000}
                value={presupuestoClp}
                onChange={(e) => setPresupuestoClp(Number(e.target.value))}
                aria-label={`Presupuesto: ${fmtClp(presupuestoClp)}`}
                aria-valuetext={fmtClp(presupuestoClp)}
                className="mt-3 w-full"
                style={{ accentColor: "var(--valley)" }}
              />
            </div>

            {/* Max paradas */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="ruta-paradas" className="text-xs font-extrabold uppercase tracking-widest text-humo flex items-center gap-2">
                  <MapPin size={14} /> Paradas
                </label>
                <span className="font-bold text-carbon tabular-nums">{maxParadas}</span>
              </div>
              <input
                id="ruta-paradas"
                type="range"
                min={1}
                max={6}
                step={1}
                value={maxParadas}
                onChange={(e) => setMaxParadas(Number(e.target.value))}
                aria-label={`Cantidad de paradas: ${maxParadas}`}
                className="mt-3 w-full"
                style={{ accentColor: "var(--valley)" }}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-widest text-humo">
                ¿Qué te gustaría hacer?
              </label>
              <p className="mt-1 text-xs text-humo">
                Combiná los que quieras. Sin tags = todo entra.
              </p>
              {Object.entries(tagsPorGrupo).map(([grupo, lista]) => (
                <div key={grupo} className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-humo/70">
                    {grupo}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {lista.map((t) => {
                      const on = tagsSel.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTag(t.id)}
                          aria-pressed={on}
                          className="font-inter-tight rounded-full px-3 py-1.5 text-xs font-bold transition-all"
                          style={{
                            background: on ? "var(--valley)" : "var(--cream)",
                            color: on ? "var(--cream)" : "var(--ink)",
                            border: `1px solid ${on ? "var(--valley)" : "var(--border)"}`,
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleArmar}
              className="btn-bosque mt-2 w-full py-4 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Armar mi ruta
            </button>
          </div>
        </section>

        {/* ——— Resultado ——— */}
        <section>
          {!resultado && (
            <div className="rounded-3xl bg-white p-10 shadow-tarjeta border border-bosque-600/5 text-center">
              <Sparkles size={32} className="mx-auto text-bosque-600/40" />
              <p className="mt-4 font-bold text-carbon">Listos para armar tu ruta</p>
              <p className="mt-1 text-sm text-humo max-w-md mx-auto">
                Ajustá tiempo, presupuesto y tags y presioná{" "}
                <strong>Armar mi ruta</strong>. Te mostramos un plan con paradas
                ordenadas en el corredor.
              </p>
            </div>
          )}

          {resultado && resultado.paradas.length === 0 && (
            <div className="rounded-3xl bg-white p-10 shadow-tarjeta border border-bosque-600/5 text-center">
              <p className="font-bold text-carbon">Sin paradas que cumplan</p>
              <ul className="mt-4 text-sm text-humo space-y-1 max-w-md mx-auto text-left list-disc list-inside">
                {resultado.notas.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-humo">
                Probá ampliar tiempo, presupuesto o quitar algún tag.
              </p>
            </div>
          )}

          {resultado && resultado.paradas.length > 0 && (
            <div className="space-y-6">
              {/* Resumen */}
              <div
                className="rounded-3xl p-6"
                style={{
                  background:
                    "linear-gradient(135deg, var(--valley) 0%, var(--valley-mid) 100%)",
                  color: "var(--cream)",
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-arena/80">
                  Tu plan
                </p>
                <h2 className="mt-1 font-mont text-2xl font-extrabold tracking-tight">
                  {resultado.paradas.length} parada
                  {resultado.paradas.length !== 1 ? "s" : ""} ·{" "}
                  {fmtMin(resultado.total_min)}
                </h2>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <ResumenCelda
                    icon={<Clock size={14} />}
                    label="Tiempo"
                    valor={fmtMin(resultado.total_min)}
                  />
                  <ResumenCelda
                    icon={<DollarSign size={14} />}
                    label="Costo"
                    valor={fmtClp(resultado.total_clp)}
                  />
                  <ResumenCelda
                    icon={<MapPin size={14} />}
                    label="Recorrido"
                    valor={`${resultado.km_recorridos} km`}
                  />
                </div>
                {resultado.notas.length > 0 && (
                  <p className="mt-4 text-xs text-arena/80">
                    {resultado.notas.join(" · ")}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <ol className="space-y-4">
                {resultado.paradas.map((p, idx) => (
                  <li
                    key={p.comercio.id}
                    className="rounded-3xl bg-white p-5 md:p-6 shadow-tarjeta border border-bosque-600/5"
                  >
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bosque-600 text-white font-extrabold text-sm">
                          {idx + 1}
                        </span>
                        {idx < resultado.paradas.length - 1 && (
                          <span className="flex-1 w-px bg-bosque-600/15 mt-2" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              to={`/lugar/${p.comercio.slug}`}
                              onClick={() =>
                                track(Events.ARMAR_RUTA_PARADA, {
                                  slug: p.comercio.slug,
                                  posicion: idx + 1,
                                })
                              }
                              className="font-mont font-extrabold text-lg text-carbon hover:text-bosque-600 transition-colors block truncate"
                            >
                              {p.comercio.nombre}
                            </Link>
                            <p className="text-sm text-humo line-clamp-2 mt-0.5">
                              {p.comercio.subtitulo}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-bosque-50 px-3 py-1 text-[11px] font-extrabold text-bosque-600 whitespace-nowrap">
                            km {Math.round(p.eje_ruta_km)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-humo">
                          <span className="inline-flex items-center gap-1 rounded-full bg-arena px-2.5 py-1">
                            <Clock size={12} /> {fmtMin(p.tiempo_visita_min)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-arena px-2.5 py-1">
                            <Wallet size={12} /> {fmtClp(p.costo_clp)}
                          </span>
                          {idx > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-arena px-2.5 py-1">
                              <ArrowRight size={12} /> +{fmtMin(p.eta_min)} viaje
                            </span>
                          )}
                          {p.motivo
                            .filter((m) => !m.startsWith("score"))
                            .slice(0, 3)
                            .map((m) => (
                              <span
                                key={m}
                                className="inline-flex items-center gap-1 rounded-full bg-bosque-50 px-2.5 py-1 text-bosque-600"
                              >
                                {m.replace(/_/g, " ")}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ResumenCelda({
  icon,
  label,
  valor,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-arena/70">
        {icon} {label}
      </div>
      <p className="mt-0.5 font-mont font-extrabold tabular-nums truncate">{valor}</p>
    </div>
  );
}
