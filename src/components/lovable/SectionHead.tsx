/**
 * SectionHead — title h3 Fraunces + sub muted + acción a la derecha.
 * Variante editorial del mockup. Portado del mockup Claude Design.
 */
import type { ReactNode } from "react";

interface Props {
  title: string;
  sub?: string;
  action?: ReactNode;
}

export function SectionHead({ title, sub, action }: Props) {
  return (
    <div
      className="mb-3 flex items-end justify-between"
      style={{ padding: "0 18px" }}
    >
      <div>
        <h3
          className="font-fraunces"
          style={{
            margin: 0,
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            lineHeight: 1.1,
          }}
        >
          {title}
        </h3>
        {sub && (
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              marginTop: 4,
              letterSpacing: "-0.005em",
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}
