import { useQuery } from "@tanstack/react-query";
import {
  COMERCIOS,
  ordenarComercios,
  type Comercio,
  type Categoria,
  type EstadoDato,
} from "@/data/seed";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * useComercios
 *
 * Trae comercios desde Supabase si hay credenciales; si no, o si algo
 * falla, cae a la semilla local (`COMERCIOS` de `@/data/seed`). Devuelve
 * los comercios ya ordenados con `ordenarComercios` (Socio Pro primero).
 *
 * Nunca lanza al UI: en cualquier error se usa la semilla como fallback
 * para que el vecino siempre vea datos.
 */

interface ComercioRow {
  id: string;
  slug: string;
  nombre: string;
  categoria: Categoria;
  subtitulo: string | null;
  descripcion: string | null;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  web: string | null;
  email: string | null;
  precio: Comercio["precio"] | null;
  rating: number | null;
  reviews: number | null;
  estado: EstadoDato;
  abierto_hasta: string | null;
  imagen: string | null;
  destacados: string[] | null;
  coords_x: number | null;
  coords_y: number | null;
  lat: number | null;
  lng: number | null;
  distancia_km: number | null;
}

function rowToComercio(row: ComercioRow): Comercio {
  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    categoria: row.categoria,
    subtitulo: row.subtitulo ?? "",
    descripcion: row.descripcion ?? "",
    direccion: row.direccion ?? "",
    telefono: row.telefono ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    web: row.web ?? undefined,
    email: row.email ?? undefined,
    precio: (row.precio ?? "$$") as Comercio["precio"],
    rating: Number(row.rating ?? 0),
    reviews: row.reviews ?? 0,
    estado: row.estado,
    abiertoHasta: row.abierto_hasta ?? undefined,
    imagen: row.imagen ?? "linear-gradient(135deg,#1F6B45,#2F8F5E)",
    destacados: row.destacados ?? [],
    coords: {
      x: Number(row.coords_x ?? 50),
      y: Number(row.coords_y ?? 50),
    },
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    distanciaKm: row.distancia_km ?? undefined,
  };
}

async function fetchComercios(): Promise<Comercio[]> {
  if (!isSupabaseConfigured || !supabase) {
    return ordenarComercios(COMERCIOS);
  }
  const { data, error } = await supabase
    .from("comercios")
    .select(
      "id,slug,nombre,categoria,subtitulo,descripcion,direccion,telefono,whatsapp,web,email,precio,rating,reviews,estado,abierto_hasta,imagen,destacados,coords_x,coords_y,lat,lng,distancia_km"
    )
    .eq("publicado", true);

  if (error || !data || data.length === 0) {
    if (error) console.warn("[useComercios] Supabase error, usando semilla:", error.message);
    return ordenarComercios(COMERCIOS);
  }

  const comercios = (data as ComercioRow[]).map(rowToComercio);
  return ordenarComercios(comercios);
}

export function useComercios() {
  return useQuery<Comercio[]>({
    queryKey: ["comercios"],
    queryFn: fetchComercios,
    // Con semilla offline disponible no vale la pena refetch agresivo.
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    // Siempre devolvemos algo usable aunque Supabase caiga.
    initialData: ordenarComercios(COMERCIOS),
  });
}
