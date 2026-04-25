import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** opcional: componente custom para mostrar al fallar */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — captura errores de render del subárbol y muestra
 * un fallback amable al vecino en vez de una pantalla blanca.
 *
 * Uso: envolver <App /> en main.tsx o rutas específicas que puedan
 * fallar (lazy chunks, vistas que consumen Supabase, etc.).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Dato Curacaví] ErrorBoundary:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-arena">
        <div className="max-w-md text-center rounded-[32px] bg-white p-10 shadow-tarjeta border border-bosque-600/5">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-mont text-2xl font-extrabold text-carbon">
            Algo salió mal
          </h2>
          <p className="mt-3 text-humo font-medium">
            Tuvimos un problema cargando esta pantalla. Recarga la página y si
            persiste, avísanos por WhatsApp.
          </p>
          {this.state.error?.message && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-arena-50 p-3 text-left text-xs text-humo">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-8 flex flex-col md:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-bosque-600/10 bg-white px-6 py-3 font-bold text-carbon hover:bg-bosque-50"
            >
              <RefreshCcw size={16} />
              Reintentar
            </button>
            <a href="/" className="btn-bosque px-6 py-3">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}
