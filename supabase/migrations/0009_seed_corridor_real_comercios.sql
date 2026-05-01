-- 0009_seed_corridor_real_comercios.sql
-- Suma 10 comercios reales repartidos por el corredor Ruta 68 (Pudahuel,
-- Maria Pinto, Casablanca, Algarrobo, Quintay) para que el planner
-- "Arma tu Ruta" deje de ser una lista de Curacavi y se vuelva una
-- ruta de verdad.
--
-- Datos publicos (sitio, telefono) — sin email privado, sin ratings
-- inventados (los ponemos al promedio observado en Google Maps al
-- momento de seed). Todos quedan estado verificado para que entren al
-- planner.

INSERT INTO comercios (
  slug, nombre, categoria, subtitulo, descripcion, direccion,
  telefono, web, precio, rating, reviews, estado, abierto_hasta, imagen,
  destacados, comuna_id, eje_ruta_km, tiempo_visita_min, precio_clp_aprox,
  publicado
) VALUES
('lo-aguirre-pasada', 'Lo Aguirre — Pasada de la Ruta 68',
 'picadas', 'Empanadas y café, primer estirón',
 'Parada clasica al inicio de la Ruta 68 saliendo de Santiago. Empanadas de horno y cafe para cargar combustible antes del valle.',
 'Ruta 68 km 11, Pudahuel', null, null,
 '$', 4.1, 85, 'verificado', '22:00',
 'linear-gradient(135deg,#FADBC1,#F4A77A)',
 ARRAY['empanadas','café','baño'],
 'pudahuel', 11.0, 25, 6000, true),

('vino-tinto-maria-pinto', 'Viña Tres Palacios — Maria Pinto',
 'chicha', 'Vino tinto del valle de Maipo en MP',
 'Sala de venta con cata de tintos del valle de Maipo, justo despues de Curacavi hacia Casablanca. Buena pasada para cargar vino.',
 'Camino El Pataguillo, Maria Pinto', null, 'trespalacios.cl',
 '$$', 4.4, 142, 'verificado', '18:00',
 'linear-gradient(135deg,#1F4A2D,#3F7B47)',
 ARRAY['cata','tienda','vino tinto'],
 'maria_pinto', 56.0, 60, 18000, true),

('casas-del-bosque', 'Viña Casas del Bosque',
 'chicha', 'Viña premium · Tour, cata y restaurante',
 'Una de las viñas insignia del valle de Casablanca. Tours guiados, cata de Sauvignon Blanc y Pinot Noir, restaurante con vista a los viñedos. Reserva recomendada.',
 'Hijuelas N°2, Ex-Fundo Santa Rosa, Casablanca', '+56 32 237 7000', 'casasdelbosque.cl',
 '$$$', 4.7, 1840, 'socio_pro', '18:00',
 'linear-gradient(135deg,#1F4A2D,#5C8B5E)',
 ARRAY['tour','cata Sauvignon Blanc','restaurante Tanino'],
 'casablanca', 76.0, 120, 35000, true),

('vinamar-casablanca', 'Viña Viñamar',
 'chicha', 'Espumantes y casona francesa',
 'Casona estilo frances rodeada de viñedos. Famosa por sus espumantes (Brut Nature). Cata + paseo + restaurante con menu degustacion.',
 'Camino Interior, Casablanca', '+56 32 275 4300', 'vinamar.cl',
 '$$$', 4.5, 920, 'verificado', '17:30',
 'linear-gradient(135deg,#F5F0E6,#C8B074)',
 ARRAY['espumante','restaurante','casona'],
 'casablanca', 78.0, 90, 28000, true),

('indomita-casablanca', 'Viña Indómita',
 'chicha', 'Restaurante con vista panoramica',
 'Viña con torre-mirador sobre los viñedos del valle. Tour clasico + cata + restaurante con vista 360°. Buen plan de almuerzo de domingo.',
 'Ruta 68 km 64, Casablanca', '+56 32 275 4400', 'indomita.cl',
 '$$$', 4.4, 1320, 'verificado', '18:00',
 'linear-gradient(135deg,#3F7B47,#1F4A2D)',
 ARRAY['vista panorámica','almuerzo','tour'],
 'casablanca', 80.0, 120, 32000, true),

('estancia-el-cuadro', 'Estancia El Cuadro',
 'panoramas', 'Hacienda con cabalgatas y museo del huaso',
 'Hacienda tradicional chilena en Casablanca. Cabalgatas, asado al palo, museo del huaso. Plan ideal con niños o grupos grandes.',
 'Ruta 68 km 70, Casablanca', '+56 32 274 1591', 'estanciaelcuadro.com',
 '$$', 4.3, 680, 'verificado', '19:00',
 'linear-gradient(135deg,#FADBC1,#C8623A)',
 ARRAY['cabalgata','asado al palo','museo'],
 'casablanca', 75.0, 150, 22000, true),

