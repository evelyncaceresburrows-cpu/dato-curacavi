/**
 * EventCard — card editorial de evento (variante horizontal o compact).
 * Portado de Lovable y adaptado a nuestro tipo `Evento` de @/data/seed.
 */
import { MapPin, Clock } from "lucide-react";
import type { Evento, CategoriaEvento } from "@/data/seed";
import { DateStamp } from "./DateStamp";

interface Props {
  evento: Evento;
  variant?: "horizontal" | "compact";
}

const ETIQUETA_CATEGORIA: Record<CategoriaEvento, string> = {
  musica: "Música",
  gastro: "Gastro",
  cultura: "Cultura",
  deporte: "Deporte",
  naturaleza: "Naturaleza",
  tradicional: "Tradición",
};

function isUrl(s?: string): boolean {
  return !!s && (s.startsWith("http") || s.startsWith("/"));
}

export function EventCard({ evento, variant = "horizontal" }: Props) {
  const label = ETIQUETA_CATEGORIA[evento.categoria] ?? evento.categoria;

  if (variant === "compact") {
    return (
      <div
        className="lift flex min-w-0 w-full gap-3.5 rounded-[20px] border border-border bg-card p-3.5"
        style={{
          boxShadow:
            "0 1px 0 0 oklch(1 0 0 / 0.6) inset, 0 8px 22px -16px oklch(0.22 0.018 65 / 0.18)",
        }}
      >
        <DateStamp iso={evento.fecha} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="text-[10px] font-medium uppercase tracking-[0.22em]"
            style={{ color: "var(--terracotta)" }}
          >
            {label}
          </span>
          <h3
            className="mt-0.5 font-fraunces text-[15px] font-semibold leading-[1.18] text-foreground line-clamp-2"
            style={{ letterSpacing: "-0.018em" }}
          >
            {evento.titulo}
          </h3>
          <p className="tabular mt-1.5 flex items-center gap-1 text-[12px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" strokeWidth={1.7} />
            {evento.hora}
          </p>
        </div>
      </div>
    );
  }

  // variant="horizontal"
  return (
    <article
      className="lift flex gap-3.5 rounded-[20px] border border-border bg-card p-3.5"
      style={{
        boxShadow:
          "0 1px 0 0 oklch(1 0 0 / 0.6) inset, 0 8px 22px -16px oklch(0.22 0.018 65 / 0.18)",
      }}
    >
      <DateStamp iso={evento.fecha} size="lg" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.22em]"
          style={{ color: "var(--terracotta)" }}
        >
          {label}
        </span>
        <h3
          className="mt-0.5 font-fraunces text-[17px] font-semibold leading-[1.15] text-foreground"
          style={{ letterSpacing: "-0.018em" }}
        >
          {evento.titulo}
        </h3>
        <div className="tabular mt-1.5 flex flex-col gap-1 text-[12px] text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.7} />
            <span className="truncate">{evento.lugar}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0" strokeWidth={1.7} /> {evento.hora}
          </span>
        </div>
      </div>
      {isUrl(evento.imagen) && (
        <div className="photo-editorial relative hidden h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-muted sm:block">
          <img
            src={evento.imagen}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </article>
  );
}
