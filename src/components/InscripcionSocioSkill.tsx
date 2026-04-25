/**
 * InscripcionSocioSkill.tsx
 * Skill: InscripcionSocio
 *
 * Disparador: "quiero salir", "mi negocio", "inscribir", "publicidad".
 * Stepper de 3 pasos integrado en el panel del Concierge:
 *
 *   Paso 1 — Datos básicos (nombre, contacto, dirección)
 *   Paso 2 — Categoría (selección visual con iconos)
 *   Paso 3 — Foto (upload con preview + fallback texto)
 *
 * Acción final: POST a tabla `solicitudes` vía solicitudesApi.
 */

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Upload,
  Loader2,
  Store,
  UtensilsCrossed,
  Cookie,
  Wine,
  Wrench,
  Leaf,
  Package,
} from "lucide-react";
import { crearSolicitudLegacy as crearSolicitud } from "../lib/solicitudesApi";

// ─── Categorías disponibles ───────────────────────────────────────────────────
const CATEGORIAS_INSCRIPCION = [
  {
    key: "picadas",
    label: "Gastronomía",
    sub: "Restorán, picada, parrilla",
    Icon: UtensilsCrossed,
    color: "parral",
  },
  {
    key: "dulces",
    label: "Dulces & Panadería",
    sub: "Repostería, empolvados, pan",
    Icon: Cookie,
    color: "chicha",
  },
  {
    key: "chicha",
    label: "Chichería",
    sub: "Chicha, vino artesanal, viña",
    Icon: Wine,
    color: "amber",
  },
  {
    key: "servicios",
    label: "Servicios",
    sub: "Mecánica, plomería, etc.",
    Icon: Wrench,
    color: "blue",
  },
  {
    key: "turismo",
    label: "Turismo Rural",
    sub: "Cabañas, senderos, agro",
    Icon: Leaf,
    color: "green",
  },
  {
    key: "comercio",
    label: "Comercio General",
    sub: "Almacén, ferretería, etc.",
    Icon: Package,
    color: "slate",
  },
] as const;

type CatKey = (typeof CATEGORIAS_INSCRIPCION)[number]["key"];

// ─── Estado del formulario ────────────────────────────────────────────────────
interface FormData {
  nombre: string;
  contacto: string;
  direccion: string;
  categoria: CatKey | "";
  descripcion: string;
  fotoPreview: string | null;
  fotoFile: File | null;
}

const FORM_INICIAL: FormData = {
  nombre: "",
  contacto: "",
  direccion: "",
  categoria: "",
  descripcion: "",
  fotoPreview: null,
  fotoFile: null,
};

