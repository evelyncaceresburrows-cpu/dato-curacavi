#!/usr/bin/env node
/**
 * Genera public/sitemap.xml a partir del seed.
 * Se corre antes de `vite build` (ver package.json).
 */
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const DOMAIN = process.env.VITE_SITE_URL || "https://datocuracavi.cl";

// Extraer slugs del seed con regex simple (no ejecutamos TS).
const seed = readFileSync(resolve(ROOT, "src/data/seed.ts"), "utf8");
const comercioSlugs = [
  ...seed.matchAll(/id:\s*"([a-z0-9-]+)",\s*\n\s*slug:\s*"([a-z0-9-]+)"/g),
].map((m) => m[2]);

// Comercios y eventos comparten el patrón `slug:` — separamos por sección.
const comerciosSection = seed.split("export const EVENTOS:")[0];
const eventosSection = seed.split("export const EVENTOS:")[1] ?? "";

const extractSlugs = (txt) =>
  [...txt.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);

const comercios = [...new Set(extractSlugs(comerciosSection))];
const eventos = [...new Set(extractSlugs(eventosSection))];

const rutas = [
  { loc: "/", priority: 1.0, changefreq: "daily" },
  { loc: "/directorio", priority: 0.9, changefreq: "daily" },
  { loc: "/agenda", priority: 0.9, changefreq: "daily" },
  { loc: "/mapa", priority: 0.8, changefreq: "weekly" },
  { loc: "/publicar", priority: 0.6, changefreq: "monthly" },
  { loc: "/socio", priority: 0.6, changefreq: "monthly" },
  ...comercios.map((s) => ({ loc: `/lugar/${s}`, priority: 0.7, changefreq: "weekly" })),
  ...eventos.map((s) => ({ loc: `/evento/${s}`, priority: 0.7, changefreq: "weekly" })),
];

const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas
  .map(
    (r) => `  <url>
    <loc>${DOMAIN}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(resolve(ROOT, "public/sitemap.xml"), xml);
console.log(
  `sitemap.xml → ${rutas.length} URLs (${comercios.length} comercios + ${eventos.length} eventos)`
);
