-- 0018_evento_fecha_fin_y_fiesta_chicha.sql
-- Agrega fecha_fin a eventos para soportar fiestas de varios dias
-- (Fiesta de la Chicha es 30 abr - 2 may, dura 3 dias).
-- Reinserta Fiesta de la Chicha 2026 con el rango correcto.

ALTER TABLE eventos ADD COLUMN IF NOT EXISTS fecha_fin date NULL;

INSERT INTO eventos (
  slug, titulo, fecha, fecha_fin, hora, hora_fin, lugar, categoria,
  descripcion, recurrente, dias_semana, comuna, publicado
) VALUES (
  'fiesta-chicha-2026',
  'Fiesta de la Chicha 2026',
  '2026-04-30', '2026-05-02', '12:00:00', '23:00:00',
  'Estadio Julio Riesco, Curacaví',
  'tradicional',
  'Evento tradicional anual de Curacavi. 30 abril al 2 mayo: 3 dias de chicha artesanal, gastronomia local, productores y musica del valle.',
  false, NULL, 'curacavi', true
)
ON CONFLICT (slug) DO UPDATE SET
  fecha = EXCLUDED.fecha,
  fecha_fin = EXCLUDED.fecha_fin,
  hora = EXCLUDED.hora,
  hora_fin = EXCLUDED.hora_fin,
  publicado = true;
