import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Build alternativo para preview single-file (file://).
 *
 * Desactiva code-splitting: todo termina en UN sólo index.js + index.css.
 * Luego `inline-single-file.mjs` lo concatena en un HTML.
 * No se usa para producción — producción usa vite.config.ts con chunks.
 */
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  cacheDir: "/tmp/vite-cache-dato-curacavi-sf",
  define: {
    // Forzamos HashRouter en el build single-file (file:// no soporta history).
    "import.meta.env.VITE_USE_HASH_ROUTER": JSON.stringify("true"),
  },
  build: {
    outDir: "/tmp/dato-curacavi-sf",
    emptyOutDir: true,
    target: "es2020",
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Todo a un sólo archivo.
        manualChunks: undefined,
        inlineDynamicImports: true,
        entryFileNames: "app.js",
        chunkFileNames: "app.js",
        assetFileNames: "app.[ext]",
      },
    },
    chunkSizeWarningLimit: 2000,
  },
});
