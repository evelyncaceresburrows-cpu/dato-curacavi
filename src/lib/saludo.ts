/**
 * saludo — helper para el saludo dinámico de Home según hora local.
 * Portado del mockup Claude Design (shared.jsx > getSaludo).
 */

export interface Saludo {
  saludo: string;
  sub: string;
  icon: string;
}

export function getSaludo(now: Date = new Date()): Saludo {
  const h = now.getHours();
  if (h < 12) return { saludo: "Buenos días", sub: "Curacaví despertando", icon: "☀️" };
  if (h < 19) return { saludo: "Buenas tardes", sub: "A media siesta del valle", icon: "🌤️" };
  return { saludo: "Buenas noches", sub: "Caminando bajo la cordillera", icon: "🌙" };
}
