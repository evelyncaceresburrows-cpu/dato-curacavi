/**
 * Semilla única de Dato Curacaví.
 *
 * Esta es la ÚNICA fuente de verdad offline de la app. Cuando
 * `VITE_SUPABASE_URL` no esté configurado o falle el fetch,
 * los hooks (useComercios / useEventos) caen acá para no
 * romperle la experiencia al vecino.
 *
 * Fichas derivadas de KNOWLEDGE.md (Base Excel Abril 2026).
 */

import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  Cookie,
  Wine,
  Mountain,
  ShoppingBag,
  Wrench,
  BedDouble,
  Siren,
  Briefcase,
  Palette,
  Music,
  Trees,
  PersonStanding,
  Star,
  Ellipsis,
} from "lucide-react";

// ─── Tipos canónicos ──────────────────────────────────────────────────────────

export type Categoria =
  | "picadas"
  | "dulces"
  | "chicha"
  | "panoramas"
  | "servicios"
  | "tramites"
  | "emprendimientos"
  | "alojamientos"
  | "cultura"
  | "emergencias";

/** Estado SmartPicadaSearch según KNOWLEDGE.md */
export type EstadoDato = "socio_pro" | "verificado" | "por_confirmar";

export interface CategoriaDef {
  key: Categoria;
  label: string;
  short: string; // etiqueta corta para chips
  Icon: LucideIcon;
  color: string; // color de pin / burbuja
}

export const CATEGORIAS: CategoriaDef[] = [
  { key: "picadas",        label: "Picadas",         short: "Picadas",  Icon: UtensilsCrossed, color: "#E06C4B" },
  { key: "dulces",         label: "Dulces y panes",  short: "Dulces",   Icon: Cookie,          color: "#E1A63B" },
  { key: "chicha",         label: "Vino y chicha",   short: "Vino y chicha", Icon: Wine,           color: "#7C52B5" },
  { key: "panoramas",      label: "Panoramas",       short: "Panoramas", Icon: Mountain,       color: "#1F6B45" },
  { key: "servicios",      label: "Servicios",       short: "Servicios", Icon: Wrench,         color: "#2F5AA0" },
  { key: "tramites",       label: "Trámites",        short: "Trámites", Icon: Briefcase,       color: "#2D8F8A" },
  { key: "emprendimientos",label: "Emprendimientos", short: "Tiendas",  Icon: ShoppingBag,     color: "#C25450" },
  { key: "alojamientos",   label: "Alojamientos",    short: "Dormir",   Icon: BedDouble,       color: "#5E6FA4" },
  { key: "cultura",        label: "Cultura",         short: "Cultura",  Icon: Palette,         color: "#B55279" },
  { key: "emergencias",    label: "Emergencias",     short: "Urgencia", Icon: Siren,           color: "#B13A3A" },
];

export function categoriaDef(key: Categoria): CategoriaDef {
  return CATEGORIAS.find((c) => c.key === key) ?? CATEGORIAS[0];
}

/** Grupo de navegación rápida en Home (6 círculos). */
export const CATEGORIAS_HOME_KEYS: Categoria[] = [
  "panoramas",
  "picadas",
  "chicha",
  "dulces",
  "servicios",
  "emprendimientos",
];

// ─── Comercios ────────────────────────────────────────────────────────────────

export interface Comercio {
  id: string;
  slug: string;
  nombre: string;
  categoria: Categoria;
  subtitulo: string;
  descripcion: string;
  direccion: string;
  telefono?: string;
  whatsapp?: string;
  web?: string;
  email?: string;
  precio: "$" | "$$" | "$$$";
  rating: number;
  reviews: number;
  estado: EstadoDato;
  abiertoHasta?: string;
  imagen: string; // CSS background (gradiente placeholder) o URL
  destacados?: string[];
  coords: { x: number; y: number }; // 0-100 posición relativa en el mapa SVG
  lat?: number;
  lng?: number;
  distanciaKm?: number;
  /** Galería de fotos extras (máx 6). Se muestra en /lugar/:slug. */
  imagenesExtra?: string[];
}

