-- ============================================
-- GAAMATV: SCRIPT DE SEGURIZACIÓN RLS (PRODUCCIÓN)
-- Este script elimina las políticas vulnerables (públicas)
-- e implementa RLS seguro donde solo usuarios autenticados
-- pueden modificar los registros. La lectura sigue siendo pública.
-- ============================================

-- =======================================
-- 1. TABLA: categorias
-- =======================================
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura_publica_categorias" ON categorias;
DROP POLICY IF EXISTS "insercion_publica_categorias" ON categorias;
DROP POLICY IF EXISTS "actualizacion_publica_categorias" ON categorias;
DROP POLICY IF EXISTS "eliminacion_publica_categorias" ON categorias;

CREATE POLICY "select_public_categorias" ON categorias FOR SELECT TO public USING (true);
CREATE POLICY "insert_auth_categorias" ON categorias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth_categorias" ON categorias FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth_categorias" ON categorias FOR DELETE TO authenticated USING (true);

-- =======================================
-- 2. TABLA: autores
-- =======================================
ALTER TABLE autores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura_publica_autores" ON autores;
DROP POLICY IF EXISTS "insercion_publica_autores" ON autores;
DROP POLICY IF EXISTS "actualizacion_publica_autores" ON autores;
DROP POLICY IF EXISTS "eliminacion_publica_autores" ON autores;

CREATE POLICY "select_public_autores" ON autores FOR SELECT TO public USING (true);
CREATE POLICY "insert_auth_autores" ON autores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth_autores" ON autores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth_autores" ON autores FOR DELETE TO authenticated USING (true);

-- =======================================
-- 3. TABLA: noticias
-- =======================================
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura_publica_noticias" ON noticias;
DROP POLICY IF EXISTS "insercion_publica_noticias" ON noticias;
DROP POLICY IF EXISTS "actualizacion_publica_noticias" ON noticias;
DROP POLICY IF EXISTS "eliminacion_publica_noticias" ON noticias;

CREATE POLICY "select_public_noticias" ON noticias FOR SELECT TO public USING (true);
CREATE POLICY "insert_auth_noticias" ON noticias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth_noticias" ON noticias FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth_noticias" ON noticias FOR DELETE TO authenticated USING (true);

-- =======================================
-- 4. TABLA: galeria_noticias
-- =======================================
ALTER TABLE galeria_noticias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura_publica_galeria" ON galeria_noticias;
DROP POLICY IF EXISTS "insercion_publica_galeria" ON galeria_noticias;
DROP POLICY IF EXISTS "actualizacion_publica_galeria" ON galeria_noticias;
DROP POLICY IF EXISTS "eliminacion_publica_galeria" ON galeria_noticias;

CREATE POLICY "select_public_galeria" ON galeria_noticias FOR SELECT TO public USING (true);
CREATE POLICY "insert_auth_galeria" ON galeria_noticias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth_galeria" ON galeria_noticias FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth_galeria" ON galeria_noticias FOR DELETE TO authenticated USING (true);

-- =======================================
-- 5. TABLA: publicidad_negocios
-- =======================================
ALTER TABLE publicidad_negocios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura_publica_publicidad" ON publicidad_negocios;
DROP POLICY IF EXISTS "insercion_publica_publicidad" ON publicidad_negocios;
DROP POLICY IF EXISTS "actualizacion_publica_publicidad" ON publicidad_negocios;
DROP POLICY IF EXISTS "eliminacion_publica_publicidad" ON publicidad_negocios;

CREATE POLICY "select_public_publicidad" ON publicidad_negocios FOR SELECT TO public USING (true);
CREATE POLICY "insert_auth_publicidad" ON publicidad_negocios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth_publicidad" ON publicidad_negocios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth_publicidad" ON publicidad_negocios FOR DELETE TO authenticated USING (true);

-- =======================================
-- 6. TABLA: firmas
-- =======================================
ALTER TABLE firmas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura_publica_firmas" ON firmas;
DROP POLICY IF EXISTS "insercion_publica_firmas" ON firmas;
DROP POLICY IF EXISTS "actualizacion_publica_firmas" ON firmas;
DROP POLICY IF EXISTS "eliminacion_publica_firmas" ON firmas;

CREATE POLICY "select_public_firmas" ON firmas FOR SELECT TO public USING (true);
CREATE POLICY "insert_auth_firmas" ON firmas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth_firmas" ON firmas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth_firmas" ON firmas FOR DELETE TO authenticated USING (true);

-- =======================================
-- 7. TABLA: redes_sociales
-- =======================================
ALTER TABLE redes_sociales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura_publica_redes" ON redes_sociales;
DROP POLICY IF EXISTS "insercion_publica_redes" ON redes_sociales;
DROP POLICY IF EXISTS "actualizacion_publica_redes" ON redes_sociales;
DROP POLICY IF EXISTS "eliminacion_publica_redes" ON redes_sociales;

CREATE POLICY "select_public_redes" ON redes_sociales FOR SELECT TO public USING (true);
CREATE POLICY "insert_auth_redes" ON redes_sociales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth_redes" ON redes_sociales FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth_redes" ON redes_sociales FOR DELETE TO authenticated USING (true);
