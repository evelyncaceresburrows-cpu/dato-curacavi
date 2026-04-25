import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
  elevated?: boolean;
}

/**
 * Card — contenedor blanco con esquinas redondeadas y sombra tarjeta.
 * Si recibe `to`, se renderiza como `<Link>` (sin cambios visuales).
 */
export function Card({ children, to, onClick, className = "", elevated }: Props) {
  const base = `block rounded-3xl bg-white border border-bosque-600/5 ${
    elevated ? "shadow-elevada" : "shadow-tarjeta"
  } ${className}`;

  if (to) {
    return (
      <Link to={to} className={`${base} transition-transform hover:-translate-y-0.5`}>
        {children}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} text-left w-full`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}
