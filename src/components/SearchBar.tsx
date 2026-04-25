import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/**
 * Minimal Search — línea inferior finita, sin borde de
 * caja. Tipografía serifa en el placeholder para amarrarlo
 * a la identidad editorial del valle.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "¿Qué se le ofrece hoy, vecino?",
}: SearchBarProps) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-tierra transition-colors group-focus-within:text-parral">
        <Search size={22} strokeWidth={1.25} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 border-b border-tierra-200 bg-transparent px-8 py-4 font-serif text-lg italic tracking-tight text-tierra-900 outline-none transition-colors placeholder:italic placeholder:text-tierra-200 focus:border-parral sm:text-xl"
        aria-label="Buscar en la guía del valle"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-parral via-chicha to-parral transition-transform duration-300 group-focus-within:scale-x-100" />
    </div>
  );
}
