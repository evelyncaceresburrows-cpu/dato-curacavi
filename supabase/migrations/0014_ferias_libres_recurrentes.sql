-- 0014_ferias_libres_recurrentes.sql
-- Las ferias libres son recurrentes (semanales) — no eventos one-shot.
-- Las pasamos a comercios con dias y horarios en descripcion. El UI
-- las muestra como cualquier picada en directorio + planner.

-- 1. Update Feria Javiera Carrera (ya existe pero con data minima)
UPDATE comercios SET
  nombre = 'Feria Libre de Curacavi',
  subtitulo = 'Mar y Vie centro · Sab Plaza Balmaceda · Dom Javiera Carrera',
  descripcion = 'Feria libre tradicional de Curacavi. Mar y Vie en sector centrico (frutas, verduras, productos de campo). Sab en Plaza Presidente Balmaceda. Dom en Calle Javiera Carrera.',
  direccion = 'Plaza Presidente Balmaceda y Calle Javiera Carrera, Curacavi',
  abierto_hasta = '14:00',
  precio_es_estimado = false,
  precio_clp_aprox = 0,
  tiempo_visita_min = 60,
  imagen = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80&auto=format&fit=crop&fm=jpg'
WHERE slug = 'feria-libre-curacavi';

-- 2. Ferias nuevas
INSERT INTO comercios (
  slug, nombre, categoria, subtitulo, descripcion, direccion,
  precio, rating, reviews, estado, abierto_hasta, imagen,
  destacados, comuna_id, eje_ruta_km, tiempo_visita_min, precio_clp_aprox,
  precio_es_estimado, publicado
) VALUES
('feria-libre-cerrillos', 'Feria Libre de Cerrillos', 'picadas',
 'Domingos · Sector Cerrillos',
 'Feria libre dominical en el sector de Cerrillos, Curacavi. Frutas, verduras, productos de campo y artesania local.',
 'Sector Cerrillos, Curacavi',
 '$', 4.3, 180, 'verificado', '14:00',
 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80&auto=format&fit=crop&fm=jpg',
 ARRAY['frutas','verduras','artesania'],
 'curacavi', 44.0, 60, 0, false, true),
('feria-la-playa-casablanca', 'Feria Libre La Playa', 'picadas',
 'Sab 9-19h · Dom y festivos 9-15h',
 'Feria libre tradicional de Casablanca. Vende frutas, verduras, ropa, herramientas, articulos del hogar y mote con huesillo.',
 'Sector La Playa, Casablanca',
 '$', 4.4, 320, 'verificado', '15:00',
 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80&auto=format&fit=crop&fm=jpg',
 ARRAY['frutas','verduras','mote con huesillo','ropa'],
 'casablanca', 78.0, 60, 0, false, true);
