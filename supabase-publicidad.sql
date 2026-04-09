-- ============================================
-- TABLA: publicidad_negocios
-- Crear en SQL Editor de Supabase
-- ============================================

-- Crear la tabla
CREATE TABLE IF NOT EXISTS publicidad_negocios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion_corta TEXT,
  imagen_url TEXT,
  enlace_url TEXT,
  boton_texto TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE publicidad_negocios ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS PARA publicidad_negocios
-- ============================================

-- Ver políticas actuales
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'publicidad_negocios';

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "lectura_publica_publicidad" ON publicidad_negocios;
DROP POLICY IF EXISTS "insercion_publica_publicidad" ON publicidad_negocios;
DROP POLICY IF EXISTS "actualizacion_publica_publicidad" ON publicidad_negocios;
DROP POLICY IF EXISTS "eliminacion_publica_publicidad" ON publicidad_negocios;

-- Crear políticas para pública
CREATE POLICY "lectura_publica_publicidad" ON publicidad_negocios FOR SELECT TO public USING (true);
CREATE POLICY "insercion_publica_publicidad" ON publicidad_negocios FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "actualizacion_publica_publicidad" ON publicidad_negocios FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "eliminacion_publica_publicidad" ON publicidad_negocios FOR DELETE TO public USING (true);

-- ============================================
-- EJEMPLOS DE DATOS DE PRUEBA
-- ============================================

-- INSERT INTO publicidad_negocios (titulo, descripcion_corta, imagen_url, enlace_url, boton_texto, activo, orden) VALUES
-- ('Restaurante La Casa del Sabor', 'Deliciosos platos típicos de la región con ingredientes frescos y locales.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop', 'https://example.com/restaurante', 'Ver Menú', true, 1),
-- ('Hotel Plaza Centro', 'Alojamiento cómodo y asequible en el corazón de Marinilla.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop', 'https://example.com/hotel', 'Reservar Ahora', true, 2),
-- ('Farmacia 24 Horas', 'Tu salud es nuestra prioridad. Servicio a domicilio disponible.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=400&fit=crop', 'https://example.com/farmacia', 'Contactar', true, 3);

-- ============================================
-- VERIFICAR TABLA CREADA
-- ============================================
SELECT * FROM publicidad_negocios ORDER BY orden ASC;