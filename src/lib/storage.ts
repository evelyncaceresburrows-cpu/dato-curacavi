import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * storage.ts — upload de imágenes a Supabase Storage.
 *
 * Bucket: "solicitudes" (crear en Supabase Dashboard con política de insert
 * pública y read-only para anon).
 *
 * Modo demo: si no hay Supabase, devuelve un dataURL local (para preview).
 */

const BUCKET = "solicitudes";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
  modo: "supabase" | "demo";
}

export async function uploadImagen(file: File): Promise<UploadResult> {
  if (!ACCEPT.includes(file.type)) {
    return { ok: false, error: "Formato no soportado (JPG, PNG o WEBP)", modo: "demo" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Máximo 5 MB por imagen", modo: "demo" };
  }

  if (!isSupabaseConfigured || !supabase) {
    // Demo: devolvemos un data URL para preview visual.
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    return { ok: true, url, modo: "demo" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) return { ok: false, error: error.message, modo: "supabase" };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { ok: true, url: pub.publicUrl, modo: "supabase" };
}