export const COMERCIOS: Comercio[] = [
  {
    id: "dulces-issa",
    slug: "dulces-issa",
    nombre: "Dulces Issa",
    categoria: "dulces",
    subtitulo: "Dulces chilenos · 3 sucursales + delivery",
    descripcion:
      "Empolvados, alfajores y dulces típicos como los hacía la abuela. Parada obligada del valle y referencia identitaria de Curacaví.",
    direccion: "Av. Ambrosio O'Higgins, Curacaví centro",
    telefono: "+56 2 2935 0001",
    whatsapp: "+56988001234",
    web: "dulcesissa.cl",
    precio: "$$",
    rating: 4.9,
    reviews: 312,
    estado: "socio_pro",
    abiertoHasta: "20:00",
    imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Receta de familia", "3 sucursales", "Delivery"],
    coords: { x: 52, y: 48 },
  },
  {
    id: "chicha-estadio",
    slug: "chicha-estadio-julio-riesco",
    nombre: "Chicha del Estadio Julio Riesco",
    categoria: "chicha",
    subtitulo: "Agrupación de productores · Venta directa",
    descripcion:
      "Chicha fresca, moscatel y asoleado. Productores locales verificados. Venta directa los fines de semana durante la Fiesta de la Chicha 2026.",
    direccion: "Estadio Julio Riesco, Curacaví",
    telefono: "+56 9 7711 2233",
    precio: "$",
    rating: 4.8,
    reviews: 156,
    estado: "socio_pro",
    abiertoHasta: "22:00",
    imagen: "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Fiesta de la Chicha 2026", "Venta directa"],
    coords: { x: 36, y: 30 },
  },
  {
    id: "la-casona",
    slug: "la-casona-de-curacavi",
    nombre: "La Casona de Curacaví",
    categoria: "picadas",
    subtitulo: "Casona patrimonial · Cocinería & artesanía",
    descripcion:
      "Casona colonial de 1840 con patio, cocinería, dulces y artesanía. Panorama familiar completo.",
    direccion: "Av. Ambrosio O'Higgins 2750",
    telefono: "+56 2 2935 0000",
    precio: "$$",
    rating: 4.7,
    reviews: 198,
    estado: "socio_pro",
    abiertoHasta: "21:00",
    imagen: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Patrimonio 1840", "Familiar"],
    coords: { x: 60, y: 60 },
  },
  {
    id: "curacaribs",
    slug: "curacaribs",
    nombre: "CuracaRibs",
    categoria: "picadas",
    subtitulo: "Smokehouse · Costillas ahumadas",
    descripcion:
      "Smokehouse en la histórica Hostería Antumapu. Costillas ahumadas al estilo texano, parrilla grande.",
    direccion: "Hostería Antumapu",
    telefono: "+56 9 4422 1100",
    precio: "$$",
    rating: 4.6,
    reviews: 84,
    estado: "socio_pro",
    abiertoHasta: "23:00",
    imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Ahumado texano", "Reservar"],
    coords: { x: 72, y: 42 },
  },
  {
    id: "la-pica",
    slug: "la-pica-de-curacavi",
    nombre: "La Picá de Curacaví",
    categoria: "picadas",
    subtitulo: "Restaurante · Comida chilena",
    descripcion:
      "Comida casera, platos abundantes y ambiente campestre. Ideal para familias.",
    direccion: "Camino El Toro 350, Curacaví",
    telefono: "+56 9 1234 5678",
    whatsapp: "+56912345678",
    precio: "$$",
    rating: 4.7,
    reviews: 128,
    estado: "socio_pro",
    abiertoHasta: "22:00",
    imagen: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Buena atención", "Ideal familias", "Precios justos"],
    coords: { x: 28, y: 52 },
    distanciaKm: 1.2,
  },
  {
    id: "cafe-patio",
    slug: "cafe-del-patio",
    nombre: "Café del Patio",
    categoria: "picadas",
    subtitulo: "Café & Pastelería",
    descripcion:
      "Repostería artesanal y desayunos de campo. Terraza bajo parrones con flores silvestres.",
    direccion: "Ambrosio O'Higgins 1520, Curacaví",
    telefono: "+56 2 2835 1200",
    precio: "$$",
    rating: 4.6,
    reviews: 96,
    estado: "verificado",
    abiertoHasta: "20:30",
    imagen: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Repostería propia", "Pet-friendly"],
    coords: { x: 54, y: 34 },
    distanciaKm: 0.6,
  },
  {
    id: "vina-altar-uco",
    slug: "vina-altar-uco",
    nombre: "Viña Altar Uco",
    categoria: "chicha",
    subtitulo: "Viña & Tours",
    descripcion:
      "Tour de viñedos con cata de chichas patrimoniales y vinos naturales del valle.",
    direccion: "Camino El Durazno s/n, Curacaví",
    telefono: "+56 9 8001 2245",
    web: "altaruco.cl",
    precio: "$$$",
    rating: 4.9,
    reviews: 74,
    estado: "socio_pro",
    abiertoHasta: "19:00",
    imagen: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Tour guiado", "Cata incluida"],
    coords: { x: 18, y: 22 },
    distanciaKm: 4.1,
  },
  {
    id: "chicheria-don-pancho",
    slug: "chicheria-don-pancho",
    nombre: "Chichería Don Pancho",
    categoria: "chicha",
    subtitulo: "Chicha artesanal · Venta por garrafa",
    descripcion:
      "Chicha artesanal centenaria. Pase, pruebe de la cuba y llévese garrafa para el fin de semana.",
    direccion: "Camino a Cuyuncaví s/n",
    telefono: "+56 9 8800 1122",
    precio: "$",
    rating: 4.5,
    reviews: 67,
    estado: "verificado",
    abiertoHasta: "20:00",
    imagen: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Tradición centenaria"],
    coords: { x: 22, y: 68 },
  },
  {
    id: "panaderia-espiga",
    slug: "panaderia-la-espiga",
    nombre: "Panadería La Espiga",
    categoria: "dulces",
    subtitulo: "Pan amasado · Empanadas de pino",
    descripcion:
      "Pan amasado caliente desde las 7 AM y empanadas de pino los fines de semana. La fila lo dice todo.",
    direccion: "Javiera Carrera 410",
    telefono: "+56 9 7654 3210",
    precio: "$",
    rating: 4.6,
    reviews: 143,
    estado: "verificado",
    abiertoHasta: "21:00",
    imagen: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Pan amasado 7AM", "Empanadas finde"],
    coords: { x: 46, y: 54 },
  },
  {
    id: "feria-libre",
    slug: "feria-libre-curacavi",
    nombre: "Feria Libre Javiera Carrera",
    categoria: "picadas",
    subtitulo: "Feria dominical · Verdura fresca",
    descripcion:
      "Domingo en la mañana: verdura fresca, pescado de la costa y mote con huesillo al paso.",
    direccion: "Calle Javiera Carrera, sector centro",
    precio: "$",
    rating: 4.5,
    reviews: 210,
    estado: "verificado",
    abiertoHasta: "14:00",
    imagen: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Domingo AM", "Productos del valle"],
    coords: { x: 48, y: 52 },
  },
  {
    id: "parque-higgins",
    slug: "parque-ambrosio-ohiggins",
    nombre: "Parque Ambrosio O'Higgins",
    categoria: "panoramas",
    subtitulo: "Áreas verdes · Libre acceso",
    descripcion:
      "Pulmón verde del centro: árboles añosos, juegos infantiles y cicletada familiar los domingos.",
    direccion: "Av. Ambrosio O'Higgins, Curacaví",
    precio: "$",
    rating: 4.5,
    reviews: 210,
    estado: "verificado",
    abiertoHasta: "21:00",
    imagen: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Cicletada dominical", "Juegos infantiles"],
    coords: { x: 40, y: 72 },
    distanciaKm: 0.9,
  },
  {
    id: "farmacia-comunal",
    slug: "farmacia-comunal-curacavi",
    nombre: "Farmacia Comunal Curacaví",
    categoria: "servicios",
    subtitulo: "Medicamentos precio justo · Vecinos inscritos",
    descripcion:
      "Medicamentos a precio justo para vecinos inscritos. De lunes a viernes, retire por número.",
    direccion: "Plaza Presidente Balmaceda",
    telefono: "+56 2 2935 1212",
    precio: "$",
    rating: 4.7,
    reviews: 89,
    estado: "verificado",
    abiertoHasta: "18:00",
    imagen: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Precio justo", "Vecinos inscritos"],
    coords: { x: 50, y: 50 },
  },
  {
    id: "talleres-curacavi",
    slug: "talleres-curacavi",
    nombre: "Talleres Curacaví",
    categoria: "servicios",
    subtitulo: "Mecánica & Desabolladura",
    descripcion:
      "Taller familiar con atención de lunes a sábado. Trabajan con seguros particulares.",
    direccion: "Ruta 68 Km 42, Curacaví",
    telefono: "+56 9 7007 4411",
    precio: "$$",
    rating: 4.2,
    reviews: 45,
    estado: "por_confirmar",
    abiertoHasta: "19:00",
    imagen: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Ruta 68", "Trabaja con seguros"],
    coords: { x: 78, y: 40 },
    distanciaKm: 2.6,
  },
  {
    id: "mecanica-compadre",
    slug: "mecanica-el-compadre",
    nombre: "Mecánica El Compadre",
    categoria: "servicios",
    subtitulo: "Frenos & diagnóstico al tiro",
    descripcion:
      "Frenos y diagnóstico al tiro. Atiende sábado en la mañana sin pedir hora.",
    direccion: "Cerrillos 122",
    telefono: "+56 9 7766 5544",
    precio: "$$",
    rating: 4.4,
    reviews: 52,
    estado: "verificado",
    abiertoHasta: "19:00",
    imagen: "https://images.unsplash.com/photo-1530046339915-78e95d7b73ee?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Sin hora sábados"],
    coords: { x: 66, y: 66 },
  },
  {
    id: "municipalidad",
    slug: "municipalidad-curacavi",
    nombre: "Municipalidad de Curacaví",
    categoria: "tramites",
    subtitulo: "Central digital · 100 líneas",
    descripcion:
      "Nueva central telefónica digital. Convenio de gas, retiro de ramas, permisos. Todo en línea.",
    direccion: "municipalidadcuracavi.cl · Centro cívico",
    telefono: "+56 2 3214 1100",
    precio: "$",
    rating: 4.3,
    reviews: 87,
    estado: "socio_pro",
    abiertoHasta: "17:00",
    imagen: "https://images.unsplash.com/photo-1541872703-74c5e44368f4?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["Enero 2026", "100 llamados simultáneos"],
    coords: { x: 50, y: 50 },
  },
  {
    id: "seguridad-municipal",
    slug: "seguridad-municipal",
    nombre: "Seguridad Municipal",
    categoria: "emergencias",
    subtitulo: "Patrullaje 24/7 · *4129",
    descripcion:
      "Patrullaje preventivo 24/7 y denuncia vecinal. Llamado directo al centro de operaciones.",
    direccion: "Central comunal, Curacaví",
    telefono: "*4129",
    precio: "$",
    rating: 4.8,
    reviews: 342,
    estado: "socio_pro",
    abiertoHasta: "24h",
    imagen: "https://images.unsplash.com/photo-1587398427094-26f24d35a51e?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["*4129", "24/7"],
    coords: { x: 50, y: 48 },
  },
  {
    id: "bomberos",
    slug: "bomberos-curacavi",
    nombre: "Bomberos de Curacaví",
    categoria: "emergencias",
    subtitulo: "132 · Voluntariado del valle",
    descripcion:
      "Cuerpo de Bomberos local, voluntariado del valle. Emergencia y rescate.",
    direccion: "Compañía comunal",
    telefono: "132",
    precio: "$",
    rating: 5.0,
    reviews: 289,
    estado: "socio_pro",
    abiertoHasta: "24h",
    imagen: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    destacados: ["132", "Rescate"],
    coords: { x: 52, y: 46 },
  },
];

