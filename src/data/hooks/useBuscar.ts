/**
 * useBuscar(q)
 *
 * Hook reactivo del buscador inteligente.
 *
 *   - Debounce 250 ms para no martillar la DB en cada tecla.
 *   - Cachea resultados por query expandida (TanStack Query).
 *   - `enabled: false` mientras la query es muy corta (< 2 chars).
 *   - Devuelve `{ data, isLoading, isFetching, error }` + utilidades.
 *
 * El hook NUNCA lanza al UI: si Supabase falla cae al seed local
 * dentro de `buscar()` y devuelve resultados igualmente.
 *
 * Analytics:
 *   · Dispara `buscar_sugerencia` una vez por query nueva cuando el resultado
 *     trae sugerencias para refinar (sinónimos, tags relacionados). El
 *     ref interno previene doble-disparo si React re-renderiza con la misma
 *     data en cache.
 */

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { buscar, type ResultadoBuscador } from "@/lib/buscador";
import { track, Events } from "@/lib/analytics";

const VACIO: ResultadoBuscador = {
  comercios: [],
  eventos: [],
  sugerencias: [],
  query: { raw: "", palabras: [], tags: [] },
  source: "local",
};

function useDebounced(value: string, delay = 250): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useBuscar(rawQuery: string) {
  const q = useDebounced(rawQuery.trim(), 250);
  const enabled = q.length >= 2;

  const query = useQuery<ResultadoBuscador>({
    queryKey: ["buscar", q],
    queryFn: () => buscar(q),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Track `buscar_sugerencia` exactamente una vez por query nueva cuyo
  // resultado trae sugerencias. La ref evita re-disparar al re-renderizar.
  const lastTrackedRef = useRef<string>("");
  useEffect(() => {
    const d = query.data;
    if (!d || query.isFetching) return;
    const key = d.query.raw;
    if (!key || key === lastTrackedRef.current) return;
    if (d.sugerencias && d.sugerencias.length > 0) {
      lastTrackedRef.current = key;
      track(Events.BUSCAR_SUGERENCIA, {
        q: key.slice(0, 80),
        sugerencias: d.sugerencias.slice(0, 5).join("|"),
        source: d.source,
        hits: d.comercios.length + d.eventos.length,
      });
    }
  }, [query.data, query.isFetching]);

  return {
    data: enabled ? query.data ?? VACIO : VACIO,
    isLoading: enabled && query.isLoading,
    isFetching: enabled && query.isFetching,
    error: query.error as Error | null,
    isReady: enabled,
  };
}
