-- 0010_precio_real_y_flag_estimado.sql
-- Distingue precios reales (verificados online o por el socio) de precios
-- estimados por categoria. La UI muestra "aprox $X" para los estimados
-- y "$X" limpio para los verificados.
--
-- Tambien actualiza los 5 precios que pude verificar desde fuentes
-- publicas y marca como gratis (=0) los servicios publicos.

-- 1. Agrega columna precio_es_estimado (default true: asumimos que los
--    precios actuales son estimaciones por categoria, hasta que un humano
--    o yo verifique cada uno).

ALTER TABLE comercios
  ADD COLUMN IF NOT EXISTS precio_es_estimado boolean NOT NULL DEFAULT true;

-- 2. Precios verificados desde fuentes publicas online (Mayo 2026):
--    Casas del Bosque: tour Aromas + cata $35.000 (sitio oficial)
--    Viñamar: Premium Wine Tour $25.000 (tienda club lectores)
--    Estancia El Cuadro: tour mid-range $26.000 (matrimonios.cl)
--    Museo Ballenera Quintay: entrada adultos $1.500 (Fundacion Quintay)
--    Caleta Quintay: ~$15.000 por persona almuerzo promedio (foursquare/tripadvisor)

UPDATE comercios SET precio_clp_aprox = 35000, precio_es_estimado = false
  WHERE slug = 'casas-del-bosque';

UPDATE comercios SET precio_clp_aprox = 25000, precio_es_estimado = false
  WHERE slug = 'vinamar-casablanca';

UPDATE comercios SET precio_clp_aprox = 26000, precio_es_estimado = false
  WHERE slug = 'estancia-el-cuadro';

UPDATE comercios SET precio_clp_aprox = 1500, precio_es_estimado = false
  WHERE slug = 'museo-ballenera-quintay';

UPDATE comercios SET precio_clp_aprox = 15000, precio_es_estimado = false
  WHERE slug = 'caleta-quintay';

-- 3. Servicios publicos gratuitos: precio 0 verificado
UPDATE comercios SET precio_clp_aprox = 0, precio_es_estimado = false
  WHERE slug IN (
    'bomberos-curacavi',
    'carabineros-curacavi',
    'municipalidad-curacavi',
    'seguridad-municipal',
    'parque-ambrosio-ohiggins',
    'feria-libre-curacavi'
  );

-- 4. Refresca la vista para que el front lea los flags nuevos
DROP VIEW IF EXISTS v_comercios_busqueda CASCADE;
CREATE VIEW v_comercios_busqueda AS
SELECT
  c.id, c.slug, c.nombre, c.categoria, c.subtitulo, c.descripcion,
  c.direccion, c.telefono, c.whatsapp, c.web, c.email, c.precio,
  c.rating, c.reviews, c.estado, c.abierto_hasta, c.imagen,
  c.destacados, c.coords_x, c.coords_y, c.lat, c.lng, c.distancia_km,
  c.imagenes_extra,
  c.comuna_id, c.eje_ruta_km, c.tiempo_visita_min, c.precio_clp_aprox,
  c.precio_es_estimado,
  COALESCE(
    array_agg(ct.tag_id ORDER BY ct.tag_id) FILTER (WHERE ct.tag_id IS NOT NULL),
    ARRAY[]::text[]
  ) AS tags
FROM comercios c
LEFT JOIN comercio_tags ct ON ct.comercio_id = c.id
WHERE c.publicado = true
GROUP BY c.id;

GRANT SELECT ON v_comercios_busqueda TO anon, authenticated;