// ─── Eventos ──────────────────────────────────────────────────────────────────

export type CategoriaEvento =
  | "musica"
  | "gastro"
  | "cultura"
  | "deporte"
  | "naturaleza"
  | "tradicional";

export interface Evento {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  fecha: string; // ISO "2026-05-25" (inicio si es rango)
  /** Fecha de cierre cuando el evento dura varios dias (ej. fiesta de la
   *  chicha 30 abr → 2 may). Si null, evento de un solo dia. */
  fechaFin?: string;
  hora: string; // "08:00"
  lugar: string;
  comercioId?: string;
  categoria: CategoriaEvento;
  tags: string[];
  chipColor: string;
  imagen: string;
  estado: EstadoDato;
  gratis?: boolean;
  precio?: string;
}

export const EVENTOS_CATEGORIAS: {
  key: CategoriaEvento | "todos";
  label: string;
  Icon: LucideIcon;
  color: string;
}[] = [
  { key: "todos",       label: "Todos",       Icon: Star,            color: "#1F6B45" },
  { key: "tradicional", label: "Tradición",   Icon: Star,            color: "#E6DEF4" },
  { key: "musica",      label: "Música",      Icon: Music,           color: "#E6DEF4" },
  { key: "gastro",      label: "Gastronomía", Icon: UtensilsCrossed, color: "#FADBC1" },
  { key: "cultura",     label: "Cultura",     Icon: Palette,         color: "#FADCE0" },
  { key: "deporte",     label: "Deporte",     Icon: PersonStanding,  color: "#FCE5B6" },
  { key: "naturaleza",  label: "Naturaleza",  Icon: Trees,           color: "#D8E9F4" },
];

