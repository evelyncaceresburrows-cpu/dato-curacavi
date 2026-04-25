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
import { IconCasa, IconLupa, IconHoja, IconMaletin, IconSello, LogoPrincipal } from "./components/Icons";
import { Calendar, User, Plus } from "lucide-react";
import FloatingConcierge from "./components/FloatingConcierge";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
 * Dato Curacaví — guía oficial del valle
 * Estética premium: Montserrat, Bosque/Arena, clean interface.
 */

function NavBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/app')) return null;

  return (
    <header className="sticky top-0 z-40 bg-arena/80 backdrop-blur-xl border-b border-bosque-600/5">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4 md:px-12">
        <Link to="/" className="flex items-center gap-4 group">
           <LogoPrincipal className="h-20 md:h-24 w-auto transition-transform group-hover:scale-105" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavPill to="/" label="Inicio" />
          <NavPill to="/directorio" label="Directorio" />
          <NavPill to="/agenda" label="Agenda" />
          <NavPill to="/mapa" label="Mapa" />
          <div className="ml-4 h-6 w-px bg-bosque-600/10 mx-2" />
          <Link
            to="/socio"
            className="btn-bosque px-6 py-2.5 text-sm"
          >
            Publicar
          </Link>
        </nav>

        <div className="flex md:hidden">
           <Link to="/directorio" className="p-2 text-carbon">
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
      className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
        active
          ? "text-bosque-600 bg-bosque-50"
          : "text-humo hover:text-carbon hover:bg-black/5"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileTabBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/app')) return null;

  const tabs = [
    { to: "/", label: "Inicio", Icon: IconCasa },
    { to: "/directorio", label: "Explorar", Icon: IconLupa },
    { to: "/socio", label: "Publicar", Icon: IconSello, fab: true },
    { to: "/agenda", label: "Agenda", Icon: Calendar },
    { to: "/perfil", label: "Perfil", Icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-6 pt-10 md:hidden pointer-events-none">
       <div className="absolute inset-0 bg-gradient-to-t from-arena/95 via-arena/60 to-transparent pointer-events-none" />
       <ul className="relative mx-auto flex max-w-md items-end justify-around rounded-[32px] border border-bosque-600/5 bg-white/95 p-2 shadow-elevada backdrop-blur-xl pointer-events-auto">
        {tabs.map(({ to, label, Icon, fab }, idx) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          if (fab) {
             return (
                <li key={to} className="relative -top-6">
                   <Link to={to} className="flex h-14 w-14 items-center justify-center rounded-full bg-bosque-600 text-white shadow-cta border-4 border-white active:scale-95 transition-transform">
                      <Plus size={28} />
                   </Link>
                </li>
             )
          }
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                  active ? "text-bosque-600" : "text-humo"
                }`}
              >
                <Icon size={24} strokeWidth={active ? 3 : 2} />
                <span className="text-[10px] font-bold tracking-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Simple icons for Mobile Tab Bar to avoid complex imports
function MapPinIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> }
function CalendarIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> }
function PlusIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> }

function Footer() {
  return (
    <footer className="bg-carbon py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <h3 className="font-mont text-2xl font-bold tracking-tight">DATO CURACAVÍ</h3>
            <p className="mt-6 text-arena/60 font-medium leading-relaxed">
              La plataforma oficial del Valle. Descubre eventos, servicios y picadas verificadas por nuestra comunidad.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-bosque-500 uppercase tracking-widest text-xs">Explorar</h4>
            <ul className="mt-6 space-y-4 text-arena/80 font-bold">
              <li><Link to="/" className="hover:text-bosque-400 transition-colors">Inicio</Link></li>
              <li><Link to="/directorio" className="hover:text-bosque-400 transition-colors">Directorio</Link></li>
              <li><Link to="/agenda" className="hover:text-bosque-400 transition-colors">Agenda Cultural</Link></li>
              <li><Link to="/mapa" className="hover:text-bosque-400 transition-colors">Mapa Interactivo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-bosque-500 uppercase tracking-widest text-xs">Comunidad</h4>
            <ul className="mt-6 space-y-4 text-arena/80 font-bold">
              <li><Link to="/socio" className="hover:text-bosque-400 transition-colors">Sumar mi negocio</Link></li>
              <li><Link to="/socio?tab=evento" className="hover:text-bosque-400 transition-colors">Publicar evento</Link></li>
              <li><Link to="/concierge" className="hover:text-bosque-400 transition-colors">El Concierge</Link></li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white/5 p-8 border border-white/10">
            <h4 className="font-bold">¿Tienes dudas?</h4>
            <p className="mt-2 text-sm text-arena/60">Escríbenos y te ayudamos a encontrar lo que buscas.</p>
            <button className="mt-6 w-full btn-bosque">
              Contactar Soporte
            </button>
          </div>
        </div>
        <div className="mt-20 border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-arena/30 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Dato Curacaví &middot; Marca Registrada</p>
          <div className="flex gap-8">
             <Link to="/privacidad">Privacidad</Link>
             <Link to="/terminos">Términos</Link>
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
  return (
    <div className="min-h-screen bg-arena selection:bg-bosque-600 selection:text-white">
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
              <Route path="/lugar/:slug" element={<Lugar />} />
              <Route path="/evento/:slug" element={<Evento />} />
              <Route path="/ruta" element={<Ruta />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileTabBar />
      <FloatingConcierge />
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
