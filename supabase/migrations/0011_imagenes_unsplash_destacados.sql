-- 0011_imagenes_unsplash_destacados.sql
-- Carga fotos editoriales de Unsplash en los comercios sin imagen real.
-- Cuando el socio cargue su propia foto via /admin, se sobreescribe.

-- Viñas / chichas: foto de viñedo
UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug IN ('vina-altar-uco','casas-del-bosque','vinamar-casablanca','indomita-casablanca','vino-tinto-maria-pinto');

UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug IN ('chicheria-don-pancho','chicha-estadio-julio-riesco');

-- Picadas / restaurantes: comida chilena
UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug IN ('la-casona-de-curacavi','la-pica-de-curacavi','curacaribs','cafe-del-patio');

UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug = 'feria-libre-curacavi';

-- Dulces / panaderia
UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug IN ('dulces-issa','dulces-issa-ruta68-km40','dulces-issa-ruta68-km41','panaderia-la-espiga');

-- Mariscos costa
UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug IN ('caleta-quintay','caleta-algarrobo','cofradia-nautica-algarrobo');

-- Panoramas naturaleza
UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug IN ('parque-ambrosio-ohiggins','estancia-el-cuadro');

UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug = 'museo-ballenera-quintay';

-- Empanadas pasada Ruta 68
UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1601001435957-74f0958a93c5?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug = 'lo-aguirre-pasada';

-- Servicios publicos / emergencias / tramites
UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1599237018850-2c8a1f2e0f2c?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug IN ('bomberos-curacavi','carabineros-curacavi','seguridad-municipal');

UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug = 'municipalidad-curacavi';

UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug = 'farmacia-comunal-curacavi';

UPDATE comercios SET imagen = 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=1200&q=80&auto=format&fit=crop&fm=jpg'
  WHERE slug IN ('mecanica-el-compadre','talleres-curacavi');
