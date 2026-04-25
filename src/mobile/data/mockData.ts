/**
 * Data mock para la experiencia mobile de Dato Curacaví.
 * Todas las fichas provienen de KNOWLEDGE.md (base Excel 2026) o
 * son datos plausibles del valle marcados como "por_confirmar".
 */

import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  Mountain,
  ShoppingBag,
  Wrench,
  BedDouble,
  Music,
  Palette,
  PersonStanding,
  Trees,
  Star,
  Ellipsis,
} from "lucide-react";

export type EstadoDato = "socio_pro" | "verificado" | "por_confirmar";

export interface Categoria {
  key: string;
  label: string;
  color: string; // bg de la burbuja
  Icon: LucideIcon;
}

export const CATEGORIAS_HOME: Categoria[] = [
  { key: "panoramas", label: "Panoramas", color: "#1F6B45", Icon: Mountain },
  { key: "comer", label: "Comer", color: "#E06C4B", Icon: UtensilsCrossed },
  { key: "emprendimientos", label: "Emprendimientos", color: "#E1A63B", Icon: ShoppingBag },
  { key: "servicios", label: "Servicios", color: "#2F5AA0", Icon: Wrench },
  { key: "alojamientos", label: "Alojamientos", color: "#7C52B5", Icon: BedDouble },
  { key: "mas", label: "Más", color: "#2D8F8A", Icon: Ellipsis },
];

export const CATEGORIAS_AGENDA: Categoria[] = [
  { key: "todos", label: "Todos", color: "#1F6B45", Icon: Star },
  { key: "musica", label: "Música", color: "#E6DEF4", Icon: Music },
  { key: "gastro", label: "Gastronomía", color: "#FADBC1", Icon: UtensilsCrossed },
  { key: "cultura", label: "Cultura", color: "#FADCE0", Icon: Palette },
  { key: "deporte", label: "Deporte", color: "#FCE5B6", Icon: PersonStanding },
  { key: "naturaleza", label: "Naturaleza", color: "#D8E9F4", Icon: Trees },
];

export interface Lugar {
  id: string;
  nombre: string;
  categoria: "comer" | "panoramas" | "servicios" | "alojamientos" | "emprendimientos";
  subtitulo: string;
  precio: "$" | "$$" | "$$$";
  rating: number;
  reviews: number;
  direccion: string;
  telefono?: string;
  whatsapp?: string;
  web?: string;
  estado: EstadoDato;
  abiertoHasta?: string; // "22:00"
  imagen: string; // placeholder color/gradient + emoji
  descripcion: string;
  distanciaKm?: number;
  destacados?: string[];
  coords: { x: number; y: number }; // posición relativa en el mapa (0-100)
  pinColor: string;
  pinIcon: LucideIcon;
}

