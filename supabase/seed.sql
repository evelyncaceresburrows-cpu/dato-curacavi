-- ════════════════════════════════════════════════════════════════════════════
-- Dato Curacaví · seed.sql
-- Carga inicial de comercios y eventos desde KNOWLEDGE.md (Abril 2026).
-- Debe reflejar `src/data/seed.ts` — mantener ambos sincronizados.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- Limpia si se re-corre (útil en dev; NO usar en prod).
truncate table eventos, comercios restart identity cascade;

-- ─── Comercios (17) ──────────────────────────────────────────────────────────

insert into comercios
  (slug, nombre, categoria, subtitulo, descripcion, direccion, telefono, whatsapp, web,
   precio, rating, reviews, estado, abierto_hasta, imagen, destacados, coords_x, coords_y, distancia_km)
values
  ('dulces-issa', 'Dulces Issa', 'dulces',
   'Dulces chilenos · 3 sucursales + delivery',
   'Empolvados, alfajores y dulces típicos como los hacía la abuela. Parada obligada del valle y referencia identitaria de Curacaví.',
   'Av. Ambrosio O''Higgins, Curacaví centro', '+56 2 2935 0001', '+56988001234', 'dulcesissa.cl',
   '$$', 4.9, 312, 'socio_pro', '20:00',
   'linear-gradient(135deg, #D97706, #F2C98A 55%, #FDE4C1)',
   array['Receta de familia','3 sucursales','Delivery'], 52, 48, null),

  ('chicha-estadio-julio-riesco', 'Chicha del Estadio Julio Riesco', 'chicha',
   'Agrupación de productores · Venta directa',
   'Chicha fresca, moscatel y asoleado. Productores locales verificados. Venta directa los fines de semana durante la Fiesta de la Chicha 2026.',
   'Estadio Julio Riesco, Curacaví', '+56 9 7711 2233', null, null,
   '$', 4.8, 156, 'socio_pro', '22:00',
   'linear-gradient(135deg, #7a4203, #D97706 55%, #FDE4C1)',
   array['Fiesta de la Chicha 2026','Venta directa'], 36, 30, null),

  ('la-casona-de-curacavi', 'La Casona de Curacaví', 'picadas',
   'Casona patrimonial · Cocinería & artesanía',
   'Casona colonial de 1840 con patio, cocinería, dulces y artesanía. Panorama familiar completo.',
   'Av. Ambrosio O''Higgins 2750', '+56 2 2935 0000', null, null,
   '$$', 4.7, 198, 'socio_pro', '21:00',
   'linear-gradient(135deg, #6b4423, #a07043 45%, #d4b494)',
   array['Patrimonio 1840','Familiar'], 60, 60, null),

  ('curacaribs', 'CuracaRibs', 'picadas',
   'Smokehouse · Costillas ahumadas',
   'Smokehouse en la histórica Hostería Antumapu. Costillas ahumadas al estilo texano, parrilla grande.',
   'Hostería Antumapu', '+56 9 4422 1100', null, null,
   '$$', 4.6, 84, 'socio_pro', '23:00',
   'linear-gradient(135deg, #4a2b1a, #7d4b2e 50%, #b67a4a)',
   array['Ahumado texano','Reservar'], 72, 42, null),

  ('la-pica-de-curacavi', 'La Picá de Curacaví', 'picadas',
   'Restaurante · Comida chilena',
   'Comida casera, platos abundantes y ambiente campestre. Ideal para familias.',
   'Camino El Toro 350, Curacaví', '+56 9 1234 5678', '+56912345678', null,
   '$$', 4.7, 128, 'socio_pro', '22:00',
   'linear-gradient(135deg, #6b4423, #8b5e34 45%, #c08552 100%)',
   array['Buena atención','Ideal familias','Precios justos'], 28, 52, 1.2),

  ('cafe-del-patio', 'Café del Patio', 'picadas',
   'Café & Pastelería',
   'Repostería artesanal y desayunos de campo. Terraza bajo parrones con flores silvestres.',
   'Ambrosio O''Higgins 1520, Curacaví', '+56 2 2835 1200', null, null,
   '$$', 4.6, 96, 'verificado', '20:30',
   'linear-gradient(135deg, #b08968, #d9bfa5)',
   array['Repostería propia','Pet-friendly'], 54, 34, 0.6),

  ('vina-altar-uco', 'Viña Altar Uco', 'chicha',
   'Viña & Tours',
   'Tour de viñedos con cata de chichas patrimoniales y vinos naturales del valle.',
   'Camino El Durazno s/n, Curacaví', '+56 9 8001 2245', null, 'altaruco.cl',
   '$$$', 4.9, 74, 'socio_pro', '19:00',
   'linear-gradient(135deg, #2D5A27, #4F8748 55%, #9BBF88)',
   array['Tour guiado','Cata incluida'], 18, 22, 4.1),

  ('chicheria-don-pancho', 'Chichería Don Pancho', 'chicha',
   'Chicha artesanal · Venta por garrafa',
   'Chicha artesanal centenaria. Pase, pruebe de la cuba y llévese garrafa para el fin de semana.',
   'Camino a Cuyuncaví s/n', '+56 9 8800 1122', null, null,
   '$', 4.5, 67, 'verificado', '20:00',
   'linear-gradient(135deg, #8b4a1a, #c38536 55%, #e8c48a)',
   array['Tradición centenaria'], 22, 68, null),

  ('panaderia-la-espiga', 'Panadería La Espiga', 'dulces',
   'Pan amasado · Empanadas de pino',
   'Pan amasado caliente desde las 7 AM y empanadas de pino los fines de semana. La fila lo dice todo.',
   'Javiera Carrera 410', '+56 9 7654 3210', null, null,
   '$', 4.6, 143, 'verificado', '21:00',
   'linear-gradient(135deg, #c38536, #e8c48a 60%, #f5e3c0)',
   array['Pan amasado 7AM','Empanadas finde'], 46, 54, null),

  ('feria-libre-curacavi', 'Feria Libre Javiera Carrera', 'picadas',
   'Feria dominical · Verdura fresca',
   'Domingo en la mañana: verdura fresca, pescado de la costa y mote con huesillo al paso.',
   'Calle Javiera Carrera, sector centro', null, null, null,
   '$', 4.5, 210, 'verificado', '14:00',
   'linear-gradient(135deg, #4CA772, #a7d3b4 55%, #e6e4bb)',
   array['Domingo AM','Productos del valle'], 48, 52, null),

  ('parque-ambrosio-ohiggins', 'Parque Ambrosio O''Higgins', 'panoramas',
   'Áreas verdes · Libre acceso',
   'Pulmón verde del centro: árboles añosos, juegos infantiles y cicletada familiar los domingos.',
   'Av. Ambrosio O''Higgins, Curacaví', null, null, null,
   '$', 4.5, 210, 'verificado', '21:00',
   'linear-gradient(135deg, #1F6B45, #4CA772 70%, #a7d3b4)',
   array['Cicletada dominical','Juegos infantiles'], 40, 72, 0.9),

  ('farmacia-comunal-curacavi', 'Farmacia Comunal Curacaví', 'servicios',
   'Medicamentos precio justo · Vecinos inscritos',
   'Medicamentos a precio justo para vecinos inscritos. De lunes a viernes, retire por número.',
   'Plaza Presidente Balmaceda', '+56 2 2935 1212', null, null,
   '$', 4.7, 89, 'verificado', '18:00',
   'linear-gradient(135deg, #2F5AA0, #6b8fca 55%, #c8d6ed)',
   array['Precio justo','Vecinos inscritos'], 50, 50, null),

  ('talleres-curacavi', 'Talleres Curacaví', 'servicios',
   'Mecánica & Desabolladura',
   'Taller familiar con atención de lunes a sábado. Trabajan con seguros particulares.',
   'Ruta 68 Km 42, Curacaví', '+56 9 7007 4411', null, null,
   '$$', 4.2, 45, 'por_confirmar', '19:00',
   'linear-gradient(135deg, #6b6b6b, #8c8c8c)',
   array['Ruta 68','Trabaja con seguros'], 78, 40, 2.6),

  ('mecanica-el-compadre', 'Mecánica El Compadre', 'servicios',
   'Frenos & diagnóstico al tiro',
   'Frenos y diagnóstico al tiro. Atiende sábado en la mañana sin pedir hora.',
   'Cerrillos 122', '+56 9 7766 5544', null, null,
   '$$', 4.4, 52, 'verificado', '19:00',
   'linear-gradient(135deg, #555, #7c7c7c 60%, #a0a0a0)',
   array['Sin hora sábados'], 66, 66, null),

  ('municipalidad-curacavi', 'Municipalidad de Curacaví', 'tramites',
   'Central digital · 100 líneas',
   'Nueva central telefónica digital. Convenio de gas, retiro de ramas, permisos. Todo en línea.',
   'municipalidadcuracavi.cl · Centro cívico', '+56 2 3214 1100', null, null,
   '$', 4.3, 87, 'socio_pro', '17:00',
   'linear-gradient(135deg, #2D8F8A, #5fb5ae 55%, #b7dbd6)',
   array['Enero 2026','100 llamados simultáneos'], 50, 50, null),

  ('seguridad-municipal', 'Seguridad Municipal', 'emergencias',
   'Patrullaje 24/7 · *4129',
   'Patrullaje preventivo 24/7 y denuncia vecinal. Llamado directo al centro de operaciones.',
   'Central comunal, Curacaví', '*4129', null, null,
   '$', 4.8, 342, 'socio_pro', '24h',
   'linear-gradient(135deg, #B13A3A, #d87171 55%, #f0b3b3)',
   array['*4129','24/7'], 50, 48, null),

  ('bomberos-curacavi', 'Bomberos de Curacaví', 'emergencias',
   '132 · Voluntariado del valle',
   'Cuerpo de Bomberos local, voluntariado del valle. Emergencia y rescate.',
   'Compañía comunal', '132', null, null,
   '$', 5.0, 289, 'socio_pro', '24h',
   'linear-gradient(135deg, #7a1414, #b13a3a 55%, #d87171)',
   array['132','Rescate'], 52, 46, null);

