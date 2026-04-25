import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** mobile: bottom sheet / desktop: modal centrado */
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

/**
 * Sheet — modal responsive.
 * Mobile: bottom-sheet con handle.
 * Desktop: tarjeta centrada con fondo oscuro.
 */
export function Sheet({ open, onClose, title, children, footer, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-carbon/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className={`relative flex w-full ${SIZES[size]} max-h-[92vh] flex-col overflow-hidden rounded-t-[32px] md:rounded-[32px] bg-arena shadow-elevada md:mx-4 animate-in slide-in-from-bottom-6 duration-300`}
      >
        {/* Handle mobile */}
        <div className="flex justify-center pt-2 md:hidden">
          <div className="h-1.5 w-12 rounded-full bg-carbon/10" />
        </div>

        {/* Header */}
        <header className="flex items-center justify-between px-6 pt-5 pb-3">
            {title && (
              <h3 className="font-mont text-lg font-extrabold text-carbon truncate">
                {title}
              </h3>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-carbon shadow-tarjeta transition-transform active:scale-90"
            >
              <X size={18} />
            </button>
          </header>

        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>

        {footer && (
          <footer className="border-t border-bosque-600/5 bg-white px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
