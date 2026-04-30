/**
 * cn — combina classNames condicionales y resuelve conflictos de Tailwind.
 * Utilidad estándar para componentes Lovable / shadcn-style.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
