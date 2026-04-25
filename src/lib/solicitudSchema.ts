import { z } from "zod";

/**
 * Schemas zod para solicitudes (negocio / evento).
 *
 * Validación cliente-first: el mismo schema se usa para mostrar errores
 * inline y para validar antes de enviar. El servidor también valida vía
 * RLS + función de rate-limit (ver `supabase/migrations/0003_security.sql`).
 */

const telefonoCL = z
  .string()
  .trim()
  .regex(
    /^(\+?56\s?)?(\(?\d{1,3}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}$/,
    "Teléfono inválido (ej: +56 9 1234 5678)"
  )
  .or(z.literal(""));

const urlOrEmpty = z.string().url("URL inválida").or(z.literal(""));

export const solicitudBaseSchema = z.object({
  tipo: z.enum(["negocio", "evento"]),
  titulo: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(120, "Máximo 120 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(1000, "Máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  categoria: z.string().min(1, "Elige una categoría").max(60),
  /** Comuna del corredor Ruta 68. ID = `comunas.id` en Supabase. */
  comuna: z.string().min(1, "Elige tu comuna").max(60),
  direccion: z.string().trim().min(3, "Indica la dirección").max(200),
  telefono: telefonoCL,
  whatsapp: telefonoCL.optional(),
  email: z.string().email("Email inválido").or(z.literal("")).optional(),
  contacto: z.string().trim().max(120).optional().or(z.literal("")),
  imagen_url: urlOrEmpty.optional(),
  /** Tiempo estimado de visita. Solo aplica para negocios; opcional siempre. */
  tiempo_visita_min: z
    .number({ message: "Debe ser un número" })
    .int("Sin decimales")
    .min(5, "Mínimo 5 minutos")
    .max(720, "Máximo 12 horas")
    .optional(),
  // Honeypot: debe venir vacío. Si trae texto, es bot.
  sitio_web: z
    .string()
    .max(0, "bot_detected")
    .optional()
    .or(z.literal(""))
    .default(""),
});

export const solicitudNegocioSchema = solicitudBaseSchema.extend({
  tipo: z.literal("negocio"),
});

export const solicitudEventoSchema = solicitudBaseSchema.extend({
  tipo: z.literal("evento"),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .refine((d) => {
      const date = new Date(d + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date.getTime() >= today.getTime();
    }, "La fecha debe ser hoy o futura"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
});

export const solicitudSchema = z.discriminatedUnion("tipo", [
  solicitudNegocioSchema,
  solicitudEventoSchema,
]);

export type SolicitudInput = z.infer<typeof solicitudSchema>;

/** Convierte los errores de zod en un Record<campo, mensaje> para el UI. */
export function flattenZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".");
    if (!out[path]) out[path] = issue.message;
  }
  return out;
}
