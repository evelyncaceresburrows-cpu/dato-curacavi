import { supabase, isSupabaseConfigured } from "./supabase";
import { COMERCIOS_SEMILLA } from "@/data/seed";
import type { Comercio, MembresiaPendiente } from "./types";

/**
 * Capa de datos.
 * Si Supabase está configurado, hablamos con la base.
 * Si no, devolvemos la semilla canónica (`@/data/seed`) — útil para el
 * demo sin red y para que los vecinos vean algo siempre.
 */

export async function listarComercios(): Promise<Comercio[]> {
  if (!isSupabaseConfigured || !supabase) {
    return COMERCIOS_SEMILLA;
  }
  const { data, error } = await supabase
    .from("comercios")
    .select("*")
    .order("es_pro", { ascending: false })
    .order("verificado", { ascending: false });
  if (error) {
    console.error("[Dato Curacaví] error consultando comercios:", error);
    return COMERCIOS_SEMILLA;
  }
  return (data ?? []) as Comercio[];
}

export async function crearMembresiaPendiente(
  payload: MembresiaPendiente
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // En modo demo, solo logueamos.
    console.info("[Dato Curacaví] (demo) nueva membresía pendiente:", payload);
    return { ok: true };
  }
  const { error } = await supabase.from("membresias_pendientes").insert({
    ...payload,
    status: payload.status ?? "pendiente",
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
