/**
 * seoLd.ts — generadores de JSON-LD para rich results.
 *
 * Referencia: https://schema.org/LocalBusiness, https://schema.org/Event
 */

import type { Comercio, Evento } from "@/data/seed";

const SITE = import.meta.env.VITE_SITE_URL || "https://datocuracavi.cl";

const TIPO_SCHEMA: Record<string, string> = {
  picadas: "Restaurant",
  dulces: "BakeryShop",
  chicha: "Winery",
  panoramas: "TouristAttraction",
  servicios: "LocalBusiness",
  tramites: "GovernmentOffice",
  emprendimientos: "Store",
  alojamientos: "LodgingBusiness",
  cultura: "EntertainmentBusiness",
  emergencias: "EmergencyService",
};

export function localBusinessLd(c: Comercio): Record<string, unknown> {
  const schemaType = TIPO_SCHEMA[c.categoria] ?? "LocalBusiness";
  const priceRange = c.precio ?? "$$";
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${SITE}/lugar/${c.slug}`,
    name: c.nombre,
    description: c.descripcion,
    image: c.imagen?.startsWith("http") ? c.imagen : `${SITE}/images/og-cover.png`,
    priceRange,
    url: `${SITE}/lugar/${c.slug}`,
    telephone: c.telefono,
    email: c.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: c.direccion,
      addressLocality: "Curacaví",
      addressRegion: "Región Metropolitana",
      addressCountry: "CL",
    },
    ...(c.lat && c.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: c.lat,
            longitude: c.lng,
          },
        }
      : {}),
    aggregateRating: c.reviews
      ? {
          "@type": "AggregateRating",
          ratingValue: c.rating,
          reviewCount: c.reviews,
        }
      : undefined,
  };
}

export function eventoLd(e: Evento): Record<string, unknown> {
  const startDate = e.hora ? `${e.fecha}T${e.hora}:00-04:00` : e.fecha;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${SITE}/evento/${e.slug}`,
    name: e.titulo,
    description: e.descripcion,
    startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: e.imagen?.startsWith("http") ? e.imagen : `${SITE}/images/og-cover.png`,
    url: `${SITE}/evento/${e.slug}`,
    location: {
      "@type": "Place",
      name: e.lugar,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Curacaví",
        addressRegion: "Región Metropolitana",
        addressCountry: "CL",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Dato Curacaví",
      url: SITE,
    },
    offers: e.gratis
      ? {
          "@type": "Offer",
          price: 0,
          priceCurrency: "CLP",
          availability: "https://schema.org/InStock",
          url: `${SITE}/evento/${e.slug}`,
        }
      : e.precio
        ? {
            "@type": "Offer",
            price: e.precio.replace(/\D/g, ""),
            priceCurrency: "CLP",
            availability: "https://schema.org/InStock",
            url: `${SITE}/evento/${e.slug}`,
          }
        : undefined,
  };
}

export function organizationLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dato Curacaví",
    url: SITE,
    logo: `${SITE}/images/logo-oficial.png`,
    areaServed: {
      "@type": "City",
      name: "Curacaví",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Región Metropolitana de Santiago",
      },
    },
    sameAs: [],
  };
}

export function breadcrumbLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url.startsWith("http") ? it.url : `${SITE}${it.url}`,
    })),
  };
}