// ─── Indicador de pasos ───────────────────────────────────────────────────────
function StepIndicator({ paso, total }: { paso: number; total: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-tierra-100">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const activo = idx === paso;
        const completado = idx < paso;
        return (
          <div key={idx} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                completado
                  ? "bg-parral-700 text-crema"
                  : activo
                  ? "border-2 border-parral-700 bg-parral-50 text-parral-700"
                  : "border border-tierra-200 bg-white text-tierra-300"
              }`}
            >
              {completado ? (
                <CheckCircle2 size={13} strokeWidth={2.5} />
              ) : (
                idx
              )}
            </div>
            {idx < total && (
              <div
                className={`h-px w-6 transition-colors ${
                  completado ? "bg-parral-400" : "bg-tierra-200"
                }`}
              />
            )}
          </div>
        );
      })}
      <span className="ml-1 text-[10px] text-tierra-400">
        {paso === 1 && "Datos"}
        {paso === 2 && "Categoría"}
        {paso === 3 && "Foto y envío"}
      </span>
    </div>
  );
}

// ─── Paso 1: Datos básicos ────────────────────────────────────────────────────
function Paso1({
  form,
  onChange,
  onSiguiente,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  onSiguiente: () => void;
}) {
  const valido = form.nombre.trim().length >= 2 && form.contacto.trim().length >= 6;

  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <label
          htmlFor="socio-nombre"
          className="block text-[11px] font-bold uppercase tracking-wider text-tierra-700"
        >
          Nombre del negocio *
        </label>
        <input
          id="socio-nombre"
          type="text"
          value={form.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
          placeholder="Ej: Chichería Don Pancho"
          required
          className="mt-1.5 w-full rounded-md border border-tierra-200 bg-white px-3 py-2 text-sm text-tierra-900 placeholder-tierra-300 focus:border-parral-400 focus:outline-none focus:ring-1 focus:ring-parral-400/30"
        />
      </div>

      <div>
        <label
          htmlFor="socio-contacto"
          className="block text-[11px] font-bold uppercase tracking-wider text-tierra-700"
        >
          Teléfono o correo de contacto *
        </label>
        <input
          id="socio-contacto"
          type="text"
          value={form.contacto}
          onChange={(e) => onChange("contacto", e.target.value)}
          placeholder="+56 9 9999 9999 o correo@ejemplo.cl"
          required
          className="mt-1.5 w-full rounded-md border border-tierra-200 bg-white px-3 py-2 text-sm text-tierra-900 placeholder-tierra-300 focus:border-parral-400 focus:outline-none focus:ring-1 focus:ring-parral-400/30"
        />
      </div>

      <div>
        <label
          htmlFor="socio-direccion"
          className="block text-[11px] font-bold uppercase tracking-wider text-tierra-700"
        >
          Dirección o sector
        </label>
        <input
          id="socio-direccion"
          type="text"
          value={form.direccion}
          onChange={(e) => onChange("direccion", e.target.value)}
          placeholder="Ej: Javiera Carrera 410, Curacaví"
          className="mt-1.5 w-full rounded-md border border-tierra-200 bg-white px-3 py-2 text-sm text-tierra-900 placeholder-tierra-300 focus:border-parral-400 focus:outline-none focus:ring-1 focus:ring-parral-400/30"
        />
      </div>

      <button
        type="button"
        onClick={onSiguiente}
        disabled={!valido}
        className="mt-1 flex items-center justify-center gap-2 rounded-md bg-parral-700 px-4 py-2.5 text-sm font-bold text-crema transition-colors hover:bg-parral-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente — Categoría
        <ChevronRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Paso 2: Categoría ────────────────────────────────────────────────────────
function Paso2({
  form,
  onChange,
  onAnterior,
  onSiguiente,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  onAnterior: () => void;
  onSiguiente: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-tierra-700">
        ¿Qué tipo de negocio es?
      </p>

      <div className="grid grid-cols-2 gap-2">
        {CATEGORIAS_INSCRIPCION.map(({ key, label, sub, Icon }) => {
          const seleccionado = form.categoria === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange("categoria", key)}
              className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-left transition-all ${
                seleccionado
                  ? "border-parral-400 bg-parral-50 ring-1 ring-parral-400/30"
                  : "border-tierra-200 bg-white hover:border-parral-200 hover:bg-crema-100"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                className={seleccionado ? "text-parral-700" : "text-tierra-400"}
              />
              <div className="min-w-0">
                <p
                  className={`text-[11px] font-bold leading-tight ${
                    seleccionado ? "text-parral-800" : "text-tierra-700"
                  }`}
                >
                  {label}
                </p>
                <p className="text-[9px] leading-tight text-tierra-400 truncate">
                  {sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Descripción breve */}
      <div>
        <label
          htmlFor="socio-desc"
          className="block text-[11px] font-bold uppercase tracking-wider text-tierra-700"
        >
          Cuéntenos en una línea
        </label>
        <textarea
          id="socio-desc"
          value={form.descripcion}
          onChange={(e) => onChange("descripcion", e.target.value)}
          placeholder="Ej: Chicha artesanal de cuba, venta directa los fines de semana"
          rows={2}
          className="mt-1.5 w-full resize-none rounded-md border border-tierra-200 bg-white px-3 py-2 text-sm text-tierra-900 placeholder-tierra-300 focus:border-parral-400 focus:outline-none focus:ring-1 focus:ring-parral-400/30"
          maxLength={160}
        />
        <p className="mt-0.5 text-right text-[10px] text-tierra-300">
          {form.descripcion.length}/160
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAnterior}
          className="flex items-center gap-1 rounded-md border border-tierra-200 px-3 py-2 text-sm font-semibold text-tierra-600 hover:bg-crema-100"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          Atrás
        </button>
        <button
          type="button"
          onClick={onSiguiente}
          disabled={!form.categoria}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-parral-700 px-4 py-2.5 text-sm font-bold text-crema transition-colors hover:bg-parral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente — Foto
          <ChevronRight size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Paso 3: Foto y envío ─────────────────────────────────────────────────────
function Paso3({
  form,
  onFotoChange,
  onAnterior,
  onEnviar,
  enviando,
}: {
  form: FormData;
  onFotoChange: (file: File | null, preview: string | null) => void;
  onAnterior: () => void;
  onEnviar: () => void;
  enviando: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return onFotoChange(null, null);
    const reader = new FileReader();
    reader.onload = (ev) => onFotoChange(file, ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-tierra-700">
        Foto de su negocio (opcional)
      </p>

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-tierra-200 bg-crema-100 py-5 transition-colors hover:border-parral-300 hover:bg-parral-50"
      >
        {form.fotoPreview ? (
          <img
            src={form.fotoPreview}
            alt="Preview"
            className="h-24 w-full rounded-sm object-cover"
          />
        ) : (
          <>
            <Upload size={22} strokeWidth={1.5} className="text-tierra-300" />
            <span className="text-[11px] font-medium text-tierra-400">
              Toque para subir (JPG/PNG, máx 5 MB)
            </span>
          </>
        )}
        <input
          ref={inputRef}
          id="socio-foto"
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="sr-only"
        />
      </button>

      {form.fotoPreview && (
        <button
          type="button"
          onClick={() => {
            onFotoChange(null, null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="self-start text-[11px] font-medium text-red-500 hover:underline"
        >
          Quitar foto
        </button>
      )}

      {/* Resumen */}
      <div className="rounded-md border border-tierra-100 bg-crema-100 px-3 py-2.5 text-[11px] text-tierra-700 space-y-0.5">
        <p>
          <strong>Negocio:</strong> {form.nombre}
        </p>
        <p>
          <strong>Contacto:</strong> {form.contacto}
        </p>
        {form.direccion && (
          <p>
            <strong>Dirección:</strong> {form.direccion}
          </p>
        )}
        <p>
          <strong>Categoría:</strong>{" "}
          {CATEGORIAS_INSCRIPCION.find((c) => c.key === form.categoria)?.label}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAnterior}
          disabled={enviando}
          className="flex items-center gap-1 rounded-md border border-tierra-200 px-3 py-2 text-sm font-semibold text-tierra-600 hover:bg-crema-100 disabled:opacity-40"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          Atrás
        </button>
        <button
          type="button"
          onClick={onEnviar}
          disabled={enviando}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-chicha px-4 py-2.5 text-sm font-bold text-crema transition-colors hover:bg-chicha-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {enviando ? (
            <>
              <Loader2 size={14} className="animate-spin" strokeWidth={2.5} />
              Enviando…
            </>
          ) : (
            <>
              <Store size={14} strokeWidth={2} />
              Inscribir al tiro
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Estado final: Éxito ──────────────────────────────────────────────────────
function Exito({ nombre, onCerrar }: { nombre: string; onCerrar: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-parral-50 ring-4 ring-parral-100">
        <CheckCircle2 size={28} strokeWidth={1.5} className="text-parral-700" />
      </div>
      <div>
        <p className="font-display text-base font-bold text-parral-800">
          ¡{nombre} está en lista!
        </p>
        <p className="mt-1 font-serif text-xs italic text-tierra-700">
          El equipo de Dato Curacaví le contactará en las próximas 48 hrs para verificar y
          publicar su ficha en el directorio vecinal.
        </p>
      </div>
      <div className="flex gap-2 mt-1">
        <Link
          to="/socio"
          className="flex items-center gap-1 rounded-full border border-parral-200 px-4 py-1.5 text-xs font-semibold text-parral-700 hover:bg-parral-50"
        >
          Ver planes <ChevronRight size={11} />
        </Link>
        <button
          onClick={onCerrar}
          className="rounded-full bg-parral-700 px-4 py-1.5 text-xs font-bold text-crema hover:bg-parral-800"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface Props {
  onCerrar: () => void;
}

export default function InscripcionSocioSkill({ onCerrar }: Props) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleChange(key: keyof FormData, valor: string) {
    setForm((prev) => ({ ...prev, [key]: valor }));
  }

  function handleFoto(file: File | null, preview: string | null) {
    setForm((prev) => ({ ...prev, fotoFile: file, fotoPreview: preview }));
  }

  async function handleEnviar() {
    setEnviando(true);
    setErrorMsg(null);
    try {
      const { ok, error } = await crearSolicitud({
        nombre: form.nombre,
        contacto: form.contacto,
        direccion: form.direccion || undefined,
        categoria: form.categoria || "general",
        descripcion: form.descripcion || undefined,
        // foto_url: en producción, subir a Supabase Storage primero
      });
      if (!ok) throw new Error(error ?? "Error desconocido");
      setExito(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "No pudimos enviar la solicitud. Intente de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-3 mb-3 overflow-hidden rounded-md border-2 border-chicha-200 bg-white shadow-md animate-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 bg-chicha px-4 py-3 text-crema">
        <Store size={16} strokeWidth={1.8} className="shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-wider">
            Inscripción de Socio
          </p>
          <p className="text-[10px] text-crema/75">Piloto 2026 · Sin costo de entrada</p>
        </div>
        <button
          onClick={onCerrar}
          className="rounded-full p-1 transition-colors hover:bg-chicha-700"
          aria-label="Cerrar inscripción"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Contenido */}
      {exito ? (
        <Exito nombre={form.nombre} onCerrar={onCerrar} />
      ) : (
        <>
          <StepIndicator paso={paso} total={3} />

          {paso === 1 && (
            <Paso1
              form={form}
              onChange={handleChange}
              onSiguiente={() => setPaso(2)}
            />
          )}
          {paso === 2 && (
            <Paso2
              form={form}
              onChange={handleChange}
              onAnterior={() => setPaso(1)}
              onSiguiente={() => setPaso(3)}
            />
          )}
          {paso === 3 && (
            <Paso3
              form={form}
              onFotoChange={handleFoto}
              onAnterior={() => setPaso(2)}
              onEnviar={handleEnviar}
              enviando={enviando}
            />
          )}

          {errorMsg && (
            <div className="mx-4 mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
}
