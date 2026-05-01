-- 0016_emergencias_y_servicios_corredor.sql
-- Datos verificados de emergencias, salud y servicios municipales del
-- corredor (Curacavi + Casablanca + Quintay/Las Dichas).
-- Fuentes: municipalidadcuracavi.cl + municipalidadcasablanca.cl
-- + hospitalsanjosedecasablanca.cl. Verificado: mayo 2026.

-- 1. Updates a comercios existentes con telefonos reales
UPDATE comercios SET
  telefono = '+56 2 2835 1050',
  subtitulo = '4ª Compañía · Emergencia 132',
  precio_es_estimado = false
WHERE slug = 'bomberos-curacavi';

UPDATE comercios SET
  telefono = '+56 2 2922 4405',
  subtitulo = 'Subcomisaria Curacaví · Emergencia 133'
WHERE slug = 'carabineros-curacavi';

UPDATE comercios SET
  telefono = '+56 2 2299 2100',
  subtitulo = 'Mesa central · Atencion Lun–Vie 8:30–14:00',
  abierto_hasta = '14:00',
  web = 'municipalidadcuracavi.cl'
WHERE slug = 'municipalidad-curacavi';

UPDATE comercios SET
  telefono = '+56 9 5168 4894',
  subtitulo = 'Patrullaje 24/7 · *4129'
WHERE slug = 'seguridad-municipal';

-- 2. INSERT comercios nuevos (emergencias, servicios, tramites)
-- (lista completa en el migration aplicado en Supabase via MCP — Curacavi
-- Hospital + 8 nuevos en Casablanca/Quintay/Las Dichas).