-- ─── Eventos (5) ─────────────────────────────────────────────────────────────

insert into eventos
  (slug, titulo, descripcion, fecha, hora, lugar, comercio_id,
   categoria, tags, chip_color, imagen, estado, gratis, precio_texto)
values
  ('fiesta-chicha-2026', 'Fiesta de la Chicha 2026',
   'Entrada liberada · Bafochi, La Combo Tortuga, Pailita y Potencia. Tres días de chicha fresca, música en vivo y tradición del valle.',
   '2026-04-30', '17:00', 'Estadio Julio Riesco',
   (select id from comercios where slug = 'chicha-estadio-julio-riesco'),
   'tradicional',
   array['Gratis','Familiar','Tradicional'],
   '#D7ECDD',
   'linear-gradient(135deg, #7a4203, #D97706 55%, #FDE4C1)',
   'socio_pro', true, null),

  ('feria-libre-javiera-carrera', 'Feria Libre de Curacaví',
   'Productos locales, artesanías, comida típica y verdura fresca directo del productor.',
   '2026-05-25', '08:00', 'Plaza Presidente Balmaceda', null,
   'gastro',
   array['Feria','Familiar','Al aire libre'],
   '#FADBC1',
   'linear-gradient(135deg, #2D5A27, #4F8748 40%, #bcd48a 75%, #f3e0b5)',
   'socio_pro', true, null),

  ('noche-de-sabores', 'Noche de Sabores',
   'Patio de comidas y música en vivo con productores del valle.',
   '2026-05-25', '20:00', 'Patio de Comidas La Viña', null,
   'musica',
   array['Música','Gastronomía'],
   '#E6DEF4',
   'linear-gradient(135deg, #2c1e3f, #6e3a7a 60%, #c88bbf)',
   'socio_pro', false, '$8.000'),

  ('taller-ceramica', 'Taller de Cerámica',
   'Crea tu propia pieza en torno y llévatela la semana siguiente ya cocida.',
   '2026-05-28', '16:00', 'Centro Cultural de Curacaví', null,
   'cultura',
   array['Cultura','Presencial'],
   '#FADCE0',
   'linear-gradient(135deg, #bf8b6a, #d9b29c)',
   'verificado', false, '$15.000'),

  ('trekking-cerro-la-cruz', 'Trekking Cerro La Cruz',
   'Dificultad media · 4 horas. Salida desde la plaza con guía local.',
   '2026-06-02', '09:00', 'Cerro La Cruz', null,
   'deporte',
   array['Deporte','Naturaleza'],
   '#FCE5B6',
   'linear-gradient(135deg, #4a6a41, #8aa57b 55%, #cfd8b7)',
   'verificado', true, null);

commit;
