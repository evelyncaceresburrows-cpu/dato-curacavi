import { Home, Search, Plus, Bookmark, User } from "lucide-react";

export type MobileTab = "inicio" | "explorar" | "publicar" | "guardados" | "perfil";

interface Props {
  active: MobileTab;
  onChange: (t: MobileTab) => void;
}

/**
 * Tab-bar inferior estilo iOS con botón FAB "+"
 * centrado y elevado. Replica el sistema de los mockups.
 */
export default function BottomNav({ active, onChange }: Props) {
  const items: { key: MobileTab; label: string; Icon: typeof Home }[] = [
    { key: "inicio", label: "Inicio", Icon: Home },
    { key: "explorar", label: "Explorar", Icon: Search },
  ];
  const right: { key: MobileTab; label: string; Icon: typeof Home }[] = [
    { key: "guardados", label: "Guardados", Icon: Bookmark },
    { key: "perfil", label: "Mi perfil", Icon: User },
  ];

  return (
    <nav className="tab-bar" aria-label="Navegación principal">
      <div className="tab-bar-inner">
        {items.map(({ key, label, Icon }) => {
          const a = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`tab-item ${a ? "tab-item-active" : ""}`}
            >
              <Icon size={22} strokeWidth={a ? 2.2 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}

        {/* FAB central */}
        <button
          onClick={() => onChange("publicar")}
          aria-label="Publicar"
          className="tab-fab"
        >
          <Plus size={26} strokeWidth={2.4} />
        </button>

        {right.map(({ key, label, Icon }) => {
          const a = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`tab-item ${a ? "tab-item-active" : ""}`}
            >
              <Icon size={22} strokeWidth={a ? 2.2 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
