import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  base: "./",
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
