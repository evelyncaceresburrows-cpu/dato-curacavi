import { useMutation } from "@tanstack/react-query";
import {
  crearSolicitud,
  type SolicitudPayload,
  type SolicitudResult,
} from "@/lib/solicitudesApi";
import { track, Events } from "@/lib/analytics";

/**
 * useCrearSolicitud — envía una solicitud (negocio o evento) al backend.
 *
 * - Valida cliente-side ANTES de llamar a esta mutation (ver solicitudSchema).
 * - Track automático de éxito/error para analytics.
 * - Devuelve {data, error, isPending, reset, mutateAsync}.
 */
export function useCrearSolicitud() {
  return useMutation<SolicitudResult, Error, SolicitudPayload>({
    mutationFn: async (payload) => {
      const res = await crearSolicitud(payload);
      if (!res.ok) throw new Error(res.error ?? "Error enviando solicitud");
      return res;
    },
    onSuccess: (res, vars) => {
      track(Events.PUBLICAR_SUBMIT, {
        tipo: vars.tipo,
        categoria: vars.categoria ?? "",
        modo: res.modo,
      });
    },
    onError: (err, vars) => {
      track(Events.PUBLICAR_ERROR, {
        tipo: vars.tipo,
        mensaje: err.message.slice(0, 120),
      });
    },
  });
}
