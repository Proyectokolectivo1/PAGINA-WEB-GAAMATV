-- Migración para añadir el campo 'tipo' a las categorías
-- Esto permite clasificar las categorías en 'Secciones' y 'Ciudades' desde el panel administrativo
-- sin depender de lógica hardcodeada en el frontend.

-- 1. Añadir la columna 'tipo' (por defecto 'seccion')
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'seccion';

-- 2. Clasificar las categorías existentes basadas en sus slugs conocidos
UPDATE categorias 
SET tipo = 'ciudad' 
WHERE slug IN ('rionegro', 'marinilla', 'guatape', 'el-santuario', 'la-ceja', 'el-retiro');

-- 3. Asegurar que 'tipo' no sea nulo en el futuro
ALTER TABLE categorias ALTER COLUMN tipo SET NOT NULL;
