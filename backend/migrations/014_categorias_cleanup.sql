-- 014_categorias_cleanup.sql (v2 — match plural)
-- Limpieza de categorías:
--   - Eliminar tanto "Alimento" como "Alimentos" (versión plural quedó en DB)
--   - Renombrar "Alimento húmedo" → "Concentrado húmedo"
--
-- v2: el match anterior con LOWER(nombre) = 'alimento' NO pillaba "Alimentos"
-- (con S). Ahora usamos LIKE 'aliment%' para cubrir ambas variantes.
--
-- Nota MySQL: no se permite UPDATE/DELETE con subquery sobre la MISMA tabla
-- en el WHERE. Usamos variables de sesión y cursores virtuales.

-- ─── Paso 1: borrar "Alimento" y "Alimentos" ────────────────────────────────
-- 1a) Reasignar productos de cualquier categoría que matchee a NULL
UPDATE productos p
INNER JOIN categorias c ON c.id = p.categoria_id
   SET p.categoria_id = NULL
 WHERE LOWER(c.nombre) IN ('alimento', 'alimentos');

-- 1b) Eliminar esas categorías
DELETE FROM categorias
 WHERE LOWER(nombre) IN ('alimento', 'alimentos');

-- ─── Paso 2: renombrar "Alimento húmedo" / "Alimentos húmedos" ──────────────
--           a "Concentrado húmedo"
UPDATE categorias
   SET nombre = 'Concentrado húmedo',
       slug   = 'concentrado-humedo'
 WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(nombre, 'á','a'), 'é','e'), 'í','i'), 'ú','u'))
       IN ('alimento humedo', 'alimentos humedos');

-- ─── Paso 3 (defensivo): cualquier residuo con nombre que empiece por
--                       "aliment" lo renombramos a "Sin categoría" para que
--                       no aparezca con ese label en el panel admin.
UPDATE categorias
   SET nombre = 'Sin categoría',
       slug   = CONCAT('sin-categoria-', id)
 WHERE LOWER(nombre) LIKE 'aliment%'
   AND LOWER(nombre) NOT LIKE 'aliment_ humedo%'
   AND LOWER(nombre) NOT LIKE 'alimentos humedos%';
