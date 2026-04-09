-- ============================================
-- POLÍTICAS RLS PARA TODAS LAS TABLAS
-- Ejecutar en SQL Editor de Supabase
-- ============================================

-- ============================================
-- TABLA: categorias
-- ============================================

-- Ver políticas actuales
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'categorias';

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "lectura_publica_categorias" ON categorias;
DROP POLICY IF EXISTS "insercion_publica_categorias" ON categorias;
DROP POLICY IF EXISTS "actualizacion_publica_categorias" ON categorias;
DROP POLICY IF EXISTS "eliminacion_publica_categorias" ON categorias;

-- Crear políticas para pública (permite cualquier operación)
CREATE POLICY "lectura_publica_categorias" ON categorias FOR SELECT TO public USING (true);
CREATE POLICY "insercion_publica_categorias" ON categorias FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "actualizacion_publica_categorias" ON categorias FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "eliminacion_publica_categorias" ON categorias FOR DELETE TO public USING (true);

-- ============================================
-- TABLA: autores
-- ============================================

-- Ver políticas actuales
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'autores';

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "lectura_publica_autores" ON autores;
DROP POLICY IF EXISTS "insercion_publica_autores" ON autores;
DROP POLICY IF EXISTS "actualizacion_publica_autores" ON autores;
DROP POLICY IF EXISTS "eliminacion_publica_autores" ON autores;

-- Crear políticas para pública
CREATE POLICY "lectura_publica_autores" ON autores FOR SELECT TO public USING (true);
CREATE POLICY "insercion_publica_autores" ON autores FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "actualizacion_publica_autores" ON autores FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "eliminacion_publica_autores" ON autores FOR DELETE TO public USING (true);

-- ============================================
-- TABLA: noticias
-- ============================================

-- Ver políticas actuales
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'noticias';

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "lectura_publica_noticias" ON noticias;
DROP POLICY IF EXISTS "insercion_publica_noticias" ON noticias;
DROP POLICY IF EXISTS "actualizacion_publica_noticias" ON noticias;
DROP POLICY IF EXISTS "eliminacion_publica_noticias" ON noticias;

-- Crear políticas para pública
CREATE POLICY "lectura_publica_noticias" ON noticias FOR SELECT TO public USING (true);
CREATE POLICY "insercion_publica_noticias" ON noticias FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "actualizacion_publica_noticias" ON noticias FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "eliminacion_publica_noticias" ON noticias FOR DELETE TO public USING (true);

-- ============================================
-- VERIFICAR TODAS LAS POLÍTICAS
-- ============================================
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
