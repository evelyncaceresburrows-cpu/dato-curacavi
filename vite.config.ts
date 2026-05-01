import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  // base "/" (no "./") porque rutas anidadas como /lugar/:slug y
  // /evento/:slug son SPA rewrites a /index.html. Con base "./", los
  // assets se resuelven relativos a la URL: /lugar/assets/index.js → 404.
  // Con base "/", siempre /assets/index.js → 200. (Apr 30 2026 fix.)
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // outDir default `dist` — Vercel publica desde ahí (vercel.json outputDirectory).
    // No usar "/tmp/..." porque Vercel CLI ignora paths fuera del repo y publica
    // un dist/ viejo. (Bug que ocultó días de cambios — Apr 28 2026.)
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          icons: ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  optimizeDeps: {
    force: true,
  },
});