export const EVENTOS: Evento[] = [
  {
    id: "fiesta-chicha-2026",
    slug: "fiesta-chicha-2026",
    titulo: "Fiesta de la Chicha 2026",
    descripcion:
      "Entrada liberada · Bafochi, La Combo Tortuga, Pailita y Potencia. Tres días de chicha fresca, música en vivo y tradición del valle.",
    fecha: "2026-04-30",
    hora: "17:00",
    lugar: "Estadio Julio Riesco",
    comercioId: "chicha-estadio",
    categoria: "tradicional",
    tags: ["Gratis", "Familiar", "Tradicional"],
    chipColor: "#D7ECDD",
    imagen: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    estado: "socio_pro",
    gratis: true,
  },
  {
    id: "feria-libre",
    slug: "feria-libre-javiera-carrera",
    titulo: "Feria Libre de Curacaví",
    descripcion:
      "Productos locales, artesanías, comida típica y verdura fresca directo del productor.",
    fecha: "2026-05-25",
    hora: "08:00",
    lugar: "Plaza Presidente Balmaceda",
    categoria: "gastro",
    tags: ["Feria", "Familiar", "Al aire libre"],
    chipColor: "#FADBC1",
    imagen: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    estado: "socio_pro",
    gratis: true,
  },
  {
    id: "noche-sabores",
    slug: "noche-de-sabores",
    titulo: "Noche de Sabores",
    descripcion:
      "Patio de comidas y música en vivo con productores del valle.",
    fecha: "2026-05-25",
    hora: "20:00",
    lugar: "Patio de Comidas La Viña",
    categoria: "musica",
    tags: ["Música", "Gastronomía"],
    chipColor: "#E6DEF4",
    imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    estado: "socio_pro",
    precio: "$8.000",
  },
  {
    id: "taller-ceramica",
    slug: "taller-ceramica",
    titulo: "Taller de Cerámica",
    descripcion:
      "Crea tu propia pieza en torno y llévatela la semana siguiente ya cocida.",
    fecha: "2026-05-28",
    hora: "16:00",
    lugar: "Centro Cultural de Curacaví",
    categoria: "cultura",
    tags: ["Cultura", "Presencial"],
    chipColor: "#FADCE0",
    imagen: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    estado: "verificado",
    precio: "$15.000",
  },
  {
    id: "trekking-la-cruz",
    slug: "trekking-cerro-la-cruz",
    titulo: "Trekking Cerro La Cruz",
    descripcion:
      "Dificultad media · 4 horas. Salida desde la plaza con guía local.",
    fecha: "2026-06-02",
    hora: "09:00",
    lugar: "Cerro La Cruz",
    categoria: "deporte",
    tags: ["Deporte", "Naturaleza"],
    chipColor: "#FCE5B6",
    imagen: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&q=80&auto=format&fit=crop&fm=jpg",
    estado: "verificado",
    gratis: true,
  },
];

