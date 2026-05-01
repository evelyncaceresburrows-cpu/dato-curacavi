/**
 * lib/types.ts
 *
 * ⚠️ SHIM de compatibilidad. La fuente de verdad es `@/data/seed`.
 * Este archivo se mantiene únicamente porque el concierge legacy
 * (PicadasSkill, CategoryGrid, ComercioCard) aún consume esta API.
 *
 * TODO (Etapa 2): migrar esos componentes a `@/data/seed` y eliminar.
 */

import {
  UtensilsCrossed,
  Cookie,
  Wine,
  Briefcase,
  Siren,
  type LucideIcon,
} from "lucide-react";

import type { Categoria as CategoriaCanonica } from "@/data/seed";

// Taxonomía que usa el copiloto del 68. Antes era subset chico de Curacaví.
// Ampliada para cubrir corredor completo: panoramas (caletas, miradores)
// y cultura (museos, santuarios, ascensores Valpo).
export type CategoriaComercio =
  | "picadas"
  | "dulces"
  | "chicha"
  | "panoramas"
  | "cultura"
  | "tramites"
  | "emergencias";

/** Comercio en shape legacy (verificado / es_pro / descripcion_vecina). */
export interface Comercio {
  id: string;
  nombre: string;
  categoria: CategoriaComercio;
  descripcion_vecina: string;
  direccion: string;
  telefono?: string;
  verificado: boolean;
  es_pro: boolean;
}

export interface MembresiaPendiente {
  id?: string;
  nombre_comercio: string;
  contacto: string;
  plan?: "presencia" | "impulso" | "ruta68";
  mensaje?: string;
  status?: "pendiente" | "contactado" | "activo";
}

export interface CategoriaDef {
  key: CategoriaComercio;
  label: string;
  Icon: LucideIcon;
  subtitulo: string;
  descripcion: string;
  destacada?: boolean;
}

/**
 * Categorías del concierge legacy (5 pilares editoriales).
 * Para la taxonomía canónica completa (10 categorías) ver `@/data/seed`.
 */
export const CATEGORIAS: CategoriaDef[] = [
  {
    key: "picadas",
    label: "Picadas",
    Icon: UtensilsCrossed,
    subtitulo: "Comer rico y sin vuelta",
    descripcion:
      "Parrillas, cocinerías y almuerzos de cuchara. Lo mejor del valle a la mesa.",
    destacada: true,
  },
  {
    key: "dulces",
    label: "Dulces Issa & Tradición",
    Icon: Cookie,
    subtitulo: "Receta de abuela, sin secretos",
    descripcion:
      "Empolvados, alfajores y pan amasado. La dulzura típica del valle.",
  },
  {
    key: "chicha",
    label: "Chicherías",
    Icon: Wine,
    subtitulo: "Del lagar al copón",
    descripcion:
      "Chicha fresca y vino artesanal. Productores del Estadio Julio Riesco.",
  },
  {
    key: "tramites",
    label: "Trámites y Muni",
    Icon: Briefcase,
    subtitulo: "Lo útil, en un solo click",
    descripcion:
      "Farmacia comunal, convenio de gas, retiro de ramas y portales en línea.",
  },
  {
    key: "emergencias",
    label: "Emergencias",
    Icon: Siren,
    subtitulo: "Números que siempre salvan",
    descripcion:
      "Seguridad municipal, Bomberos, Carabineros y SAMU. Llamado al tiro.",
  },
];

export function contarPorCategoria(
  comercios: Comercio[]
): Record<CategoriaComercio, number> {
  const base: Record<CategoriaComercio, number> = {
    picadas: 0,
    dulces: 0,
    chicha: 0,
    panoramas: 0,
    cultura: 0,
    tramites: 0,
    emergencias: 0,
  };
  for (const c of comercios) base[c.categoria] += 1;
  return base;
}

/** Asegura compat en tiempo de compilación con la taxonomía canónica. */
export type _CheckSubset = CategoriaComercio extends CategoriaCanonica
  ? true
  : never;
