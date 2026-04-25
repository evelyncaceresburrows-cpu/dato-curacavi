/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_ANTHROPIC_API_KEY?: string;
  /** Dominio público canónico. Default: https://datocuracavi.cl */
  readonly VITE_SITE_URL?: string;
  /** Endpoint Plausible/Umami/propio. Vacío = no-op. */
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  /** Dominio a reportar en el payload de analytics. */
  readonly VITE_ANALYTICS_DOMAIN?: string;
  /** Si "true", App.tsx usa HashRouter (para preview single-file file://). */
  readonly VITE_USE_HASH_ROUTER?: string;
  /** Si "true", habilita el prototipo iPhone-style en /app/* (legacy). */
  readonly VITE_ENABLE_MOBILE_PROTOTYPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
