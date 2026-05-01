import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Store,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Upload,
  Info,
  MapPin,
  Clock,
  Phone,
  Filter,
  Star,
  Sparkles,
  BarChart3,
  MessageCircle,
  Mail,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIAS, EVENTOS_CATEGORIAS } from "@/data/seed";
import { useCrearSolicitud } from "@/data/hooks/useCrearSolicitud";
import {
  solicitudSchema,
  flattenZodErrors,
} from "@/lib/solicitudSchema";
import { uploadImagen } from "@/lib/storage";
import { SEO } from "@/components/SEO";
import { track, Events } from "@/lib/analytics";

type Tab = "negocio" | "evento";

interface FormState {
  titulo: string;
  categoria: string;
  /** id de comuna en `comunas` (Supabase) — siempre obligatoria. */
  comuna: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  email: string;
  descripcion: string;
  contacto: string;
  /** sólo negocios — minutos típicos de visita. String para alimentar input. */
  tiempo_visita_min: string;
  /** sólo negocios — precio aprox por persona en CLP. String para input. */
  precio_clp_aprox: string;
  /** sólo negocios — hora de cierre tipo "20:00". Vacio = consultar. */
  abierto_hasta: string;
  /** sólo negocios — array de tag ids seleccionados (familia, vino, etc). */
  tags: string[];
  fecha: string;
  hora: string;
  /** Honeypot anti-spam: debe quedar vacío. */
  sitio_web: string;
}

const EMPTY_FORM: FormState = {
  titulo: "",
  categoria: "",
  comuna: "",
  direccion: "",
  telefono: "",
  whatsapp: "",
  email: "",
  descripcion: "",
  contacto: "",
  tiempo_visita_min: "",
  precio_clp_aprox: "",
  abierto_hasta: "",
  tags: [],
  fecha: "",
  hora: "",
  sitio_web: "",
};

/**
 * Comunas seed del corredor Ruta 68 (sincronizadas con
 * `supabase/migrations/0004_dato68.sql`). El select se renderiza desde acá
 * mientras no esté el endpoint público de `comunas` cargando dinámico.
 */
/** Tags disponibles — sincronizado con `tags` table de Supabase. El socio
 *  marca los que apliquen y el comercio queda en `comercio_tags` cuando
 *  el admin lo aprueba. */
const TAGS_DISPONIBLES = [
  { id: "ninos",        label: "Niños" },
  { id: "familia",      label: "Familia" },
  { id: "pareja",       label: "Pareja" },
  { id: "romantico",    label: "Romántico" },
  { id: "pet_friendly", label: "Pet friendly" },
  { id: "barato",       label: "Barato" },
  { id: "premium",      label: "Premium" },
  { id: "vino",         label: "Vino" },
  { id: "comida",       label: "Comida" },
  { id: "naturaleza",   label: "Naturaleza" },
  { id: "de_paso",      label: "De paso" },
  { id: "rapido",       label: "Rápido" },
  { id: "bano",         label: "Baño" },
  { id: "lluvia",       label: "Lluvia" },
  { id: "finde",        label: "Finde" },
];

const COMUNAS_OPCIONES = [
  { id: "pudahuel",    label: "Pudahuel" },
  { id: "curacavi",    label: "Curacaví" },
  { id: "maria_pinto", label: "María Pinto" },
  { id: "casablanca",  label: "Casablanca" },
  { id: "algarrobo",   label: "Algarrobo" },
  { id: "quintay",     label: "Quintay" },
  { id: "placilla",    label: "Placilla" },
  { id: "valparaiso",  label: "Valparaíso" },
];