export const LUGARES: Lugar[] = [
  {
    id: "la-pica",
    nombre: "La Picá de Curacaví",
    categoria: "comer",
    subtitulo: "Restaurante · Comida chilena",
    precio: "$$",
    rating: 4.7,
    reviews: 128,
    direccion: "Camino El Toro 350, Curacaví",
    telefono: "+56 9 1234 5678",
    whatsapp: "+56912345678",
    web: "lapicadecuracavi.cl",
    estado: "socio_pro",
    abiertoHasta: "22:00",
    imagen:
      "linear-gradient(135deg, #6b4423, #8b5e34 45%, #c08552 100%)",
    descripcion:
      "Comida casera, platos abundantes y el mejor ambiente campestre de Curacaví. Ideal para familias y grupos.",
    distanciaKm: 1.2,
    destacados: ["Buena atención", "Ideal familias", "Precios justos"],
    coords: { x: 28, y: 52 },
    pinColor: "#E06C4B",
    pinIcon: UtensilsCrossed,
  },
  {
    id: "cafe-patio",
    nombre: "Café del Patio",
    categoria: "comer",
    subtitulo: "Café & Pastelería",
    precio: "$$",
    rating: 4.6,
    reviews: 96,
    direccion: "Ambrosio O'Higgins 1520, Curacaví",
    telefono: "+56 2 2835 1200",
    estado: "verificado",
    abiertoHasta: "20:30",
    imagen: "linear-gradient(135deg, #b08968, #d9bfa5)",
    descripcion:
      "Repostería artesanal y desayunos de campo. Terraza bajo parrones con flores silvestres.",
    distanciaKm: 0.6,
    destacados: ["Repostería propia", "Pet-friendly"],
    coords: { x: 54, y: 34 },
    pinColor: "#E1A63B",
    pinIcon: UtensilsCrossed,
  },
  {
    id: "vina-altar-uco",
    nombre: "Viña Altar Uco",
    categoria: "emprendimientos",
    subtitulo: "Viña & Tours",
    precio: "$$$",
    rating: 4.9,
    reviews: 74,
    direccion: "Camino El Durazno s/n, Curacaví",
    telefono: "+56 9 8001 2245",
    web: "altaruco.cl",
    estado: "socio_pro",
    abiertoHasta: "19:00",
    imagen: "linear-gradient(135deg, #2D5A27, #4F8748 55%, #9BBF88)",
    descripcion:
      "Tour de viñedos con cata de chichas patrimoniales y vinos naturales del valle.",
    distanciaKm: 4.1,
    destacados: ["Tour guiado", "Cata incluida"],
    coords: { x: 18, y: 22 },
    pinColor: "#7C52B5",
    pinIcon: ShoppingBag,
  },
  {
    id: "farmacia-curacavi",
    nombre: "Farmacia Curacaví",
    categoria: "servicios",
    subtitulo: "Salud & Bienestar",
    precio: "$",
    rating: 4.3,
    reviews: 38,
    direccion: "Ambrosio O'Higgins 1702, Curacaví",
    telefono: "+56 2 2835 0900",
    estado: "verificado",
    abiertoHasta: "21:00",
    imagen: "linear-gradient(135deg, #dfe7f5, #c3d3ef)",
    descripcion:
      "Farmacia comunitaria con servicio express y entrega a domicilio dentro del radio urbano.",
    distanciaKm: 0.4,
    destacados: ["Delivery barrio", "Convenio Fonasa"],
    coords: { x: 64, y: 58 },
    pinColor: "#E06C4B",
    pinIcon: ShoppingBag,
  },
  {
    id: "parque-higgins",
    nombre: "Parque Ambrosio O'Higgins",
    categoria: "panoramas",
    subtitulo: "Áreas verdes · Libre acceso",
    precio: "$",
    rating: 4.5,
    reviews: 210,
    direccion: "Av. Ambrosio O'Higgins, Curacaví",
    estado: "verificado",
    abiertoHasta: "21:00",
    imagen: "linear-gradient(135deg, #1F6B45, #4CA772 70%, #a7d3b4)",
    descripcion:
      "Pulmón verde del centro: árboles añosos, juegos infantiles y cicletada familiar los domingos.",
    distanciaKm: 0.9,
    destacados: ["Cicletada dominical", "Juegos infantiles"],
    coords: { x: 40, y: 72 },
    pinColor: "#1F6B45",
    pinIcon: Trees,
  },
  {
    id: "talleres-curacavi",
    nombre: "Talleres Curacaví",
    categoria: "servicios",
    subtitulo: "Mecánica & Desabolladura",
    precio: "$$",
    rating: 4.2,
    reviews: 45,
    direccion: "Ruta 68 Km 42, Curacaví",
    telefono: "+56 9 7007 4411",
    estado: "por_confirmar",
    abiertoHasta: "19:00",
    imagen: "linear-gradient(135deg, #6b6b6b, #8c8c8c)",
    descripcion:
      "Taller familiar con atención de lunes a sábado. Trabajan con seguros particulares.",
    distanciaKm: 2.6,
    destacados: ["Ruta 68", "Trabajo con seguros"],
    coords: { x: 78, y: 40 },
    pinColor: "#2F5AA0",
    pinIcon: Wrench,
  },
];

export interface Evento {
  id: string;
  titulo: string;
  descripcionCorta: string;
  fecha: string; // "2026-05-25"
  hora: string; // "08:00"
  lugar: string;
  categoria: "musica" | "gastro" | "cultura" | "deporte" | "naturaleza" | "todos";
  tipo: "destacado" | "fin_semana" | "proximo";
  tags: string[];
  chipColor: string;
  imagen: string;
  estado: EstadoDato;
}

