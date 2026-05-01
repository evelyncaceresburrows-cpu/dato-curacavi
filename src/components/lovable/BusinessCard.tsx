/**
 * BusinessCard — card editorial de comercio (variante list o grid).
 * Portado de Lovable y adaptado a nuestro tipo `Comercio` de @/data/seed.
 *
 * - `variant="list"` → card horizontal (foto a la izquierda, info a la derecha).
 * - `variant="grid"` → card vertical (foto arriba aspect 4/5, info abajo).
 *
 * `Comercio.imagen` puede ser una URL https o un gradiente CSS. Si es gradiente,
 * lo usamos como background del placeholder; si es URL la pintamos en <img>.
 */
import { Star, MapPin } from "lucide-react";
import type { Comercio, Categoria } from "@/data/seed";
import { OpenBadge } from "./OpenBadge";

interface Props {
  comercio: Comercio;
  onClick?: () => void;
  variant?: "list" | "grid";
}

const ETIQUETA_CATEGORIA: Record<Categoria, string> = {
  picadas: "Picada",
  dulces: "Dulces",
  chicha: "Vino y chicha",
  panoramas: "Panorama",
  servicios: "Servicios",
  tramites: "Trámites",
  emprendimientos: "Emprendimiento",
  alojamientos: "Alojamiento",
  cultura: "Cultura",
  emergencias: "Emergencia",
};

function isUrl(s?: string): boolean {
  return !!s && (s.startsWith("http") || s.startsWith("/"));
}

function Foto({ comercio, className }: { comercio: Comercio; className?: string }) {
  const url = isUrl(comercio.imagen) ? comercio.imagen : undefined;
  if (url) {
    return (
      <img
        src={url}
        alt={comercio.nombre}
        loading="lazy"
        className={`${className ?? ""} object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.04]`}
      />
    );
  }
  // Fallback: gradiente o color placeholder.
  return (
    <div
      className={`${className ?? ""} flex items-center justify-center text-[28px] font-semibold uppercase`}
      style={{
        background: comercio.imagen ?? "var(--paper)",
        color: "var(--cream)",
      }}
      aria-hidden="true"
    >
      {comercio.nombre.slice(0, 1)}
    </div>
  );
}

export function BusinessCard({ comercio, onClick, variant = "list" }: Props) {
  const label = ETIQUETA_CATEGORIA[comercio.categoria] ?? comercio.categoria;
  const estadoBadge: "abierto" | "siempre" | "desconocido" =
    comercio.categoria === "emergencias"
      ? "siempre"
      : comercio.abiertoHasta
      ? "abierto"
      : "desconocido";

  if (variant === "grid") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group lift flex flex-col overflow-hidden rounded-[20px] border border-border bg-card text-left"
        style={{
          boxShadow:
            "0 1px 0 0 oklch(1 0 0 / 0.6) inset, 0 12px 28px -18px oklch(0.22 0.018 65 / 0.22)",
        }}
      >
        <div className="photo-editorial relative aspect-[4/5] w-full overflow-hidden bg-muted">
          <Foto comercio={comercio} className="h-full w-full" />
          <span
            className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] backdrop-blur-md"
            style={{
              backgroundColor: "color-mix(in oklab, var(--cream) 82%, transparent)",
              color: "var(--ink)",
              border: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)",
            }}
          >
            {label}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <h3
            className="font-fraunces text-[17px] font-semibold leading-[1.15] text-foreground line-clamp-2"
            style={{ letterSpacing: "-0.018em" }}
          >
            {comercio.nombre}
          </h3>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <OpenBadge estado={estadoBadge} />
            <span className="tabular inline-flex items-center gap-1 text-[12px] font-medium text-foreground">
              <Star
                className="h-3 w-3"
                style={{ color: "var(--mustard)", fill: "var(--mustard)" }}
              />
              {comercio.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </button>
    );
  }

  // variant="list"
  return (
    <button
      type="button"
      onClick={onClick}
      className="lift flex w-full gap-3.5 rounded-[20px] border border-border bg-card p-3 text-left"
      style={{
        boxShadow:
          "0 1px 0 0 oklch(1 0 0 / 0.6) inset, 0 8px 22px -16px oklch(0.22 0.018 65 / 0.18)",
      }}
    >
      <div className="photo-editorial relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-2xl bg-muted">
        <Foto comercio={comercio} className="h-full w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.22em]"
          style={{ color: "var(--terracotta)" }}
        >
          {label}
        </span>
        <h3
          className="mt-0.5 font-fraunces text-[17px] font-semibold leading-[1.15] text-foreground line-clamp-2"
          style={{ letterSpacing: "-0.018em" }}
        >
          {comercio.nombre}
        </h3>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-[12px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.7} />
          <span className="truncate">{comercio.direccion}</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <OpenBadge estado={estadoBadge} />
          <span className="tabular inline-flex items-center gap-1 text-[12px] font-medium text-foreground">
            <Star
              className="h-3 w-3"
              style={{ color: "var(--mustard)", fill: "var(--mustard)" }}
            />
            {comercio.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </button>
  );
}
