-- 0012_solicitudes_tags_precio_horario.sql
-- Agrega tags, precio y horario a solicitudes para que el form publico
-- /socio capture data completa. Antes el vecino solo podia mandar
-- nombre+telefono y el admin tenia que llenar todo lo demas a mano.

ALTER TABLE solicitudes
  ADD COLUMN IF NOT EXISTS tags text[] NULL,
  ADD COLUMN IF NOT EXISTS precio_clp_aprox integer NULL,
  ADD COLUMN IF NOT EXISTS abierto_hasta text NULL;