// ─── Números del vecino (emergencias rápidas) ────────────────────────────────

export const NUMEROS_VECINO = [
  { titulo: "Seguridad Municipal", numero: "*4129", nota: "Patrullaje 24/7 · Denuncia vecinal" },
  { titulo: "Bomberos",            numero: "132",   nota: "Emergencia y rescate" },
  { titulo: "Carabineros",         numero: "133",   nota: "Plan Cuadrante" },
  { titulo: "SAMU",                numero: "131",   nota: "Ambulancia y urgencia médica" },
  { titulo: "Municipalidad",       numero: "2 3214 1100", nota: "Central digital · 100 líneas" },
];

/** Alias legacy para componentes viejos (lib/mockData / NumerosDelVecino). */
export const NUMEROS_DEL_VECINO = NUMEROS_VECINO;

// ─── Dato del día / semana ───────────────────────────────────────────────────

/**
 * Editorial del día. Apunta a un comercio socio_pro por ID.
 */
export const DATO_DEL_DIA = {
  comercioId: "dulces-issa",
  eventoId: "feria-libre",
  copete: "Antes de que se terminen los empolvados del sábado, pásese por acá:",
  titular: "Dulces Issa — tradición curacavinana al paso.",
  nota:
    "Receta de familia con décadas en el valle. Si anda de paso por la Ruta 68, es la parada dulce que sí vale desviarse cinco minutos.",
};

