import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./data/queryClient";

/**
 * Router: por defecto usamos BrowserRouter (rutas limpias /directorio, /agenda).
 * Para el build single-file que abre con file:// (preview offline) activamos
 * HashRouter con `VITE_USE_HASH_ROUTER=true`.
 */
const USE_HASH_ROUTER = import.meta.env.VITE_USE_HASH_ROUTER === "true";
const Router = USE_HASH_ROUTER ? HashRouter : BrowserRouter;
import { IconLupa, LogoPrincipal } from "./components/Icons";
import FloatingConcierge from "./components/FloatingConcierge";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SplashScreen } from "./components/lovable/SplashScreen";
import { DatoMark } from "./components/lovable/DatoMark";
import { Wordmark } from "./components/lovable/Wordmark";

// Code-splitting por ruta — cada página es un chunk independiente.
// El vecino sólo baja lo que necesita para la pantalla que está viendo.
const Home = lazy(() => import("./pages/Home"));
const Directory = lazy(() => import("./pages/Directory"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Mapa = lazy(() => import("./pages/Mapa"));
const Socio = lazy(() => import("./pages/Socio"));
const Lugar = lazy(() => import("./pages/Lugar"));
const Evento = lazy(() => import("./pages/Evento"));
const Ruta = lazy(() => import("./pages/Ruta"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

/**
 * Prototipo iPhone (/app/*) — legacy. Se mantiene detrás de un flag
 * mientras migramos a la experiencia web-first responsive.
 * Activar con `VITE_ENABLE_MOBILE_PROTOTYPE=true`.
 * Se carga lazy: si el flag está off, ni siquiera entra al bundle.
 */
const ENABLE_MOBILE_PROTOTYPE =
  import.meta.env.VITE_ENABLE_MOBILE_PROTOTYPE === "true";

const MobileApp = ENABLE_MOBILE_PROTOTYPE
  ? lazy(() => import("./mobile/MobileApp"))
  : null;

/**
 * Dato 68 — guía oficial del valle
 * Estética premium: Montserrat, Bosque/Arena, clean interface.
 */

function NavBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/app') || pathname.startsWith('/admin')) return null;

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "var(--paper)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto flex items-center gap-6 px-6 py-3.5" style={{ maxWidth: 1400 }}>
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Dato 68 — inicio">
          <DatoMark size={36} />
          <span className="hidden sm:inline">
            <Wordmark size={16} inline />
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <NavPill to="/" label="Inicio" />
          <NavPill to="/directorio" label="Directorio" />
          <NavPill to="/ruta" label="Arma tu Ruta" />
          <NavPill to="/agenda" label="Agenda" />
          <NavPill to="/socio" label="Publicar" />
        </nav>

        <div className="ml-auto flex md:hidden">
          <Link to="/directorio" className="p-2" aria-label="Buscar" style={{ color: "var(--ink)" }}>
            <IconLupa width="24" height="24" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavPill({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className="font-inter-tight rounded-lg px-3 py-2 transition-all"
      style={{
        fontSize: 14,
        fontWeight: 600,
        background: active ? "var(--valley)" : "transparent",
        color: active ? "var(--cream)" : "var(--ink)",
      }}
    >
      {label}
    </Link>
  );
}

/**
 * MobileTabBar — 5 tabs estilo Claude Design (Inicio · Buscar · Mi ruta · Agenda · Publica).
 * Cream sólido con border-top, sin FAB. Solo se ve en mobile (`md:hidden`).
 * Iconos lucide-react portados del mockup ui.jsx > TabIcon.
 */
function MobileTabBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/app') || pathname.startsWith('/admin')) return null;

  const tabs = [
    { to: "/", label: "Inicio", icon: "home" as const },
    { to: "/directorio", label: "Buscar", icon: "search" as const },
    { to: "/ruta", label: "Mi ruta", icon: "route" as const },
    { to: "/agenda", label: "Agenda", icon: "calendar" as const },
    { to: "/socio", label: "Publica", icon: "plus" as const },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{
        background: "var(--cream)",
        borderTop: "1px solid var(--border)",
        padding: "8px 8px 18px",
      }}
    >
      <ul className="flex items-stretch justify-around">
        {tabs.map(({ to, label, icon }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          const color = active ? "var(--valley)" : "var(--muted)";
          const sw = active ? 2.2 : 1.8;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-1 py-1.5"
                style={{ color }}
              >
                <TabIcon name={icon} color={color} strokeWidth={sw} />
                <span
                  className="font-inter-tight"
                  style={{
                    fontSize: 10.5,
                    fontWeight: active ? 700 : 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TabIcon({
  name,
  color,
  strokeWidth = 1.8,
}: {
  name: "home" | "search" | "route" | "calendar" | "plus";
  color: string;
  strokeWidth?: number;
}) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "home")
    return (
      <svg {...common}>
        <path d="M3 11 L 12 3 L 21 11" />
        <path d="M5 10 V 21 H 19 V 10" />
      </svg>
    );
  if (name === "search")
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="M16 16 L 21 21" />
      </svg>
    );
  if (name === "route")
    return (
      <svg {...common}>
        <path d="M6 4 V 10 a 3 3 0 0 0 3 3 h 6 a 3 3 0 0 1 3 3 v 4" />
        <circle cx="6" cy="3" r="2" fill={color} />
        <circle cx="18" cy="21" r="2" fill={color} />
      </svg>
    );
  if (name === "calendar")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10 H 21 M 8 3 V 7 M 16 3 V 7" />
      </svg>
    );
  // plus
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8 V 16 M 8 12 H 16" />
    </svg>
  );
}


function Footer() {
  return (
    <footer
      className="hidden md:block"
      style={{
        background: "var(--ink)",
        color: "var(--cream)",
        padding: "64px 0 32px",
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1400 }}>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <DatoMark size={32} />
              <Wordmark size={16} inline />
            </div>
            <p
              className="font-inter-tight mt-5"
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(245,240,230,0.6)",
              }}
            >
              La guía vecinal del corredor Ruta 68. Picadas, viñas, ferias y
              eventos del valle, hechos para los que vivimos acá.
            </p>
          </div>
          <div>
            <h4
              className="font-inter-tight uppercase"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: "var(--terracotta)",
              }}
            >
              Explorar
            </h4>
            <ul className="font-inter-tight mt-5 space-y-3" style={{ fontSize: 14 }}>
              <li><Link to="/" style={{ color: "rgba(245,240,230,0.85)" }}>Inicio</Link></li>
              <li><Link to="/directorio" style={{ color: "rgba(245,240,230,0.85)" }}>Directorio</Link></li>
              <li><Link to="/ruta" style={{ color: "rgba(245,240,230,0.85)" }}>Arma tu Ruta</Link></li>
              <li><Link to="/agenda" style={{ color: "rgba(245,240,230,0.85)" }}>Agenda</Link></li>
            </ul>
          </div>
          <div>
            <h4
              className="font-inter-tight uppercase"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: "var(--terracotta)",
              }}
            >
              Comunidad
            </h4>
            <ul className="font-inter-tight mt-5 space-y-3" style={{ fontSize: 14 }}>
              <li><Link to="/socio" style={{ color: "rgba(245,240,230,0.85)" }}>Publicar negocio</Link></li>
              <li><Link to="/socio?tab=evento" style={{ color: "rgba(245,240,230,0.85)" }}>Publicar evento</Link></li>
            </ul>
          </div>
          <div
            className="rounded-3xl"
            style={{
              background: "rgba(245,240,230,0.05)",
              border: "1px solid rgba(245,240,230,0.1)",
              padding: 24,
            }}
          >
            <h4
              className="font-fraunces"
              style={{
                fontSize: 19,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "var(--cream)",
              }}
            >
              ¿Tienes dudas?
            </h4>
            <p
              className="font-inter-tight mt-2"
              style={{ fontSize: 13, color: "rgba(245,240,230,0.6)" }}
            >
              Escríbenos y te ayudamos a encontrar lo que buscas.
            </p>
            <a
              href="mailto:evelyncaceresburrows@gmail.com?subject=Consulta%20Dato%2068"
              className="font-inter-tight mt-5 inline-flex w-full items-center justify-center rounded-xl"
              style={{
                background: "var(--terracotta)",
                color: "var(--cream)",
                padding: "12px 18px",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Contactar
            </a>
          </div>
        </div>
        <div
          className="font-inter-tight uppercase mt-16 flex flex-col items-center justify-between gap-4 pt-8 md:flex-row"
          style={{
            borderTop: "1px solid rgba(245,240,230,0.1)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            color: "rgba(245,240,230,0.4)",
          }}
        >
          <p>© {new Date().getFullYear()} Dato 68 · Hecho con ♥ en Curacaví</p>
          <div className="flex gap-8">
            <Link to="/privacidad" style={{ color: "rgba(245,240,230,0.4)" }}>Privacidad</Link>
            <Link to="/terminos" style={{ color: "rgba(245,240,230,0.4)" }}>Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-bosque-600/20 border-t-bosque-600 animate-spin" />
    </div>
  );
}

function WebShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <div className="min-h-screen bg-arena selection:bg-bosque-600 selection:text-white">
      {!isAdmin && <SplashScreen />}
      <NavBar />
      <main>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/directorio" element={<Directory />} />
              <Route path="/mapa" element={<Mapa />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/socio" element={<Socio />} />
              <Route path="/publicar" element={<Socio />} />
              <Route path="/publica" element={<Socio />} />
              <Route path="/lugar/:slug" element={<Lugar />} />
              <Route path="/evento/:slug" element={<Evento />} />
              <Route path="/ruta" element={<Ruta />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdmin && <Footer />}
      <MobileTabBar />
      {!isAdmin && <FloatingConcierge />}
    </div>
  );
}


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={null}>
          <Routes>
            {/* Prototipo iPhone — sólo si el flag está prendido */}
            {ENABLE_MOBILE_PROTOTYPE && MobileApp && (
              <Route path="/app/*" element={<MobileApp />} />
            )}
            {/* Experiencia web unificada (responsive) */}
            <Route path="/*" element={<WebShell />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}