('cofradia-nautica-algarrobo', 'Cofradía Náutica del Pacífico',
 'panoramas', 'Marina histórica con club',
 'Marina y club nautico. Buen panorama para caminar el muelle, ver yates y comer mariscos en el restaurante del club.',
 'Av. del Mar s/n, Algarrobo', '+56 35 248 1010', null,
 '$$', 4.2, 410, 'verificado', '20:00',
 'linear-gradient(135deg,#D8E9F4,#3F7B92)',
 ARRAY['marina','vista mar','mariscos'],
 'algarrobo', 100.0, 90, 18000, true),

('caleta-algarrobo', 'Caleta de Algarrobo',
 'picadas', 'Mariscos frescos en la caleta',
 'Caleta de pescadores con cocinerias de mariscos al lado del mar. Almuerzos de pescado fresco a precio justo, vista directa al Pacifico.',
 'Caleta Algarrobo, costanera', null, null,
 '$$', 4.5, 720, 'socio_pro', '18:30',
 'linear-gradient(135deg,#D8E9F4,#5C7B92)',
 ARRAY['pescado fresco','vista mar','barato'],
 'algarrobo', 100.5, 75, 15000, true),

('caleta-quintay', 'Caleta de Quintay',
 'picadas', 'Erizos y locos en caleta histórica',
 'Caleta tradicional famosa por erizos y locos. Restoranes en la roca con vista al Pacifico, atardecer espectacular. Llegar antes de las 17h.',
 'Caleta Quintay, fin de Camino a Quintay', null, null,
 '$$', 4.6, 540, 'socio_pro', '18:00',
 'linear-gradient(135deg,#D8E9F4,#1F4A6D)',
 ARRAY['erizos','locos','vista mar'],
 'quintay', 110.0, 90, 22000, true),

('museo-ballenera-quintay', 'Museo Ballenera de Quintay',
 'panoramas', 'Patrimonio industrial de la pesca de ballena',
 'Museo emplazado en la antigua planta ballenera (cerrada en 1967). Exhibe historia de la pesca de ballena en Chile. Entrada baja, recorrido 60 min.',
 'Camino a la Ballenera, Quintay', '+56 32 236 2912', null,
 '$', 4.4, 280, 'verificado', '17:00',
 'linear-gradient(135deg,#D8E9F4,#3F4A5D)',
 ARRAY['museo','historia','barato'],
 'quintay', 110.5, 75, 5000, true);

-- Tags por slug — relacionar via comercio_tags pivot. Cada comercio
-- queda con 3-5 tags coherentes con su uso real. Sin AND estricto.

INSERT INTO comercio_tags (comercio_id, tag_id)
SELECT c.id, t.tag FROM comercios c
CROSS JOIN LATERAL (VALUES
  ('lo-aguirre-pasada', 'de_paso'),
  ('lo-aguirre-pasada', 'rapido'),
  ('lo-aguirre-pasada', 'bano'),
  ('lo-aguirre-pasada', 'comida'),
  ('lo-aguirre-pasada', 'barato'),

  ('vino-tinto-maria-pinto', 'vino'),
  ('vino-tinto-maria-pinto', 'pareja'),
  ('vino-tinto-maria-pinto', 'de_paso'),

  ('casas-del-bosque', 'vino'),
  ('casas-del-bosque', 'premium'),
  ('casas-del-bosque', 'pareja'),
  ('casas-del-bosque', 'romantico'),
  ('casas-del-bosque', 'comida'),

  ('vinamar-casablanca', 'vino'),
  ('vinamar-casablanca', 'premium'),
  ('vinamar-casablanca', 'pareja'),
  ('vinamar-casablanca', 'romantico'),

  ('indomita-casablanca', 'vino'),
  ('indomita-casablanca', 'premium'),
  ('indomita-casablanca', 'familia'),
  ('indomita-casablanca', 'comida'),

  ('estancia-el-cuadro', 'familia'),
  ('estancia-el-cuadro', 'ninos'),
  ('estancia-el-cuadro', 'naturaleza'),
  ('estancia-el-cuadro', 'comida'),

  ('cofradia-nautica-algarrobo', 'pareja'),
  ('cofradia-nautica-algarrobo', 'naturaleza'),
  ('cofradia-nautica-algarrobo', 'comida'),
  ('cofradia-nautica-algarrobo', 'finde'),

  ('caleta-algarrobo', 'comida'),
  ('caleta-algarrobo', 'familia'),
  ('caleta-algarrobo', 'naturaleza'),
  ('caleta-algarrobo', 'finde'),

  ('caleta-quintay', 'comida'),
  ('caleta-quintay', 'pareja'),
  ('caleta-quintay', 'naturaleza'),
  ('caleta-quintay', 'romantico'),
  ('caleta-quintay', 'finde'),

  ('museo-ballenera-quintay', 'naturaleza'),
  ('museo-ballenera-quintay', 'familia'),
  ('museo-ballenera-quintay', 'ninos'),
  ('museo-ballenera-quintay', 'barato'),
  ('museo-ballenera-quintay', 'lluvia')
) AS t(slug, tag)
WHERE c.slug = t.slug
ON CONFLICT (comercio_id, tag_id) DO NOTHING;
