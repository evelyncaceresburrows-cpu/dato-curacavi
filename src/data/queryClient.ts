import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient único para toda la app.
 *
 * Defaults pensados para una app hiperlocal con semilla offline:
 * - No retries agresivos (preferimos fallback instantáneo a semilla).
 * - Stale time generoso (los datos de comercios no cambian minuto a minuto).
 * - No refetch on window focus (evita parpadeos en mobile).
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
