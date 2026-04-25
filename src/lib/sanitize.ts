/**
 * sanitize.ts — saneamiento ligero para texto generado por usuarios.
 *
 * Para HTML arbitrario usa DOMPurify. Este módulo es para contenido plano
 * (nombres, descripciones, direcciones) que se renderiza como texto React —
 * donde React ya escapa por default. Aquí solo hacemos limpieza visual:
 * trim, colapso de whitespace, corte de largo, remoción de control chars.
 */

const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;

/** Limpia texto plano: trim, colapsa espacios, elimina caracteres de control. */
export function clean(input: string | null | undefined, maxLen = 500): string {
  if (!input) return "";
  return input
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

/** Valida que una URL sea http/https y no `javascript:` ni `data:`. */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url, "https://datocuracavi.cl");
    if (u.protocol !== "http:" && u.protocol !== "https:" && u.protocol !== "mailto:" && u.protocol !== "tel:") {
      return undefined;
    }
    return u.toString();
  } catch {
    return undefined;
  }
}

/** Sanitiza número de teléfono para usar en `tel:` — solo dígitos, `+` y `*`. */
export function safeTel(tel: string | null | undefined): string | undefined {
  if (!tel) return undefined;
  const digits = tel.replace(/[^\d+*]/g, "");
  return digits.length >= 8 ? digits : undefined;
}

/** Sanitiza WhatsApp: deja solo dígitos, quita el `+` para `wa.me`. */
export function safeWhatsApp(wa: string | null | undefined): string | undefined {
  if (!wa) return undefined;
  const digits = wa.replace(/[^\d]/g, "");
  return digits.length >= 10 ? digits : undefined;
}
