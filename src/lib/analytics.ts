/**
 * analytics.ts — tracker privacy-friendly.
 *
 * Compatible con endpoints tipo Plausible / Umami. Si no hay endpoint
 * configurado (VITE_ANALYTICS_ENDPOINT), hace no-op y solo loggea en dev.
 *
 * No usa cookies, no envía IP cruda (lo maneja el servidor), no hay huella
 * de navegador. Pensado para Curacaví: vecinos antes que métricas.
 *
 * Env:
 *   VITE_ANALYTICS_ENDPOINT = "https://plausible.io/api/event"  (opcional)
 *   VITE_ANALYTICS_DOMAIN   = "datocuracavi.cl"                 (opcional)
 */

const ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
const DOMAIN = import.meta.env.VITE_ANALYTICS_DOMAIN as string | undefined;
const DEV = import.meta.env.DEV;

type Props = Record<string, string | number | boolean>;

function send(name: string, props?: Props, url?: string) {
  if (typeof window === "undefined") return;
  if (!ENDPOINT) {
    if (DEV) console.info("[analytics]", name, props ?? {});
    return;
  }

  const payload = {
    name,
    url: url ?? window.location.href,
    domain: DOMAIN ?? window.location.host,
    referrer: document.referrer || null,
    props: props ?? undefined,
  };

  // navigator.sendBeacon si está disponible (no bloquea la navegación).
  const body = JSON.stringify(payload);
  if ("sendBeacon" in navigator) {
    try {
      navigator.sendBeacon(ENDPOINT, body);
      return;
    } catch {
      /* fallthrough to fetch */
    }
  }
  fetch(ENDPOINT, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  }).catch(() => {
    /* silencioso: analytics no debe romper UX */
  });
}

export function initAnalytics() {
  if (typeof window === "undefined") return;
  // Primer pageview.
  send("pageview");
  // SPA: cada cambio de historial dispara pageview.
  const patch = (method: "pushState" | "replaceState") => {
    const original = history[method];
    history[method] = function (this: History, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args as never);
      send("pageview");
      return result;
    } as typeof original;
  };
  patch("pushState");
  patch("replaceState");
  window.addEventListener("popstate", () => send("pageview"));
}

export function track(name: string, props?: Props) {
  send(name, props);
}

/** Eventos canónicos para no repetir strings por la app. */
export const Events = {
  PUBLICAR_SUBMIT: "publicar_submit",
  PUBLICAR_ERROR: "publicar_error",
  SOCIO_PRO_CTA: "socio_pro_cta",
  WHATSAPP_CLICK: "whatsapp_click",
  LLAMADA_CLICK: "llamada_click",
  NAVEGAR_CLICK: "navegar_click",
  BUSCAR: "buscar",
  CATEGORIA_FILTRO: "categoria_filtro",
  LUGAR_VIEW: "lugar_view",
  EVENTO_VIEW: "evento_view",
  ARMAR_RUTA: "armar_ruta",
  ARMAR_RUTA_PARADA: "armar_ruta_parada",
  BUSCAR_SUGERENCIA: "buscar_sugerencia",
} as const;
