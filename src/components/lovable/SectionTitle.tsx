/**
 * SectionTitle — header editorial: kicker + título display + lede + acción.
 * Portado de Lovable.
 */
import type { ReactNode } from "react";

interface Props {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  index?: string;
}

export function SectionTitle({ kicker, title, subtitle, action, index }: Props) {
  return (
    <div className="mb-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="hairline flex-1" />
        {index && (
          <span
            className="eyebrow-sm tabular"
            style={{ color: "var(--terracotta)" }}
          >
            {index}
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {kicker && (
            <div className="eyebrow mb-2" style={{ color: "var(--terracotta)" }}>
              {kicker}
            </div>
          )}
          <h2 className="display-md text-foreground">{title}</h2>
          {subtitle && <p className="lede mt-2.5">{subtitle}</p>}
        </div>
        {action ? <div className="self-start sm:self-auto">{action}</div> : null}
      </div>
    </div>
  );
}
