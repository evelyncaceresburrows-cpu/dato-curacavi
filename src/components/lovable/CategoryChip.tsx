/**
 * CategoryChip — pill seleccionable de categoría.
 * Portado de Lovable. Compatible con cualquier ícono lucide-react.
 */
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryChip({ label, icon: Icon, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? "var(--terracotta)" : "var(--card)",
        color: active ? "var(--cream)" : "var(--ink)",
        borderColor: active ? "var(--terracotta)" : "var(--border)",
      }}
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={1.8} />}
      {label}
    </button>
  );
}
