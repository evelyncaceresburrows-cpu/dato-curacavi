#!/usr/bin/env node
// Concatena /tmp/dato-curacavi-sf/{index.html,app.css,app.js} en un HTML único.
// Útil para previews file:// sin servidor.
import fs from "node:fs";
import path from "node:path";

const DIST = process.env.SF_DIST ?? "/tmp/dato-curacavi-sf";
const OUT = process.argv[2] ?? path.join(DIST, "dato-curacavi.html");

const html = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const css = fs.readFileSync(path.join(DIST, "app.css"), "utf8");
const js = fs.readFileSync(path.join(DIST, "app.js"), "utf8");

// Elimina la CSP meta (no queremos bloquearnos en file://) y el <link rel=stylesheet>
// y el <script type=module src=...>; reemplazamos por inline.
let result = html
  .replace(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>\s*/i, "")
  .replace(/<link\s+rel="stylesheet"\s+[^>]*app\.css[^>]*>\s*/i, "")
  .replace(
    /<link\s+rel="stylesheet"\s+crossorigin\s+href="[^"]*app\.css"\s*\/?>\s*/i,
    "",
  )
  .replace(/<script[^>]*src="[^"]*app\.js"[^>]*><\/script>\s*/i, "");

// Inyecta CSS en <head>
result = result.replace(/<\/head>/i, `<style>${css}</style></head>`);

// Inyecta JS al final del <body> (sin type=module para máxima compatibilidad file://)
result = result.replace(/<\/body>/i, `<script>${js}</script></body>`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, result, "utf8");

const size = fs.statSync(OUT).size;
console.log(`dato-curacavi.html → ${OUT} (${(size / 1024).toFixed(1)} kB)`);
