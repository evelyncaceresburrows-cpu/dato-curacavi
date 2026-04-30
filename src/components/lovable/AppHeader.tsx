/**
 * AppHeader — header del top de cada pantalla mobile.
 * Logo a la izquierda (DatoMark + Wordmark inline si no hay back),
 * botón back en círculo paper si `back=true`, acción opcional a la derecha.
 *
 * Portado del mockup Claude Design (ui.jsx > AppHeader).
 */
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { DatoMark } from "./DatoMark";
import { Wordmark } from "./Wordmark";

interface Props {
  title?: string;
  back?: boolean;
  onBack?: () => void;
  action?: ReactNode;
}

export function AppHeader({ title, back, onBack, action }: Props) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-between gap-3"
      style={{ padding: "8px 18px 12px", background: "transparent" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {back ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--border-soft)",
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.4} style={{ color: "var(--ink)" }} />
          </button>
        ) : (
          <DatoMark size={28} />
        )}
        {title ? (
          <div
            className="min-w-0 truncate font-fraunces"
            style={{
              fontWeight: 500,
              fontSize: 19,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
        ) : (
          <Wordmark size={15} inline />
        )}
      </div>
      {action}
    </div>
  );
}
