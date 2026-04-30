/**
 * SplashScreen — pantalla de bienvenida de ~800ms al primer load.
 * DatoMark + Wordmark + tagline en cream sólido. Fade-out a la salida.
 *
 * Solo se muestra en la primera visita de la sesión (sessionStorage flag).
 * Portado del mockup `Splash Screen-print.html`.
 */
import { useEffect, useState } from "react";
import { DatoMark } from "./DatoMark";
import { Wordmark } from "./Wordmark";

const STORAGE_KEY = "dato68_splash_seen";

export function SplashScreen() {
  // Estado: 'show' visible, 'fade' fade-out, 'gone' desmontado.
  const [stage, setStage] = useState<"show" | "fade" | "gone">(() => {
    if (typeof window === "undefined") return "gone";
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1" ? "gone" : "show";
    } catch {
      return "show";
    }
  });

  useEffect(() => {
    if (stage !== "show") return;
    const t1 = setTimeout(() => setStage("fade"), 800);
    const t2 = setTimeout(() => {
      setStage("gone");
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* private mode: ignorar */
      }
    }, 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [stage]);

  if (stage === "gone") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "var(--paper)",
        opacity: stage === "fade" ? 0 : 1,
        transition: "opacity 500ms ease-out",
        pointerEvents: stage === "fade" ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-7 px-6">
        <div
          style={{
            animation: "splashFade 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
          }}
        >
          <DatoMark size={140} />
        </div>
        <div
          style={{
            animation: "splashFade 700ms 200ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
          }}
        >
          <Wordmark size={42} />
        </div>
        <div
          className="font-fraunces italic text-center"
          style={{
            fontSize: 16,
            color: "var(--muted)",
            letterSpacing: "-0.01em",
            maxWidth: 220,
            animation:
              "splashFade 700ms 350ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
          }}
        >
          Todo lo que buscas, está aquí.
        </div>
      </div>
      <style>{`
        @keyframes splashFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
