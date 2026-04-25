import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  filters?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "¿Qué buscas hoy?",
  filters = false,
}: Props) {
  return (
    <div className="search-pill">
      <Search size={18} strokeWidth={2.2} className="text-humo" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-carbon placeholder:text-humo"
      />
      {filters && (
        <button
          aria-label="Filtros"
          className="grid h-8 w-8 place-items-center rounded-full bg-bosque-50 text-bosque-600"
        >
          <SlidersHorizontal size={16} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}
