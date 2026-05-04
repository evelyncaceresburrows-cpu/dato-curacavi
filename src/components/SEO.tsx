import { Helmet } from "react-helmet-async";

// El SITE_URL canonical: lo configurable via VITE_SITE_URL (cuando exista
// un dominio propio) cae al deploy actual de Vercel. Antes apuntaba a
// datocuracavi.cl que no esta activo y rompia los previews de redes sociales
// (la imagen og-cover.png nunca cargaba).
const SITE =
  import.meta.env.VITE_SITE_URL || "https://dato-curacavi.vercel.app";
const DEFAULT_OG = `${SITE}/images/og-cover.png`;

interface Props {
  /** Título final. Si no se pasa, usa el default del layout. */
  title?: string;
  description?: string;
  /** Path canónico (sin dominio). Si no se pasa usa window.location.pathname. */
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  /** JSON-LD estructurado. Ya serializado o como objeto. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Robots directive */
  noindex?: boolean;
}

/**
 * SEO — componente declarativo por página.
 * Inyecta title, description, OpenGraph, Twitter Card, canonical y JSON-LD.
 *
 * Ejemplo (en Lugar.tsx):
 *   <SEO
 *     title={`${comercio.nombre} · Dato 68`}
 *     description={comercio.descripcion}
 *     path={`/lugar/${comercio.slug}`}
 *     jsonLd={localBusinessLd(comercio)}
 *   />
 */
export function SEO({
  title,
  description,
  path,
  image = DEFAULT_OG,
  type = "website",
  jsonLd,
  noindex,
}: Props) {
  const fullTitle = title
    ? title.includes("Dato 68")
      ? title
      : `${title} · Dato 68`
    : "Dato 68 — La guía del corredor Ruta 68";
  const canonical = path ? `${SITE}${path}` : SITE;
  const desc =
    description ??
    "La guía vecinal del corredor Ruta 68: Curacaví, Casablanca, Algarrobo, Quintay y Valparaíso. Picadas, viñas, ferias, panoramas y emergencias verificadas.";

  const jsonLdArr = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* OpenGraph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="es_CL" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {jsonLdArr.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