/** Alias legacy (componentes viejos aún la llaman así). */
export const DATO_DE_LA_SEMANA = {
  comercio_id: "1",
  copete: DATO_DEL_DIA.copete,
  titular: DATO_DEL_DIA.titular,
  nota: DATO_DEL_DIA.nota,
};

// ─── Agenda: fechas derivadas de EVENTOS ─────────────────────────────────────

/**
 * Ventana de 7 días con marca si cae algún evento.
 * Deriva de EVENTOS para no duplicar información.
 */
export interface FechaAgenda {
  dia: string;  // "JUE"
  num: number;
  mes: string;  // "MAY"
  hasEvent: boolean;
  iso: string;  // "2026-05-23"
}

export function buildFechasAgenda(inicio = new Date()): FechaAgenda[] {
  const dias = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const meses = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  const out: FechaAgenda[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    out.push({
      dia: dias[d.getDay()],
      num: d.getDate(),
      mes: meses[d.getMonth()],
      hasEvent: EVENTOS.some((e) => e.fecha === iso),
      iso,
    });
  }
  return out;
}

/** Ventana de 7 días a partir del lanzamiento del piloto. */
export const FECHAS_AGENDA: FechaAgenda[] = buildFechasAgenda(
  new Date("2026-05-23T00:00:00")
);

// ─── Shim mobile legacy (src/mobile/data/mockData re-exports desde acá) ──────

/**
 * Adaptadores: convierten la taxonomía canónica a los shapes que aún esperan
 * algunos componentes heredados. Serán removidos cuando se caiga la duplicidad
 * web/mobile en Etapa 2.
 */

/** Categoría amplia del home mobile (6 chips). */
export const CATEGORIAS_HOME = CATEGORIAS_HOME_KEYS.map((k) => {
  const c = categoriaDef(k);
  return { key: c.key, label: c.short, color: c.color, Icon: c.Icon };
});

/** Categorías de agenda con "todos" al frente. */
export const CATEGORIAS_AGENDA = EVENTOS_CATEGORIAS;

/**
 * Lugares (alias de Comercios para componentes mobile legacy).
 * Campo `pinIcon` y `pinColor` derivan de la categoría.
 */
export const LUGARES = COMERCIOS.map((c) => {
  const def = categoriaDef(c.categoria);
  return {
    ...c,
    pinIcon: def.Icon,
    pinColor: def.color,
  };
});

/**
 * COMERCIOS_SEMILLA — estructura legacy (verificado/es_pro/descripcion_vecina).
 * Sólo se mantiene para los componentes del concierge (PicadasSkill) hasta
 * que migren a `Comercio` canónico.
 */
export const COMERCIOS_SEMILLA = COMERCIOS
  .filter((c) =>
    ["picadas", "dulces", "chicha", "tramites", "emergencias"].includes(c.categoria)
  )
  .map((c) => ({
    id: c.id,
    nombre: c.nombre,
    categoria: c.categoria as "picadas" | "dulces" | "chicha" | "tramites" | "emergencias",
    descripcion_vecina: c.descripcion,
    direccion: c.direccion,
    telefono: c.telefono,
    verificado: c.estado !== "por_confirmar",
    es_pro: c.estado === "socio_pro",
  }));

// ─── Utilidades ──────────────────────────────────────────────────────────────

export function comercioBySlug(slug: string): Comercio | undefined {
  return COMERCIOS.find((c) => c.slug === slug || c.id === slug);
}

export function eventoBySlug(slug: string): Evento | undefined {
  return EVENTOS.find((e) => e.slug === slug || e.id === slug);
}

/** Pondera socio_pro > verificado > por_confirmar */
export function pesoEstado(e: EstadoDato): number {
  return e === "socio_pro" ? 3 : e === "verificado" ? 2 : 1;
}

export function ordenarComercios(lista: Comercio[]): Comercio[] {
  return [...lista].sort(
    (a, b) =>
      pesoEstado(b.estado) - pesoEstado(a.estado) ||
      b.rating - a.rating
  );
}
