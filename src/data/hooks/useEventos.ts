import { useQuery } from "@tanstack/react-query";
import {
  EVENTOS,
  pesoEstado,
  type Evento,
  type CategoriaEvento,
  type EstadoDato,
} from "@/data/seed";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * useEventos
 *
 * Trae eventos desde Supabase (si está configurado) o cae a la semilla
 * `EVENTOS` de `@/data/seed`. Ordena por fecha ascendente; dentro del
 * mismo día, primero Socio Pro → Verificado → Por confirmar.
 */

interface EventoRow {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string | null;
  fecha: string; // YYYY-MM-DD
  hora: string | null; // HH:mm:ss
  lugar: string | null;
  comercio_id: string | null;
  categoria: CategoriaEvento;
  tags: string[] | null;
  chip_color: string | null;
  imagen: string | null;
  estado: EstadoDato;
  gratis: boolean | null;
  precio_texto: string | null;
}

function rowToEvento(row: EventoRow): Evento {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    fecha: row.fecha,
    hora: (row.hora ?? "").slice(0, 5), // "HH:mm"
    lugar: row.lugar ?? "",
    comercioId: row.comercio_id ?? undefined,
    categoria: row.categoria,
    tags: row.tags ?? [],
    chipColor: row.chip_color ?? "#D7ECDD",
    imagen: row.imagen ?? "linear-gradient(135deg,#1F6B45,#2F8F5E)",
    estado: row.estado,
    gratis: row.gratis ?? false,
    precio: row.precio_texto ?? undefined,
  };
}

function ordenarEventos(lista: Evento[]): Evento[] {
  return [...lista].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    const pe = pesoEstado(a.estado) - pesoEstado(b.estado);
    if (pe !== 0) return pe;
    return (a.hora ?? "").localeCompare(b.hora ?? "");
  });
}

async function fetchEventos(): Promise<Evento[]> {
  if (!isSupabaseConfigured || !supabase) {
    return ordenarEventos(EVENTOS);
  }
  const { data, error } = await supabase
    .from("eventos")
    .select(
      "id,slug,titulo,descripcion,fecha,hora,lugar,comercio_id,categoria,tags,chip_color,imagen,estado,gratis,precio_texto"
    )
    .eq("publicado", true)
    .order("fecha", { ascending: true });

  if (error || !data || data.length === 0) {
    if (error) console.warn("[useEventos] Supabase error, usando semilla:", error.message);
    return ordenarEventos(EVENTOS);
  }

  return ordenarEventos((data as EventoRow[]).map(rowToEvento));
}

export function useEventos() {
  return useQuery<Evento[]>({
    queryKey: ["eventos"],
    queryFn: fetchEventos,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData: ordenarEventos(EVENTOS),
  });
}
