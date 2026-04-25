import type { Config } from "tailwindcss";

/**
 * Identity Engine V3 — Dato Curacaví Official Design
 * --------------------------------------------
 * Basado en las guías visuales de referencia.
 * Verde bosque, arena suave, tipografía Montserrat.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta Oficial Dato Curacaví
        bosque: {
          50: "#F0F7F3",
          100: "#DCECE3",
          200: "#B8D9C8",
          300: "#8BBEA6",
          400: "#5B9D7E",
          500: "#2D6A4F",
          600: "#1B4332",
          700: "#143628",
          800: "#0D281E",
        },
        arena: {
          DEFAULT: "#F7F3ED",
          50: "#FBF9F6",
          100: "#F7F3ED",
          200: "#F0EBE2",
        },
        carbon: "#222222",
        humo: "#6B6B6B",
        "chip-musica": "#E6DEF4",
        "chip-gastro": "#FADBC1",
        "chip-cultura": "#FADCE0",
        "chip-deporte": "#FCE5B6",
        "chip-natura": "#D8E9F4",
      },
      fontFamily: {
        sans: ["'Montserrat'", "Inter", "system-ui", "sans-serif"],
        mont: ["'Montserrat'", "Inter", "system-ui", "sans-serif"],
        display: ["'Montserrat'", "Inter", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        tagline: ["'Dancing Script'", "cursive"],
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },
      boxShadow: {
        tarjeta: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px -6px rgba(16,24,40,0.10)",
        elevada: "0 8px 28px -8px rgba(16,24,40,0.16), 0 2px 6px rgba(16,24,40,0.06)",
        nav: "0 -4px 18px -6px rgba(16,24,40,0.12)",
        cta: "0 10px 24px -8px rgba(31,107,69,0.45)",
        sello: "inset 0 0 0 1.5px rgba(120,53,15,0.4)",
        stamp: "0 2px 10px -2px rgba(0,0,0,0.1)",
      },
      backgroundImage: {
        "hero-valle": "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('/images/bg-curacavi.jpg')",
      },
    },
  },
  plugins: [],
} satisfies Config;

