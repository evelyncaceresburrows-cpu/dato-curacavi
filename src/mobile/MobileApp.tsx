import { useState } from "react";
import StatusBar from "./layout/StatusBar";
import BottomNav, { type MobileTab } from "./layout/BottomNav";
import BrandLogo from "./layout/BrandLogo";
import PhoneFrame from "./layout/PhoneFrame";
import Home from "./screens/Home";
import Agenda from "./screens/Agenda";
import ExplorarMapa from "./screens/ExplorarMapa";
import PerfilNegocio from "./screens/PerfilNegocio";
import PublicarEvento from "./screens/PublicarEvento";
import Guardados from "./screens/Guardados";
import Perfil from "./screens/Perfil";

/**
 * Raíz de la experiencia mobile Dato 68.
 * Usa un state-router simple para no anidar BrowserRouter.
 * En desktop se envuelve en un PhoneFrame (iPhone).
 */

type Ruta =
  | { name: "home" }
  | { name: "agenda" }
  | { name: "explorar" }
  | { name: "guardados" }
  | { name: "perfil" }
  | { name: "lugar"; id: string }
  | { name: "publicar" };

export default function MobileApp() {
  const [ruta, setRuta] = useState<Ruta>({ name: "home" });
  const tab: MobileTab = (() => {
    switch (ruta.name) {
      case "home":
        return "inicio";
      case "explorar":
        return "explorar";
      case "publicar":
        return "publicar";
      case "guardados":
        return "guardados";
      case "perfil":
        return "perfil";
      default:
        return "inicio";
    }
  })();

  const onTab = (t: MobileTab) => {
    if (t === "inicio") setRuta({ name: "home" });
    else if (t === "explorar") setRuta({ name: "explorar" });
    else if (t === "publicar") setRuta({ name: "publicar" });
    else if (t === "guardados") setRuta({ name: "guardados" });
    else setRuta({ name: "perfil" });
  };

  const hideTopBar =
    ruta.name === "lugar" ||
    ruta.name === "publicar" ||
    ruta.name === "explorar";

  return (
    <PhoneFrame>
      <div className="mobile-shell relative">
        {/* StatusBar iOS */}
        <StatusBar variant="dark" />

        {/* Top bar con logo (oculto en detalle/publicar/mapa) */}
        {!hideTopBar && (
          <div className="flex items-center justify-between px-5 pt-1 pb-2">
            <BrandLogo size="sm" />
          </div>
        )}

        {/* Content */}
        {ruta.name === "home" && (
          <Home
            onOpenLugar={(id) => setRuta({ name: "lugar", id })}
            onOpenAgenda={() => setRuta({ name: "agenda" })}
          />
        )}
        {ruta.name === "agenda" && (
          <Agenda onOpenPublicar={() => setRuta({ name: "publicar" })} />
        )}
        {ruta.name === "explorar" && (
          <ExplorarMapa
            onOpenLugar={(id) => setRuta({ name: "lugar", id })}
          />
        )}
        {ruta.name === "guardados" && (
          <Guardados
            onOpenLugar={(id) => setRuta({ name: "lugar", id })}
          />
        )}
        {ruta.name === "perfil" && (
          <Perfil onOpenLugar={(id) => setRuta({ name: "lugar", id })} />
        )}
        {ruta.name === "lugar" && (
          <PerfilNegocio
            lugarId={ruta.id}
            onBack={() => setRuta({ name: "home" })}
          />
        )}
        {ruta.name === "publicar" && (
          <PublicarEvento onClose={() => setRuta({ name: "home" })} />
        )}

        {/* Bottom tab-bar */}
        <BottomNav active={tab} onChange={onTab} />
      </div>
    </PhoneFrame>
  );
}
