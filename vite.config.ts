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
  // Cache y dist redirigidos a /tmp en este sandbox para evitar EPERM.
  // En dev local puedes borrar estas dos líneas.
  cacheDir: "/tmp/vite-cache-dato-curacavi",
  build: {
    outDir: "/tmp/dato-curacavi-dist",
    emptyOutDir: true,
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
