/**
 * solicitudesApi.ts
 * Capa de datos para la tabla `solicitudes` de Supabase.
 *
 * Ver esquema canónico en `supabase/migrations/0001_init.sql`.
 * RLS: insert público habilitado (`solicitudes_insert_any` en 0002_rls.sql).
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type TipoSolicitud = "negocio" | "evento";

export interface SolicitudPayload {
  tipo: TipoSolicitud;
  titulo: string;
  descripcion?: string;
  categoria?: string;
  /** Comuna del corredor Ruta 68 (FK a `comunas.id`). */
  comuna?: string;
  direccion?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  fecha?: string; // sólo eventos · YYYY-MM-DD
  hora?: string;  // sólo eventos · HH:mm
  imagen_url?: string;
  contacto?: string; // nombre del vecino que publica
  /** Sólo negocios: minutos estimados de visita típica. */
  tiempo_visita_min?: number;
}

export interface SolicitudResult {
  ok: boolean;
  id?: string;
  error?: string;
  modo: "supabase" | "demo";
}

export async function crearSolicitud(
  payload: SolicitudPayload
): Promise<SolicitudResult> {
  if (!isSupabaseConfigured || !supabase) {
    console.info("[Dato Curacaví] (demo) nueva solicitud:", payload);
    await new Promise((r) => setTimeout(r, 800));
    return { ok: true, id: `demo-${Date.now()}`, modo: "demo" };
  }

  const { data, error } = await supabase
    .from("solicitudes")
    .insert({ ...payload, estado: "pendiente" })
    .select("id")
    .single();

  if (error) {
    console.error("[Dato Curacaví] error creando solicitud:", error);
    return { ok: false, error: error.message, modo: "supabase" };
  }

  return { ok: true, id: data?.id, modo: "supabase" };
}

// ─── Legacy compat (socio/membresías pendientes) ────────────────────────────
// Código antiguo (pre-Etapa 3) llamaba crearSolicitud({ nombre, contacto, ... }).
// Este wrapper traduce esa forma al nuevo esquema de `solicitudes`.

export interface SolicitudSocioLegacy {
  nombre: string;
  contacto: string;
  direccion?: string;
  categoria: string;
  descripcion?: string;
  foto_url?: string;
}

export async function crearSolicitudLegacy(
  p: SolicitudSocioLegacy
): Promise<SolicitudResult> {
  return crearSolicitud({
    tipo: "negocio",
    titulo: p.nombre,
    descripcion: p.descripcion,
    categoria: p.categoria,
    direccion: p.direccion,
    contacto: p.contacto,
    imagen_url: p.foto_url,
  });
}
