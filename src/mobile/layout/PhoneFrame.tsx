import type { ReactNode } from "react";

/**
 * Marco iPhone tipo preview.
 * En móviles reales (< 430px) se apaga y se muestra full-bleed.
 * En desktop dibuja un iPhone 14 con notch, sombra profunda y
 * status bar 9:41.
 */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-slate-100 to-slate-200 pb-12 pt-6 md:pt-10 lg:pt-14">
      <div className="mx-auto w-full max-w-[430px] md:iphone-frame md:relative md:!max-w-[412px]">
        <span className="hidden md:block iphone-notch" aria-hidden />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
