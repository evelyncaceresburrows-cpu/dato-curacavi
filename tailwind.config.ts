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

        // ─── Tokens Dato 68 (mockup Claude Design) ───────────────────────
        // Componentes lovable y nuevas pantallas redesign consumen estas vars
        // via clases tailwind como `bg-card`, `text-muted`, `text-terracotta`, etc.
        // Las CSS variables se definen en src/index.css.
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        muted: "var(--muted-foreground)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        terracotta: "var(--terracotta)",
        "terracotta-deep": "var(--terracotta-deep)",
        valley: "var(--valley)",
        "valley-mid": "var(--valley-mid)",
        field: "var(--field)",
        sun: "var(--sun)",
        cream: "var(--cream)",
        paper: "var(--paper)",
        "paper-dark": "var(--paper-dark)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        mustard: "var(--sun)",

        // ─── Aliases legacy del Concierge ─────────────────────────────────
        // El componente FloatingConcierge / ConciergePanel fue escrito antes
        // del rebrand a Dato 68. Para no reescribir 300 líneas mappeamos los
        // colores viejos (`crema`, `parral`, `tierra`) a la paleta nueva.
        crema: "var(--cream)",
        parral: {
          DEFAULT: "var(--valley)",
          50: "var(--paper)",
          100: "var(--paper-dark)",
          200: "var(--field)",
          400: "var(--valley-mid)",
          500: "var(--valley-mid)",
          600: "var(--valley-mid)",
          700: "var(--valley)",
          800: "var(--valley)",
          900: "var(--ink)",
        },
        tierra: {
          DEFAULT: "var(--ink-soft)",
          100: "var(--border)",
          200: "var(--border)",
          300: "var(--muted-foreground)",
          400: "var(--muted-foreground)",
          500: "var(--muted-foreground)",
          600: "var(--ink-soft)",
          700: "var(--ink-soft)",
          800: "var(--ink)",
          900: "var(--ink)",
        },
      },
      fontFamily: {
        sans: ["'Montserrat'", "Inter", "system-ui", "sans-serif"],
        mont: ["'Montserrat'", "Inter", "system-ui", "sans-serif"],
        display: ["'Montserrat'", "Inter", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        tagline: ["'Dancing Script'", "cursive"],

        // Familia Lovable — solo para componentes editoriales (BusinessCard, etc.)
        "fraunces": ["'Fraunces'", "Georgia", "serif"],
        "inter-tight": ["'Inter Tight'", "Inter", "system-ui", "sans-serif"],
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

