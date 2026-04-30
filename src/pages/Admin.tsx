/**
 * Admin — panel privado para Evelyn (rol='admin') y futuros editores.
 *
 * Flow:
 *   1. /admin sin sesión → form magic-link.
 *   2. /admin con sesión pero rol != admin → mensaje "no autorizado".
 *   3. /admin con rol admin → layout con tabs:
 *        - Comercios: lista + crear + editar + subir foto + toggle publicado.
 *        - Eventos: lista + crear + editar.
 *        - Solicitudes: cola pendientes con aprobar/rechazar.
 *
 * Diseño: minimal, NO sobrediseñado. Tablas + forms simples.
 * RLS: las queries de escritura están bloqueadas si rol != 'admin' (ver migration 0007).
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Pencil,
  Upload,
  LogOut,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/data/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, EVENTOS_CATEGORIAS } from "@/data/seed";
import { SEO } from "@/components/SEO";
import { DatoMark } from "@/components/lovable/DatoMark";

type Tab = "comercios" | "eventos" | "solicitudes";

interface ComercioRow {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;
  subtitulo: string | null;
  imagen: string | null;
  publicado: boolean;
  rating: number | null;
  comuna_id: string | null;
}

interface EventoRow {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  fecha: string;
  hora: string | null;
  lugar: string | null;
  publicado: boolean;
}

interface SolicitudRow {
  id: string;
  tipo: "negocio" | "evento";
  titulo: string;
  categoria: string | null;
  comuna: string | null;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  contacto: string | null;
  descripcion: string | null;
  imagen_url: string | null;
  fecha: string | null;
  hora: string | null;
  tiempo_visita_min: number | null;
  estado: string;
  creado_en: string;
}

export default function Admin() {
  const auth = useAuth();
  const [tab, setTab] = useState<Tab>("comercios");

  if (auth.loading) {
    return (
      <Shell>
        <div className="text-center py-20" style={{ color: "var(--muted)" }}>
          Cargando…
        </div>
      </Shell>
    );
  }

  if (!auth.isAuth) {
    return <LoginScreen />;
  }

  if (!auth.isAdmin) {
    return (
      <Shell>
        <div className="mx-auto max-w-md text-center py-20">
          <h1 className="font-fraunces" style={{ fontSize: 32, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Sin acceso
          </h1>
          <p className="font-inter-tight mt-3" style={{ fontSize: 15, color: "var(--muted)" }}>
            Estás logueado como <strong>{auth.user?.email}</strong> pero tu cuenta no tiene rol admin.
          </p>
          <button
            type="button"
            onClick={auth.signOut}
            className="font-inter-tight mt-8 rounded-xl"
            style={{
              background: "var(--paper)",
              color: "var(--ink)",
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              border: "1px solid var(--border)",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <SEO
        title="Admin · Dato 68"
        description="Panel administrativo de Dato 68"
        path="/admin"
      />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-fraunces" style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Panel admin
          </h1>
          <p className="font-inter-tight" style={{ fontSize: 13, color: "var(--muted)" }}>
            Sesión: {auth.user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={auth.signOut}
          className="font-inter-tight inline-flex items-center gap-2 rounded-lg"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--border)",
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          <LogOut size={14} />
          Salir
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {(["comercios", "eventos", "solicitudes"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className="font-inter-tight rounded-lg capitalize"
            style={{
              background: tab === t ? "var(--valley)" : "transparent",
              color: tab === t ? "var(--cream)" : "var(--ink)",
              padding: "8px 14px",
              fontSize: 14,
              fontWeight: 600,
              border: tab === t ? "none" : "1px solid var(--border)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "comercios" && <ComerciosAdmin />}
      {tab === "eventos" && <EventosAdmin />}
      {tab === "solicitudes" && <SolicitudesAdmin />}
    </Shell>
  );
}

// ─── Layout y Login ─────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--cream)" }} className="min-h-screen">
      <header
        className="sticky top-0 z-40"
        style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="mx-auto flex items-center gap-3 px-6 py-3" style={{ maxWidth: 1200 }}>
          <Link to="/" className="flex items-center gap-2">
            <DatoMark size={28} />
            <span className="font-inter-tight" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
              ADMIN
            </span>
          </Link>
        </div>
      </header>
      <main className="mx-auto px-6 py-8" style={{ maxWidth: 1200 }}>
        {children}
      </main>
    </div>
  );
}

function LoginScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await auth.signInMagicLink(email.trim(), "/admin");
    setLoading(false);
    if (res.ok) setSent(true);
    else setError(res.error || "Error desconocido");
  }

  return (
    <Shell>
      <div className="mx-auto max-w-md py-12">
        <h1 className="font-fraunces text-center" style={{ fontSize: 32, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.025em" }}>
          Entrar al panel
        </h1>
        <p className="font-inter-tight mt-3 text-center" style={{ fontSize: 14, color: "var(--muted)" }}>
          Ingresá tu email. Te mandamos un link de un toque para entrar.
        </p>

        {sent ? (
          <div
            className="mt-8 rounded-2xl text-center"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--border-soft)",
              padding: "24px 20px",
            }}
          >
            <CheckCircle2 size={40} style={{ color: "var(--valley-mid)", margin: "0 auto" }} />
            <p className="font-fraunces mt-3" style={{ fontSize: 17, color: "var(--ink)", letterSpacing: "-0.015em" }}>
              Revisá tu mail
            </p>
            <p className="font-inter-tight mt-1" style={{ fontSize: 13, color: "var(--muted)" }}>
              Te llegó un link a <strong>{email}</strong>. Cliqueálo para entrar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="font-inter-tight rounded-xl"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--border)",
                padding: "14px 16px",
                fontSize: 15,
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="font-inter-tight rounded-xl"
              style={{
                background: "var(--valley)",
                color: "var(--cream)",
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Mandando…" : "Mandame el link"}
            </button>
            {error && (
              <p className="font-inter-tight" style={{ fontSize: 13, color: "var(--terracotta)" }}>
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </Shell>
  );
}

// ─── Tab: Comercios ─────────────────────────────────────────────────────────

function ComerciosAdmin() {
  const [rows, setRows] = useState<ComercioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ComercioRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("");

  async function reload() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("comercios")
      .select("id, slug, nombre, categoria, subtitulo, imagen, publicado, rating, comuna_id")
      .order("nombre");
    setRows((data as ComercioRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.categoria.toLowerCase().includes(q)
    );
  }, [rows, filter]);

  async function togglePublicado(row: ComercioRow) {
    if (!supabase) return;
    const { error } = await supabase
      .from("comercios")
      .update({ publicado: !row.publicado })
      .eq("id", row.id);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    reload();
  }

  async function eliminar(row: ComercioRow) {
    if (!supabase) return;
    if (!confirm(`Borrar "${row.nombre}" definitivamente?`)) return;
    const { error } = await supabase.from("comercios").delete().eq("id", row.id);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    reload();
  }

  if (loading) return <p className="font-inter-tight" style={{ color: "var(--muted)" }}>Cargando…</p>;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar nombre, slug, categoría…"
          className="font-inter-tight flex-1 rounded-lg"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--border)",
            padding: "10px 14px",
            fontSize: 14,
            outline: "none",
          }}
        />
        <span className="font-inter-tight" style={{ fontSize: 13, color: "var(--muted)" }}>
          {filtered.length} de {rows.length}
        </span>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="font-inter-tight inline-flex items-center justify-center gap-2 rounded-lg"
          style={{
            background: "var(--valley)",
            color: "var(--cream)",
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
          }}
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      <div
        className="overflow-x-auto rounded-xl"
        style={{ background: "var(--paper)", border: "1px solid var(--border-soft)" }}
      >
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--paper-dark)", textAlign: "left" }}>
              <th className="font-inter-tight uppercase p-3" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>Foto</th>
              <th className="font-inter-tight uppercase p-3" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>Nombre</th>
              <th className="font-inter-tight uppercase p-3" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>Categoría</th>
              <th className="font-inter-tight uppercase p-3" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>Estado</th>
              <th className="font-inter-tight uppercase p-3" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border-soft)" }}>
                <td className="p-3">
                  {r.imagen?.startsWith("http") || r.imagen?.startsWith("/") ? (
                    <img src={r.imagen} alt="" loading="lazy" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: r.imagen ?? "var(--paper-dark)" }} />
                  )}
                </td>
                <td className="p-3 font-inter-tight" style={{ color: "var(--ink)" }}>
                  <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.slug}</div>
                </td>
                <td className="p-3 font-inter-tight" style={{ color: "var(--ink)" }}>{r.categoria}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => togglePublicado(r)}
                    className="font-inter-tight inline-flex items-center gap-1 rounded-full"
                    style={{
                      background: r.publicado ? "rgba(63,123,71,0.15)" : "rgba(31,26,20,0.08)",
                      color: r.publicado ? "var(--valley-mid)" : "var(--muted)",
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      border: "none",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {r.publicado ? <Eye size={11} /> : <EyeOff size={11} />}
                    {r.publicado ? "Publicado" : "Oculto"}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(r)}
                      aria-label="Editar"
                      className="rounded-lg p-2"
                      style={{ background: "var(--cream)", border: "1px solid var(--border-soft)", color: "var(--ink)" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminar(r)}
                      aria-label="Borrar"
                      className="rounded-lg p-2"
                      style={{ background: "var(--cream)", border: "1px solid var(--border-soft)", color: "var(--terracotta)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <ComercioEditor
          row={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function ComercioEditor({
  row,
  onClose,
  onSaved,
}: {
  row: ComercioRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !row;
  const [form, setForm] = useState({
    slug: row?.slug ?? "",
    nombre: row?.nombre ?? "",
    categoria: row?.categoria ?? "picadas",
    subtitulo: row?.subtitulo ?? "",
    imagen: row?.imagen ?? "",
    rating: row?.rating?.toString() ?? "",
    comuna_id: row?.comuna_id ?? "curacavi",
    publicado: row?.publicado ?? true,
  });
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [imagenesExtra, setImagenesExtra] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carga campos extras al editar
  useEffect(() => {
    if (!row || !supabase) return;
    supabase
      .from("comercios")
      .select("descripcion, direccion, telefono, whatsapp, imagenes_extra")
      .eq("id", row.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDescripcion(data.descripcion ?? "");
          setDireccion(data.direccion ?? "");
          setTelefono(data.telefono ?? "");
          setWhatsapp(data.whatsapp ?? "");
          setImagenesExtra(data.imagenes_extra ?? []);
        }
      });
  }, [row]);

  async function handleUploadExtras(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !supabase) return;
    const cupo = 6 - imagenesExtra.length;
    if (cupo <= 0) {
      setError("Galería llena (máx 6 fotos extras). Borrá alguna primero.");
      return;
    }
    const seleccionadas = files.slice(0, cupo);
    setUploadingExtra(true);
    setError(null);
    const subidas: string[] = [];
    for (const file of seleccionadas) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" supera 5 MB. Saltada.`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const baseSlug = form.slug || `tmp-${Date.now()}`;
      const path = `${baseSlug}-extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("comercios")
        .upload(path, file, { upsert: false });
      if (upErr) {
        setError(`Error subiendo "${file.name}": ${upErr.message}`);
        continue;
      }
      const { data } = supabase.storage.from("comercios").getPublicUrl(path);
      subidas.push(data.publicUrl);
    }
    setImagenesExtra((prev) => [...prev, ...subidas].slice(0, 6));
    setUploadingExtra(false);
  }

  function removeExtra(idx: number) {
    setImagenesExtra((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen supera los 5 MB.");
      return;
    }
    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${form.slug || "tmp-" + Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("comercios")
      .upload(path, file, { upsert: true });
    if (upErr) {
      setError("Error subiendo: " + upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("comercios").getPublicUrl(path);
    setForm((f) => ({ ...f, imagen: data.publicUrl }));
    setUploading(false);
  }

  async function handleSave() {
    if (!supabase) return;
    setSaving(true);
    setError(null);
    const payload = {
      slug: form.slug.trim(),
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      subtitulo: form.subtitulo.trim() || null,
      descripcion: descripcion.trim() || null,
      direccion: direccion.trim() || null,
      telefono: telefono.trim() || null,
      whatsapp: whatsapp.trim() || null,
      imagen: form.imagen.trim() || null,
      imagenes_extra: imagenesExtra,
      rating: form.rating ? Number(form.rating) : null,
      comuna_id: form.comuna_id,
      publicado: form.publicado,
      eje_ruta_km: 43.0,
      estado: "verificado",
    };
    const { error: dbErr } = isNew
      ? await supabase.from("comercios").insert(payload)
      : await supabase.from("comercios").update(payload).eq("id", row!.id);
    setSaving(false);
    if (dbErr) {
      setError("Error: " + dbErr.message);
      return;
    }
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      style={{ background: "rgba(31,26,20,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-y-auto rounded-t-3xl md:rounded-3xl"
        style={{
          background: "var(--cream)",
          padding: "24px",
          maxHeight: "92vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-fraunces" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            {isNew ? "Nuevo comercio" : `Editar: ${row!.nombre}`}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink)" }}>
            <XCircle size={22} />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Slug (kebab-case, único)" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} required />
          <Field label="Nombre" value={form.nombre} onChange={(v) => setForm((f) => ({ ...f, nombre: v }))} required />
          <FieldSelect
            label="Categoría"
            value={form.categoria}
            onChange={(v) => setForm((f) => ({ ...f, categoria: v }))}
            options={CATEGORIAS.map((c) => ({ value: c.key, label: c.label }))}
          />
          <FieldSelect
            label="Comuna"
            value={form.comuna_id}
            onChange={(v) => setForm((f) => ({ ...f, comuna_id: v }))}
            options={[
              { value: "curacavi", label: "Curacaví" },
              { value: "casablanca", label: "Casablanca" },
              { value: "algarrobo", label: "Algarrobo" },
              { value: "valparaiso", label: "Valparaíso" },
              { value: "pudahuel", label: "Pudahuel" },
              { value: "maria_pinto", label: "María Pinto" },
              { value: "quintay", label: "Quintay" },
              { value: "placilla", label: "Placilla" },
            ]}
          />
          <Field label="Subtítulo (1 línea)" value={form.subtitulo} onChange={(v) => setForm((f) => ({ ...f, subtitulo: v }))} />
          <Field label="Rating (0–5)" value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} type="number" />
          <Field label="Dirección" value={direccion} onChange={setDireccion} />
          <Field label="Teléfono" value={telefono} onChange={setTelefono} />
          <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
        </div>

        <div className="mt-3">
          <label className="font-inter-tight uppercase block mb-1" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            className="font-inter-tight w-full rounded-lg"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--border)",
              padding: "10px 14px",
              fontSize: 14,
              color: "var(--ink)",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        <div className="mt-3">
          <label className="font-inter-tight uppercase block mb-1" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>
            Imagen
          </label>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              value={form.imagen}
              onChange={(e) => setForm((f) => ({ ...f, imagen: e.target.value }))}
              placeholder="https://… o subir archivo →"
              className="font-inter-tight flex-1 rounded-lg"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--border)",
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <label
              className="font-inter-tight inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--border)",
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
              }}
            >
              <Upload size={14} />
              {uploading ? "Subiendo…" : "Subir foto"}
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} disabled={uploading} />
            </label>
          </div>
          {form.imagen?.startsWith("http") && (
            <img src={form.imagen} alt="" className="mt-3 rounded-lg" style={{ maxHeight: 200, objectFit: "cover" }} />
          )}
        </div>

        {/* ─── Galería extra (hasta 6 fotos) ─────────────────────── */}
        <div className="mt-4">
          <label className="font-inter-tight uppercase block mb-1" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>
            Galería ({imagenesExtra.length}/6)
          </label>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {imagenesExtra.map((url, idx) => (
              <div key={url + idx} className="relative">
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  className="rounded-lg"
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => removeExtra(idx)}
                  aria-label="Quitar de la galería"
                  className="absolute"
                  style={{
                    top: 4,
                    right: 4,
                    background: "rgba(31,26,20,0.7)",
                    color: "var(--cream)",
                    border: "none",
                    borderRadius: 999,
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {imagenesExtra.length < 6 && (
              <label
                className="font-inter-tight flex cursor-pointer flex-col items-center justify-center rounded-lg text-center"
                style={{
                  background: "var(--paper)",
                  border: "1.5px dashed var(--border)",
                  aspectRatio: "1",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  padding: 8,
                }}
              >
                {uploadingExtra ? (
                  "Subiendo…"
                ) : (
                  <>
                    <Upload size={18} />
                    <span className="mt-1">Sumar fotos</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadExtras}
                  style={{ display: "none" }}
                  disabled={uploadingExtra}
                />
              </label>
            )}
          </div>
          <p className="font-inter-tight mt-2" style={{ fontSize: 11, color: "var(--muted)" }}>
            Hasta 6 fotos extras (opcional). Se muestran en la ficha pública del comercio.
          </p>
        </div>

        <label className="mt-4 inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.publicado}
            onChange={(e) => setForm((f) => ({ ...f, publicado: e.target.checked }))}
            style={{ accentColor: "var(--valley)" }}
          />
          <span className="font-inter-tight" style={{ fontSize: 14, color: "var(--ink)" }}>
            Publicado (visible en el sitio)
          </span>
        </label>

        {error && (
          <p className="font-inter-tight mt-3" style={{ fontSize: 13, color: "var(--terracotta)" }}>
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-inter-tight rounded-lg"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.slug || !form.nombre}
            className="font-inter-tight rounded-lg"
            style={{
              background: "var(--valley)",
              color: "var(--cream)",
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              opacity: saving || !form.slug || !form.nombre ? 0.6 : 1,
            }}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Eventos ───────────────────────────────────────────────────────────

function EventosAdmin() {
  const [rows, setRows] = useState<EventoRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("eventos")
      .select("id, slug, titulo, categoria, fecha, hora, lugar, publicado")
      .order("fecha", { ascending: true });
    setRows((data as EventoRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function togglePublicado(row: EventoRow) {
    if (!supabase) return;
    await supabase.from("eventos").update({ publicado: !row.publicado }).eq("id", row.id);
    reload();
  }

  async function eliminar(row: EventoRow) {
    if (!supabase) return;
    if (!confirm(`Borrar "${row.titulo}"?`)) return;
    await supabase.from("eventos").delete().eq("id", row.id);
    reload();
  }

  if (loading) return <p className="font-inter-tight" style={{ color: "var(--muted)" }}>Cargando…</p>;

  return (
    <div>
      <p className="font-inter-tight mb-4" style={{ fontSize: 13, color: "var(--muted)" }}>
        {rows.length} eventos. Para crear o editar campos avanzados de eventos, usar Supabase Studio (Table Editor → eventos).
      </p>
      <div className="overflow-x-auto rounded-xl" style={{ background: "var(--paper)", border: "1px solid var(--border-soft)" }}>
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--paper-dark)", textAlign: "left" }}>
              <th className="p-3 font-inter-tight uppercase" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Título</th>
              <th className="p-3 font-inter-tight uppercase" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Categoría</th>
              <th className="p-3 font-inter-tight uppercase" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Fecha</th>
              <th className="p-3 font-inter-tight uppercase" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Estado</th>
              <th className="p-3 font-inter-tight uppercase" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border-soft)" }}>
                <td className="p-3 font-inter-tight" style={{ color: "var(--ink)" }}>
                  <div style={{ fontWeight: 600 }}>{r.titulo}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.lugar} {r.hora && `· ${r.hora.slice(0, 5)}`}</div>
                </td>
                <td className="p-3 font-inter-tight" style={{ color: "var(--ink)" }}>{r.categoria}</td>
                <td className="p-3 font-inter-tight tabular" style={{ color: "var(--ink)" }}>{r.fecha}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => togglePublicado(r)}
                    className="font-inter-tight inline-flex items-center gap-1 rounded-full"
                    style={{
                      background: r.publicado ? "rgba(63,123,71,0.15)" : "rgba(31,26,20,0.08)",
                      color: r.publicado ? "var(--valley-mid)" : "var(--muted)",
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      border: "none",
                    }}
                  >
                    {r.publicado ? "Publicado" : "Oculto"}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => eliminar(r)}
                    aria-label="Borrar"
                    className="rounded-lg p-2"
                    style={{ background: "var(--cream)", border: "1px solid var(--border-soft)", color: "var(--terracotta)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Solicitudes ────────────────────────────────────────────────────────

function SolicitudesAdmin() {
  const [rows, setRows] = useState<SolicitudRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("solicitudes")
      .select("*")
      .eq("estado", "pendiente")
      .order("creado_en", { ascending: false });
    setRows((data as SolicitudRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function aprobar(s: SolicitudRow) {
    if (!supabase) return;
    if (!confirm(`Aprobar "${s.titulo}" y mover a ${s.tipo === "negocio" ? "comercios" : "eventos"}?`)) return;

    if (s.tipo === "negocio") {
      const slug = (s.titulo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const { error: insErr } = await supabase.from("comercios").insert({
        slug,
        nombre: s.titulo,
        categoria: s.categoria,
        subtitulo: s.descripcion?.slice(0, 100) ?? null,
        descripcion: s.descripcion,
        direccion: s.direccion,
        telefono: s.telefono,
        whatsapp: s.whatsapp,
        email: s.email,
        imagen: s.imagen_url,
        comuna_id: s.comuna ?? "curacavi",
        eje_ruta_km: 43.0,
        tiempo_visita_min: s.tiempo_visita_min,
        publicado: true,
        estado: "verificado",
      });
      if (insErr) {
        alert("Error: " + insErr.message);
        return;
      }
    } else {
      const slug = (s.titulo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const { error: insErr } = await supabase.from("eventos").insert({
        slug,
        titulo: s.titulo,
        descripcion: s.descripcion,
        fecha: s.fecha,
        hora: s.hora,
        lugar: s.direccion,
        categoria: s.categoria,
        imagen: s.imagen_url,
        comuna_id: s.comuna ?? "curacavi",
        eje_ruta_km: 43.0,
        publicado: true,
        estado: "verificado",
        gratis: false,
      });
      if (insErr) {
        alert("Error: " + insErr.message);
        return;
      }
    }
    await supabase.from("solicitudes").update({ estado: "aprobada", resuelta_en: new Date().toISOString() }).eq("id", s.id);
    reload();
  }

  async function rechazar(s: SolicitudRow) {
    if (!supabase) return;
    if (!confirm(`Rechazar "${s.titulo}"?`)) return;
    await supabase
      .from("solicitudes")
      .update({ estado: "rechazada", resuelta_en: new Date().toISOString() })
      .eq("id", s.id);
    reload();
  }

  if (loading) return <p className="font-inter-tight" style={{ color: "var(--muted)" }}>Cargando…</p>;

  if (rows.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={40} style={{ color: "var(--valley-mid)", margin: "0 auto" }} />
        <p className="font-fraunces mt-3" style={{ fontSize: 17, color: "var(--ink)" }}>
          Sin pendientes
        </p>
        <p className="font-inter-tight mt-1" style={{ fontSize: 13, color: "var(--muted)" }}>
          Cuando alguien envíe el form de Publicar aparece acá.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {rows.map((s) => (
        <div
          key={s.id}
          className="rounded-2xl"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--border-soft)",
            padding: 18,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="font-inter-tight uppercase rounded-full"
                style={{
                  background: s.tipo === "negocio" ? "rgba(31,74,45,0.15)" : "rgba(200,98,58,0.15)",
                  color: s.tipo === "negocio" ? "var(--valley)" : "var(--terracotta)",
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                {s.tipo}
              </span>
              <h3 className="font-fraunces mt-2" style={{ fontSize: 19, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.015em" }}>
                {s.titulo}
              </h3>
              <p className="font-inter-tight mt-1" style={{ fontSize: 12, color: "var(--muted)" }}>
                {s.contacto && `${s.contacto} · `}
                {s.telefono} {s.email && `· ${s.email}`}
              </p>
            </div>
            {s.imagen_url && (
              <img src={s.imagen_url} alt="" loading="lazy" style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover" }} />
            )}
          </div>

          <p className="font-inter-tight mt-3" style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            {s.descripcion}
          </p>
          <p className="font-inter-tight mt-2" style={{ fontSize: 12, color: "var(--muted)" }}>
            <strong>Categoría:</strong> {s.categoria}
            {s.comuna && ` · Comuna: ${s.comuna}`}
            {s.direccion && ` · ${s.direccion}`}
            {s.tipo === "evento" && s.fecha && ` · ${s.fecha}`}
            {s.tipo === "negocio" && s.tiempo_visita_min && ` · ${s.tiempo_visita_min} min visita`}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => aprobar(s)}
              className="font-inter-tight inline-flex items-center gap-1.5 rounded-lg"
              style={{
                background: "var(--valley)",
                color: "var(--cream)",
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
              }}
            >
              <ArrowRight size={14} />
              Aprobar y mover a {s.tipo === "negocio" ? "comercios" : "eventos"}
            </button>
            <button
              type="button"
              onClick={() => rechazar(s)}
              className="font-inter-tight inline-flex items-center gap-1.5 rounded-lg"
              style={{
                background: "transparent",
                color: "var(--terracotta)",
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                border: "1px solid var(--border)",
              }}
            >
              <XCircle size={14} />
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="font-inter-tight uppercase block mb-1" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>
        {label}
        {required && <span style={{ color: "var(--terracotta)" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="font-inter-tight w-full rounded-lg"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--border)",
          padding: "10px 14px",
          fontSize: 14,
          color: "var(--ink)",
          outline: "none",
        }}
      />
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="font-inter-tight uppercase block mb-1" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-inter-tight w-full rounded-lg"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--border)",
          padding: "10px 14px",
          fontSize: 14,
          color: "var(--ink)",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