export const EVENTOS: Evento[] = [
  {
    id: "feria-libre",
    titulo: "Feria Libre de Curacaví",
    descripcionCorta:
      "Productos locales, artesanías, comida típica y mucho más.",
    fecha: "2026-05-25",
    hora: "08:00",
    lugar: "Plaza Presidente Balmaceda",
    categoria: "gastro",
    tipo: "destacado",
    tags: ["Feria", "Familiar", "Al aire libre"],
    chipColor: "#D7ECDD",
    imagen:
      "linear-gradient(135deg, #2D5A27, #4F8748 40%, #bcd48a 75%, #f3e0b5)",
    estado: "socio_pro",
  },
  {
    id: "noche-sabores",
    titulo: "Noche de Sabores",
    descripcionCorta: "Patio de Comidas & Música en vivo",
    fecha: "2026-05-25",
    hora: "20:00",
    lugar: "Patio de Comidas La Viña",
    categoria: "musica",
    tipo: "destacado",
    tags: ["Música", "Gastronomía"],
    chipColor: "#E6DEF4",
    imagen: "linear-gradient(135deg, #2c1e3f, #6e3a7a 60%, #c88bbf)",
    estado: "socio_pro",
  },
  {
    id: "taller-ceramica",
    titulo: "Taller de Cerámica",
    descripcionCorta: "Crea tu propia pieza",
    fecha: "2026-05-28",
    hora: "16:00",
    lugar: "Centro Cultural de Curacaví",
    categoria: "cultura",
    tipo: "proximo",
    tags: ["Cultura", "Presencial"],
    chipColor: "#FADCE0",
    imagen: "linear-gradient(135deg, #bf8b6a, #d9b29c)",
    estado: "verificado",
  },
  {
    id: "trekking-la-cruz",
    titulo: "Trekking Cerro La Cruz",
    descripcionCorta: "Dificultad media · 4 hrs",
    fecha: "2026-06-02",
    hora: "09:00",
    lugar: "Cerro La Cruz",
    categoria: "deporte",
    tipo: "proximo",
    tags: ["Deporte", "Naturaleza"],
    chipColor: "#FCE5B6",
    imagen: "linear-gradient(135deg, #4a6a41, #8aa57b 55%, #cfd8b7)",
    estado: "verificado",
  },
  {
    id: "fiesta-chicha",
    titulo: "Fiesta de la Chicha 2026",
    descripcionCorta:
      "Entrada liberada · Bafochi, La Combo Tortuga, Pailita y Potencia.",
    fecha: "2026-04-30",
    hora: "17:00",
    lugar: "Estadio Julio Riesco",
    categoria: "gastro",
    tipo: "fin_semana",
    tags: ["Tradicional", "Familiar", "Gratis"],
    chipColor: "#D7ECDD",
    imagen:
      "linear-gradient(135deg, #7a4203, #D97706 55%, #FDE4C1)",
    estado: "socio_pro",
  },
];

export interface Notificacion {
  id: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  tipo: "evento" | "promocion" | "novedad";
}

export const NOTIFICACIONES: Notificacion[] = [
  {
    id: "n1",
    titulo: "Hoy es Feria Libre de Curacaví",
    descripcion: "Desde las 08:00 hrs en Plaza Presidente Balmaceda.",
    tiempo: "Hace 1 hora",
    tipo: "evento",
  },
  {
    id: "n2",
    titulo: "Noche de Sabores hoy",
    descripcion: "20:00 hrs en Patio La Viña.",
    tiempo: "Hace 3 horas",
    tipo: "evento",
  },
  {
    id: "n3",
    titulo: "Nuevo en Dato Curacaví",
    descripcion: "Café del Patio se sumó a la comunidad.",
    tiempo: "Hace 1 día",
    tipo: "novedad",
  },
  {
    id: "n4",
    titulo: "Promoción especial",
    descripcion: "2x1 en cafés hasta el domingo.",
    tiempo: "Hace 2 días",
    tipo: "promocion",
  },
];

export const FECHAS_AGENDA = [
  { dia: "JUE", num: 23, mes: "MAY", hasEvent: true },
  { dia: "VIE", num: 24, mes: "MAY", hasEvent: true },
  { dia: "SÁB", num: 25, mes: "MAY", hasEvent: true },
  { dia: "DOM", num: 26, mes: "MAY", hasEvent: true },
  { dia: "LUN", num: 27, mes: "MAY", hasEvent: false },
  { dia: "MAR", num: 28, mes: "MAY", hasEvent: true },
  { dia: "MIÉ", num: 29, mes: "MAY", hasEvent: false },
];
