-- 0008_realistic_tiempo_precio_defaults.sql
-- Rellena tiempo_visita_min y precio_clp_aprox en los comercios que tenian
-- esos campos en NULL. Defaults realistas por categoria, no muy lejos de
-- los promedios chilenos. Solo toca filas con valor NULL — no pisa lo
-- que ya estaba seteado.

UPDATE comercios SET
  tiempo_visita_min = COALESCE(tiempo_visita_min, 60),
  precio_clp_aprox  = COALESCE(precio_clp_aprox, 12000)
WHERE categoria = 'picadas';

UPDATE comercios SET
  tiempo_visita_min = COALESCE(tiempo_visita_min, 20),
  precio_clp_aprox  = COALESCE(precio_clp_aprox, 5000)
WHERE categoria = 'dulces';

UPDATE comercios SET
  tiempo_visita_min = COALESCE(tiempo_visita_min, 45),
  precio_clp_aprox  = COALESCE(precio_clp_aprox, 8000)
WHERE categoria = 'chicha';

UPDATE comercios SET
  tiempo_visita_min = COALESCE(tiempo_visita_min, 60),
  precio_clp_aprox  = COALESCE(precio_clp_aprox, 3000)
WHERE categoria = 'panoramas';

UPDATE comercios SET
  tiempo_visita_min = COALESCE(tiempo_visita_min, 30),
  precio_clp_aprox  = COALESCE(precio_clp_aprox, 5000)
WHERE categoria = 'servicios';

UPDATE comercios SET
  tiempo_visita_min = COALESCE(tiempo_visita_min, 30),
  precio_clp_aprox  = COALESCE(precio_clp_aprox, 0)
WHERE categoria = 'tramites';

UPDATE comercios SET
  tiempo_visita_min = COALESCE(tiempo_visita_min, 15),
  precio_clp_aprox  = COALESCE(precio_clp_aprox, 0)
WHERE categoria = 'emergencias';