export default function Socio() {
  const [params] = useSearchParams();
  const initialTab = params.get("tab") === "evento" ? "evento" : "negocio";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [done, setDone] = useState<{ id?: string; modo: "supabase" | "demo" } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imagen, setImagen] = useState<{ file: File; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const crear = useCrearSolicitud();

  useEffect(() => {
    setActiveTab(params.get("tab") === "evento" ? "evento" : "negocio");
  }, [params]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (fieldErrors[k as string]) {
      setFieldErrors((prev) => {
        const { [k as string]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const categoriasTab =
    activeTab === "negocio"
      ? CATEGORIAS.map((c) => ({ key: c.key, label: c.label }))
      : EVENTOS_CATEGORIAS.filter((c) => c.key !== "todos").map((c) => ({
          key: c.key,
          label: c.label,
        }));

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen supera los 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagen({ file, preview: String(reader.result) });
    reader.readAsDataURL(file);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Honeypot: si está lleno, fingimos éxito para no alertar al bot.
    if (form.sitio_web.trim()) {
      track(Events.PUBLICAR_ERROR, { motivo: "honeypot" });
      setDone({ modo: "demo" });
      setForm(EMPTY_FORM);
      return;
    }

    // tiempo_visita_min es opcional y sólo aplica a negocios.
    const tiempoNum =
      activeTab === "negocio" && form.tiempo_visita_min.trim()
        ? Number(form.tiempo_visita_min)
        : undefined;
    const precioNum =
      activeTab === "negocio" && form.precio_clp_aprox.trim()
        ? Number(form.precio_clp_aprox)
        : undefined;

    // Validación zod.
    const parsed = solicitudSchema.safeParse({
      tipo: activeTab,
      titulo: form.titulo,
      descripcion: form.descripcion || undefined,
      categoria: form.categoria,
      comuna: form.comuna,
      direccion: form.direccion,
      telefono: form.telefono,
      whatsapp: form.whatsapp || undefined,
      email: form.email || undefined,
      contacto: form.contacto || undefined,
      tiempo_visita_min: tiempoNum,
      sitio_web: form.sitio_web,
      ...(activeTab === "evento"
        ? { fecha: form.fecha, hora: form.hora }
        : {}),
    });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error));
      setError("Revisa los campos marcados en rojo.");
      return;
    }

    // Upload opcional de imagen.
    let imagen_url: string | undefined;
    if (imagen) {
      setUploading(true);
      const up = await uploadImagen(imagen.file);
      setUploading(false);
      if (!up.ok) {
        setError(up.error ?? "Error subiendo la imagen.");
        return;
      }
      imagen_url = up.url;
    }

    try {
      const data = parsed.data;
      const res = await crear.mutateAsync({
        tipo: activeTab,
        titulo: data.titulo,
        descripcion: data.descripcion || undefined,
        categoria: data.categoria,
        comuna: data.comuna,
        direccion: data.direccion,
        telefono: data.telefono,
        whatsapp: data.whatsapp || undefined,
        email: data.email || undefined,
        contacto: data.contacto || undefined,
        tiempo_visita_min:
          data.tipo === "negocio" ? data.tiempo_visita_min : undefined,
        precio_clp_aprox: activeTab === "negocio" ? precioNum : undefined,
        abierto_hasta:
          activeTab === "negocio" && form.abierto_hasta.trim()
            ? form.abierto_hasta.trim()
            : undefined,
        tags: activeTab === "negocio" && form.tags.length > 0 ? form.tags : undefined,
        fecha: data.tipo === "evento" ? data.fecha : undefined,
        hora: data.tipo === "evento" ? data.hora : undefined,
        imagen_url,
      });
      setDone({ id: res.id, modo: res.modo });
      setForm(EMPTY_FORM);
      setImagen(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tu solicitud.");
    }
  };

  const loading = crear.isPending || uploading;

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bosque-50 text-bosque-600">
          <CheckCircle2 size={64} strokeWidth={1.5} />
        </div>
        <h2 className="mt-8 font-mont text-3xl font-extrabold text-carbon">
          ¡Listo, vecino!
        </h2>
        <p className="mt-4 text-lg text-humo font-medium">
          Recibimos tu solicitud. El equipo de Dato 68 revisará la
          información y te escribirá por WhatsApp para publicarla.
        </p>
        {done.modo === "demo" && (
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-humo">
            Modo demo · no se guardó en base aún ({done.id})
          </p>
        )}
        <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => setDone(null)}
            className="btn-bosque px-10 py-4"
          >
            Publicar otro dato
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-bosque-600/10 bg-white px-10 py-4 font-bold text-carbon hover:bg-bosque-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ background: "var(--cream)" }}
      className="mx-auto max-w-5xl px-6 py-12 pb-32 md:pb-16 min-h-screen"
    >
      <SEO
        title="Publicar en Dato 68"
        description="Súmate a la guía vecinal del valle de Curacaví. Publica tu negocio o evento gratis; destaca con el plan Socio Pro."
        path="/publicar"
      />
      {/* ——— Header editorial ——— */}
      <header className="text-center">
        <span
          className="font-inter-tight inline-flex uppercase"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "var(--terracotta)",
            background: "transparent",
          }}
        >
          Piloto 2026 · Valle de Curacaví
        </span>
        <h1
          className="font-fraunces mt-4"
          style={{
            fontSize: "clamp(36px, 6vw, 48px)",
            fontWeight: 500,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            lineHeight: 1.05,
          }}
        >
          Súmate a la <em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>guía</em>
        </h1>
        <p
          className="font-inter-tight mx-auto mt-4 max-w-2xl"
          style={{
            fontSize: 16,
            color: "var(--muted)",
            lineHeight: 1.55,
          }}
        >
          Publica tu negocio o evento y llega a miles de vecinos. La base es
          gratuita; el plan Socio Pro te deja destacar.
        </p>
      </header>

      {/* ——— Tab Switcher ——— */}
      <div className="mt-10 flex justify-center">
        <div
          className="flex rounded-2xl p-1.5"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("negocio")}
            className="font-inter-tight flex items-center gap-2 rounded-xl px-8 py-3 transition-all"
            style={{
              background: activeTab === "negocio" ? "var(--valley)" : "transparent",
              color: activeTab === "negocio" ? "var(--cream)" : "var(--muted)",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <Store size={18} />
            Mi Negocio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("evento")}
            className="font-inter-tight flex items-center gap-2 rounded-xl px-8 py-3 transition-all"
            style={{
              background: activeTab === "evento" ? "var(--valley)" : "transparent",
              color: activeTab === "evento" ? "var(--cream)" : "var(--muted)",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <CalendarDays size={18} />
            Publicar Evento
          </button>
        </div>
      </div>

      {/* ——— Form Section ——— */}
      <div
        className="mt-10 overflow-hidden rounded-3xl"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--border-soft)",
        }}
      >
        <div className="p-8 md:p-12">
          <div
            className="mb-8 flex items-center gap-4 pb-5"
            style={{ borderBottom: "1px solid var(--border-soft)" }}
          >
            <div
              className="grid h-12 w-12 place-items-center rounded-xl"
              style={{ background: "var(--terracotta)", color: "var(--cream)" }}
            >
              {activeTab === "negocio" ? <Store size={22} /> : <CalendarDays size={22} />}
            </div>
            <div>
              <h2
                className="font-fraunces"
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "var(--ink)",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {activeTab === "negocio" ? "Datos del negocio" : "Datos del evento"}
              </h2>
              <p
                className="font-inter-tight"
                style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}
              >
                Completa la ficha para empezar el proceso
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Honeypot — los humanos no lo ven, los bots lo llenan. */}
            <div aria-hidden="true" className="absolute left-[-9999px] top-auto">
              <label htmlFor="sitio_web">Dejar vacío</label>
              <input
                id="sitio_web"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.sitio_web}
                onChange={(e) => update("sitio_web", e.target.value)}
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Field
                label={activeTab === "negocio" ? "Nombre del Negocio" : "Nombre del Evento"}
                icon={<Info size={16} />}
                error={fieldErrors.titulo}
              >
                <input
                  required
                  type="text"
                  placeholder={activeTab === "negocio" ? "Ej: Dulces Issa" : "Ej: Bingo Solidario"}
                  value={form.titulo}
                  onChange={(e) => update("titulo", e.target.value)}
                  className="form-input"
                  aria-invalid={!!fieldErrors.titulo}
                />
              </Field>
              <Field label="Categoría" icon={<Filter size={16} />} error={fieldErrors.categoria}>
                <select
                  required
                  value={form.categoria}
                  onChange={(e) => update("categoria", e.target.value)}
                  className="form-input appearance-none bg-white"
                  aria-invalid={!!fieldErrors.categoria}
                >
                  <option value="">Seleccionar categoría...</option>
                  {categoriasTab.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Field label="Comuna" icon={<MapPin size={16} />} error={fieldErrors.comuna}>
                <select
                  required
                  value={form.comuna}
                  onChange={(e) => update("comuna", e.target.value)}
                  className="form-input appearance-none bg-white"
                  aria-invalid={!!fieldErrors.comuna}
                >
                  <option value="">Seleccionar comuna...</option>
                  {COMUNAS_OPCIONES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ubicación / Dirección" icon={<MapPin size={16} />} error={fieldErrors.direccion}>
                <input
                  required
                  type="text"
                  placeholder="Ej: Ambrosio O'Higgins 123"
                  value={form.direccion}
                  onChange={(e) => update("direccion", e.target.value)}
                  className="form-input"
                  aria-invalid={!!fieldErrors.direccion}
                />
              </Field>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Field label="Teléfono de Contacto" icon={<Phone size={16} />} error={fieldErrors.telefono}>
                <input
                  required
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={form.telefono}
                  onChange={(e) => update("telefono", e.target.value)}
                  className="form-input"
                  aria-invalid={!!fieldErrors.telefono}
                />
              </Field>
              {activeTab === "negocio" ? (
                <Field
                  label="Tiempo de visita (min, opcional)"
                  icon={<Clock size={16} />}
                  error={fieldErrors.tiempo_visita_min}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={720}
                    step={5}
                    placeholder="Ej: 45"
                    value={form.tiempo_visita_min}
                    onChange={(e) => update("tiempo_visita_min", e.target.value)}
                    className="form-input"
                    aria-invalid={!!fieldErrors.tiempo_visita_min}
                  />
                </Field>
              ) : (
                <div /> /* placeholder en evento para mantener grid */
              )}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Field label="WhatsApp (opcional)" icon={<MessageCircle size={16} />} error={fieldErrors.whatsapp}>
                <input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  className="form-input"
                />
              </Field>
              <Field label="Email (opcional)" icon={<Mail size={16} />} error={fieldErrors.email}>
                <input
                  type="email"
                  placeholder="hola@minegocio.cl"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="form-input"
                />
              </Field>
            </div>

            {activeTab === "negocio" && (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field
                    label="Precio aprox por persona en CLP (opcional)"
                    icon={<Info size={16} />}
                    error={fieldErrors.precio_clp_aprox}
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={500}
                      placeholder="Ej: 12000"
                      value={form.precio_clp_aprox}
                      onChange={(e) => update("precio_clp_aprox", e.target.value)}
                      className="form-input"
                    />
                  </Field>
                  <Field
                    label="Hora de cierre (opcional, formato 24h)"
                    icon={<Clock size={16} />}
                    error={fieldErrors.abierto_hasta}
                  >
                    <input
                      type="text"
                      placeholder="Ej: 20:00 — vacío = consultar"
                      value={form.abierto_hasta}
                      onChange={(e) => update("abierto_hasta", e.target.value)}
                      className="form-input"
                    />
                  </Field>
                </div>

                <Field
                  label="¿Cómo describirías tu negocio? (elegí los que apliquen)"
                  icon={<Info size={16} />}
                  error={fieldErrors.tags}
                >
                  <div className="flex flex-wrap gap-2">
                    {TAGS_DISPONIBLES.map((t) => {
                      const on = form.tags.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            update(
                              "tags",
                              on ? form.tags.filter((x) => x !== t.id) : [...form.tags, t.id]
                            )
                          }
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
                </Field>
              </>
            )}

            {activeTab === "evento" && (
              <div className="grid gap-8 md:grid-cols-2">
                <Field label="Fecha del Evento" icon={<CalendarDays size={16} />} error={fieldErrors.fecha}>
                  <input
                    required
                    type="date"
                    value={form.fecha}
                    onChange={(e) => update("fecha", e.target.value)}
                    className="form-input"
                  />
                </Field>
                <Field label="Hora de Inicio" icon={<Clock size={16} />} error={fieldErrors.hora}>
                  <input
                    required
                    type="time"
                    value={form.hora}
                    onChange={(e) => update("hora", e.target.value)}
                    className="form-input"
                  />
                </Field>
              </div>
            )}

            <Field label="Descripción Corta" icon={<Info size={16} />} error={fieldErrors.descripcion}>
              <textarea
                rows={4}
                placeholder="Cuéntanos un poco más para que los vecinos se interesen..."
                value={form.descripcion}
                onChange={(e) => update("descripcion", e.target.value)}
                className="form-input py-4 min-h-[120px]"
              />
            </Field>

            <Field label="¿Quién publica? (opcional)" icon={<UserIcon size={16} />} error={fieldErrors.contacto}>
              <input
                type="text"
                placeholder="Tu nombre, para volver a contactarte"
                value={form.contacto}
                onChange={(e) => update("contacto", e.target.value)}
                className="form-input"
              />
            </Field>

            {/* Upload Section — real */}
            <label
              htmlFor="solicitud-imagen"
              className="block cursor-pointer rounded-3xl border-2 border-dashed border-bosque-600/10 bg-arena-50 p-6 transition-colors hover:border-bosque-600/30"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                {imagen ? (
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl shadow-tarjeta">
                    <img src={imagen.preview} alt="preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-bosque-600 shadow-tarjeta">
                    <Upload size={28} />
                  </div>
                )}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-mont text-lg font-bold text-carbon">
                    {imagen ? imagen.file.name : "Sube una foto representativa"}
                  </h3>
                  <p className="mt-1 text-sm text-humo font-medium">
                    {imagen
                      ? "Toca para cambiar. Máx. 5 MB · JPG, PNG, WEBP."
                      : "Formatos aceptados: JPG, PNG, WEBP. Máximo 5 MB."}
                  </p>
                </div>
              </div>
              <input
                id="solicitud-imagen"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                className="hidden"
              />
            </label>

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-sm font-medium text-humo">
                <Info size={18} className="text-bosque-600" />
                Toda publicación está sujeta a validación.
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto btn-bosque px-12 py-5 shadow-elevada flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? "Enviando..." : (
                  <>
                    Enviar Solicitud
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ——— Plan Socio Pro ——— */}
      <section className="mt-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-lg bg-bosque-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-bosque-700">
            <Sparkles size={14} />
            Plan Socio Pro
          </span>
          <h2 className="mt-4 font-mont text-3xl md:text-4xl font-extrabold text-carbon tracking-tight">
            Destaca entre los vecinos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-humo font-medium">
            Pertenecer a la guía es gratis. Si quieres aparecer primero, tener
            ficha destacada y sello de calidad, el plan Socio Pro es para ti.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <PlanCard
            titulo="Presencia"
            precio="Gratis"
            descripcion="Aparece en la guía con tu ficha básica y contacto. Validación comunitaria."
            features={["Ficha básica", "Contacto visible", "Búsqueda por categoría"]}
            cta="Publicar gratis"
            tone="light"
            onCta={() => track(Events.SOCIO_PRO_CTA, { plan: "presencia" })}
          />
          <PlanCard
            titulo="Socio Pro"
            precio="$9.900"
            periodo="/ mes"
            descripcion="Sello de calidad, posición destacada y apoyo del Concierge."
            features={[
              "Primero en su categoría",
              "Sello Socio Pro",
              "Fotos y destacados",
              "Soporte WhatsApp",
            ]}
            cta="Conversar con el equipo"
            tone="dark"
            destacado
            onCta={() => track(Events.SOCIO_PRO_CTA, { plan: "socio_pro" })}
          />
          <PlanCard
            titulo="Embajador"
            precio="A medida"
            descripcion="Para quienes organizan varios eventos o tienen múltiples locales."
            features={[
              "Gestor de ventas dedicado",
              "Pauta en home",
              "Campañas estacionales",
            ]}
            cta="Agendar reunión"
            tone="light"
            onCta={() => track(Events.SOCIO_PRO_CTA, { plan: "embajador" })}
          />
        </div>
      </section>

      {/* ——— Beneficios genéricos ——— */}
      <section className="mt-24 grid gap-12 md:grid-cols-3">
        <Beneficio
          Icon={Star}
          titulo="Visibilidad Real"
          texto="Llega a más de 5.000 vecinos que usan la guía cada mes."
        />
        <Beneficio
          Icon={CheckCircle2}
          titulo="Marca Oficial"
          texto="El sello de Dato 68 genera confianza instantánea."
        />
        <Beneficio
          Icon={BarChart3}
          titulo="Datos útiles"
          texto="Saber quién te busca, cuándo y desde dónde: métricas simples, sin jerga."
        />
      </section>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-bosque-700">
        <span className="text-bosque-600 opacity-50">{icon}</span>
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function PlanCard({
  titulo,
  precio,
  periodo,
  descripcion,
  features,
  cta,
  tone,
  destacado,
  onCta,
}: {
  titulo: string;
  precio: string;
  periodo?: string;
  descripcion: string;
  features: string[];
  cta: string;
  tone: "light" | "dark";
  destacado?: boolean;
  onCta?: () => void;
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={`relative flex flex-col rounded-[32px] p-8 shadow-tarjeta border transition-all ${
        isDark
          ? "bg-carbon text-white border-carbon"
          : "bg-white text-carbon border-bosque-600/5"
      } ${destacado ? "md:-translate-y-4 shadow-elevada" : ""}`}
    >
      {destacado && (
        <span className="absolute -top-3 left-8 rounded-full bg-bosque-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-cta">
          Recomendado
        </span>
      )}
      <h3 className="font-mont text-xl font-extrabold">{titulo}</h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mont text-4xl font-extrabold">{precio}</span>
        {periodo && (
          <span className={`text-sm font-medium ${isDark ? "text-white/60" : "text-humo"}`}>
            {periodo}
          </span>
        )}
      </div>
      <p className={`mt-4 text-sm font-medium leading-relaxed ${isDark ? "text-white/70" : "text-humo"}`}>
        {descripcion}
      </p>
      <ul className="mt-6 space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm font-medium">
            <CheckCircle2
              size={18}
              className={`mt-0.5 shrink-0 ${isDark ? "text-bosque-400" : "text-bosque-600"}`}
            />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onCta}
        className={`mt-8 rounded-2xl py-3.5 font-bold transition-all active:scale-95 ${
          isDark
            ? "bg-white text-carbon hover:bg-arena-50"
            : "bg-bosque-600 text-white shadow-cta hover:bg-bosque-700"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

function Beneficio({
  Icon,
  titulo,
  texto,
}: {
  Icon: LucideIcon;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-tarjeta text-bosque-600">
        <Icon size={32} />
      </div>
      <h4 className="font-mont text-xl font-bold text-carbon">{titulo}</h4>
      <p className="mt-3 text-humo font-medium">{texto}</p>
    </div>
  );
}
