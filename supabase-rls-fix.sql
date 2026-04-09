-- ============================================
-- SCRIPT COMPLETO PARA RLS - TABLA NOTICIAS
-- Ejecutar todo en el SQL Editor de Supabase
-- ============================================

-- 1. VER POLÍTICAS ACTUALES
SELECT 
    policyname,
    cmd,
    qual,
    with_check,
    roles
FROM pg_policies 
WHERE tablename = 'noticias';

-- 2. VERIFICAR SI RLS ESTÁ HABILITADO
SELECT 
    relname,
    relrowsecurity,
    relforcerowsecurity
FROM pg_class 
WHERE relname = 'noticias';

-- 3. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "lectura_publica_noticias" ON noticias;
DROP POLICY IF EXISTS "insercion_autenticada_noticias" ON noticias;
DROP POLICY IF EXISTS "actualizacion_autenticada_noticias" ON noticias;
DROP POLICY IF EXISTS "eliminacion_autenticada_noticias" ON noticias;

-- 4. CREAR POLÍTICAS CORRECTAS

-- Política de LECTURA (puede ser pública o autenticada)
CREATE POLICY "lectura_publica_noticias" ON noticias
FOR SELECT
TO public
USING (true);

-- Política de INSERCIÓN para cualquier persona (incluyendo anon)
CREATE POLICY "insercion_publica_noticias" ON noticias
FOR INSERT
TO public
WITH CHECK (true);

-- Política de ACTUALIZACIÓN para cualquier persona
CREATE POLICY "actualizacion_publica_noticias" ON noticias
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Política de ELIMINACIÓN para cualquier persona
CREATE POLICY "eliminacion_publica_noticias" ON noticias
FOR DELETE
TO public
USING (true);

-- 5. VERIFICAR POLÍTICAS CREADAS
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'noticias';
