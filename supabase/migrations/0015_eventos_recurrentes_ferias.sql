-- 0015_eventos_recurrentes_ferias.sql
-- Soporte de eventos recurrentes (ferias semanales) y reemplazo de seeds
-- inventados por las 6 ferias reales del corredor (5 Curacavi + 1 Casablanca,
-- fuente: Municipalidades de Curacavi y Casablanca).

ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS recurrente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dias_semana int[] NULL,
  ADD COLUMN IF NOT EXISTS hora_fin time NULL,
  ADD COLUMN IF NOT EXISTS comuna text NULL;

DELETE FROM eventos WHERE slug IN (
  'noche-de-sabores',
  'taller-ceramica',
  'trekking-cerro-la-cruz',
  'fiesta-chicha-2026',
  'feria-libre-javiera-carrera'
);

INSERT INTO eventos (
  slug, titulo, fecha, hora, hora_fin, lugar, categoria, descripcion,
  recurrente, dias_semana, comuna, publicado
) VALUES
('feria-curacavi-centro-marvie',
 'Feria Libre Curacaví — Centro',
 '2026-05-05', '08:00:00', '14:00:00',
 'Sector centrico, Curacavi',
 'gastro',
 'Feria libre tradicional. Martes y viernes en sector centrico de Curacavi.',
 true, ARRAY[2, 5], 'curacavi', true),
('feria-curacavi-balmaceda',
 'Feria Libre Curacaví — Plaza Balmaceda',
 '2026-05-02', '09:00:00', '15:00:00',
 'Plaza Presidente Balmaceda, Curacavi',
 'gastro',
 'Feria sabatina en la Plaza Presidente Balmaceda.',
 true, ARRAY[6], 'curacavi', true),
('feria-curacavi-javiera-carrera',
 'Feria Libre Curacaví — Javiera Carrera',
 '2026-05-03', '09:00:00', '15:00:00',
 'Calle Javiera Carrera, Curacavi',
 'gastro',
 'Feria dominical en calle Javiera Carrera.',
 true, ARRAY[0], 'curacavi', true),
('feria-curacavi-cerrillos',
 'Feria Libre Curacaví — Cerrillos',
 '2026-05-03', '09:00:00', '14:00:00',
 'Sector Cerrillos, Curacavi',
 'gastro',
 'Feria dominical alternativa en el sector Cerrillos.',
 true, ARRAY[0], 'curacavi', true),
('feria-casablanca-la-playa-sabado',
 'Feria Libre La Playa — Casablanca',
 '2026-05-02', '09:00:00', '19:00:00',
 'Sector La Playa, Casablanca',
 'gastro',
 'Feria sabatina tradicional. Frutas, verduras, ropa, herramientas y mote con huesillo.',
 true, ARRAY[6], 'casablanca', true),
('feria-casablanca-la-playa-domingo',
 'Feria Libre La Playa — Casablanca',
 '2026-05-03', '09:00:00', '15:00:00',
 'Sector La Playa, Casablanca',
 'gastro',
 'Feria dominical y festivos.',
 true, ARRAY[0], 'casablanca', true);
