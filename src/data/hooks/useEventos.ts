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
  fecha: string; // YYYY-MM-DD (inicio si es rango)
  fecha_fin: string | null; // YYYY-MM-DD del ultimo dia, si dura varios.
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
  /** Eventos recurrentes (ferias semanales): si true, expandimos a las
   *  proximas 4 ocurrencias usando dias_semana. */
  recurrente: boolean | null;
  /** Dias de la semana (0=dom .. 6=sab). Solo se usa si recurrente=true. */
  dias_semana: number[] | null;
}

function rowToEvento(row: EventoRow): Evento {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    fecha: row.fecha,
    fechaFin: row.fecha_fin ?? undefined,
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

/** Para un evento recurrente devuelve sus proximas N ocurrencias como
 *  eventos individuales (con slug y fecha distintos). N=4 por defecto.
 *  Para no-recurrentes devuelve [evento] sin cambios. */
function expandirRecurrentes(row: EventoRow, evento: Evento, n = 4): Evento[] {
  if (!row.recurrente || !row.dias_semana || row.dias_semana.length === 0) {
    return [evento];
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const out: Evento[] = [];
  // Iteramos hasta 60 dias para juntar n ocurrencias.
  for (let i = 0; i < 60 && out.length < n; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    if (row.dias_semana.includes(d.getDay())) {
      const fechaIso = d.toISOString().slice(0, 10);
      out.push({
        ...evento,
        // Slug compuesto para que sea unico en el calendario.
        slug: `${evento.slug}-${fechaIso}`,
        fecha: fechaIso,
        // Mantenemos el id original para que /evento/:slug lleve a la ficha base.
      });
    }
  }
  return out.length > 0 ? out : [evento];
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
      "id,slug,titulo,descripcion,fecha,fecha_fin,hora,lugar,comercio_id,categoria,tags,chip_color,imagen,estado,gratis,precio_texto,recurrente,dias_semana"
    )
    .eq("publicado", true)
    .order("fecha", { ascending: true });

  if (error || !data || data.length === 0) {
    if (error) console.warn("[useEventos] Supabase error, usando semilla:", error.message);
    return ordenarEventos(EVENTOS);
  }

  // Expandir eventos recurrentes a sus proximas 4 ocurrencias.
  const expandidos: Evento[] = [];
  for (const row of data as EventoRow[]) {
    const ev = rowToEvento(row);
    expandidos.push(...expandirRecurrentes(row, ev, 4));
  }
  return ordenarEventos(expandidos);
}

export function useEventos() {
  return useQuery<Evento[]>({
    queryKey: ["eventos"],
    queryFn: fetchEventos,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData: ordenarEventos(EVENTOS),
    // Mismo fix que useComercios: sin esto la semilla queda "fresca" para
    // siempre y nunca se llama a fetchEventos -> la agenda muestra los
    // eventos del seed local en vez de los reales de Supabase.
    initialDataUpdatedAt: 0,
    refetchOnMount: "always",
  });
}
