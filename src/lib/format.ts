/**
 * format.ts — helpers de fechas en español usados por componentes Lovable.
 *
 * Solo se usan para presentación visual (DateStamp, headers de Agenda).
 * Cualquier cambio aquí afecta el formato visible al vecino.
 */

const meses = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

const diasSemana = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
] as const;

const diasCortos = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] as const;

/** "viernes 25 de abril" */
export function fechaLarga(d: Date = new Date()): string {
  return `${diasSemana[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`;
}

/** "abril 2026" */
export function mesActual(d: Date = new Date()): string {
  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}

/** "vie" */
export function diaCorto(d: Date): string {
  return diasCortos[d.getDay()];
}

/** "abr" */
export function mesCorto(d: Date): string {
  return meses[d.getMonth()].slice(0, 3);
}

/** Acepta "YYYY-MM-DD" sin sorpresas de timezone (parse local). */
export function parseFecha(iso: string): Date {
  const [y, m, dd] = iso.split("-").map(Number);
  return new Date(y, m - 1, dd);
}
