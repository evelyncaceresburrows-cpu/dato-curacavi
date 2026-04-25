# Dato Curacaví — Technical & Design Handover (Project Status Report)

**Date**: April 21, 2026
**Target AI**: Claude (or any other LLM taking over the codebase)
**Status**: Frontend Visual Migration Complete (Parity with Official Designs)

---

## 1. Project Overview & Identity
**Dato Curacaví** is the official digital guide for the Curacaví Valley. The project has recently undergone a massive visual refactor to eliminate any "generic SaaS dashboard" aesthetics. 

The new identity is **"Bosque & Arena"**: a premium, editorial, and highly visual language designed to feel like a modern, native, high-end travel and lifestyle app.

## 2. Tech Stack
*   **Core**: React 18, TypeScript, Vite
*   **Routing**: `react-router-dom` (HashRouter currently configured in `App.tsx`)
*   **Styling**: Tailwind CSS v3
*   **Icons**: `lucide-react` + Custom SVG/Images (`src/components/Icons.tsx`)

---

## 3. The "Bosque & Arena" Design System
If you modify or create new components, you **MUST** adhere to these rules:

### A. Paleta de Colores (`tailwind.config.ts`)
*   **`bosque` (Verdes)**: El color primario oficial es el verde oscuro (`bosque-600`: `#1B4332`). Se han configurado tonos del `50` al `800`.
*   **`arena` (Fondos)**: El color base de la aplicación no es blanco, es `arena` (`#F7F3ED`). El blanco puro se usa solo en tarjetas para crear contraste.
*   **`carbon` (Texto)**: El texto principal es `carbon` (`#222222`), no negro puro. El texto secundario es `humo`.

### B. Tipografía y Jerarquía
*   **Fuente Única**: `Montserrat`.
*   **Pesos**: Se utilizan pesos fuertes (`font-extrabold`, `font-black`) para los títulos, y `font-medium` o `font-bold` para cuerpos de texto.
*   **Tracking**: Uso intensivo de `tracking-tight` (títulos) y `tracking-widest uppercase` (etiquetas, superíndices, categorías).

### C. Formas y Sombras (`src/index.css`)
*   **Bordes Redondeados**: Componentes masivos usan `rounded-[32px]` o `rounded-3xl` (no uses `rounded-md` o bordes cuadrados).
*   **Sombras Propias**: Se usan utilidades personalizadas: `shadow-tarjeta`, `shadow-elevada` y `shadow-cta` (sombra verde brillante para botones primarios).
*   **Espacio Negativo**: Mucho padding (`py-16`, `gap-8`). **No amontones los elementos.**

---

## 4. Key Assets & Media
The project relies on specific media located in `public/images/`:
*   `logo-oficial.png`: The official stacked logo (Pin + Text). Configured to scale automatically (`object-contain`).
*   `bg-curacavi.png`: A cinematic sunset valley landscape used in the `Home.tsx` Hero section.
*   *Note: `LogoPrincipal` component in `Icons.tsx` consumes the official PNG directly to ensure 100% brand fidelity.*

---

## 5. Architecture & Routing (`src/App.tsx`)
The app uses a `WebShell` wrapper for web/desktop that provides a unified layout:
*   **`NavBar`**: Sticky header. Responsive (hides text/links on mobile, shows hamburger/lupa).
*   **`MobileTabBar`**: Fixed bottom navigation for mobile viewports, styled like a floating pill with a prominent `+` (Publicar) FAB in the center.
*   **`FloatingConcierge`**: The floating AI assistant chat widget.

### Core Pages (`src/pages/`)
1.  **`Home.tsx`**: Features a massive Hero section (using `bg-curacavi.png` and `TopographicPattern.tsx`), integrated search, horizontal category scrollers, and immersive "Eventos" cards.
2.  **`Directory.tsx`**: The main exploration grid. Features "Sellos de Calidad" (verified badges) and robust filtering UI.
3.  **`Agenda.tsx`**: Cultural calendar. Uses a premium layout with large side-by-side images and a horizontal date scroller.
4.  **`Mapa.tsx`**: Interactive map UI with a floating side panel and aesthetic grid backgrounds.
5.  **`Socio.tsx`**: Multi-step/tabbed form for business owners to register or publish events.

---

## 6. Current State & Immediate Next Steps
**What is done:**
✅ Total visual migration to the official design reference.
✅ Responsive behaviors (Mobile-first app feel, editorial desktop feel).
✅ Tailwind configuration stabilized with custom colors and shadows.

**What Claude Needs to Do Next:**
1.  **Data Integration**: Currently, all pages consume hardcoded arrays from `src/mobile/data/mockData.ts` (e.g., `EVENTOS`, `LUGARES`). Claude should connect these to a real backend (e.g., **Supabase**).
2.  **AI Concierge Backend**: The `FloatingConcierge` component might need its API routes (`/api/chat`) or LLM logic connected/refined if it isn't fully operational.
3.  **Dynamic Routing**: Implement dynamic pages like `/lugar/:id` or `/evento/:id` which currently just link to routes that might not be fully fleshed out in the Router.
4.  **Performance**: Optimize image loading (implement lazy loading or a CDN for the heavy photography).

---
*End of Report. Welcome to Dato Curacaví, Claude!*
