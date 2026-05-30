-- 016_remove_veterinario_scope.sql
-- Eliminación COMPLETA del scope clínico/veterinario.
-- Victoria Pets es una TIENDA veterinaria, no una clínica.
-- Esto elimina citas, agendamiento, perfiles de vets, disponibilidad,
-- anomalías clínicas, órdenes de uso clínico y el rol 'veterinario'.
--
-- ORDEN IMPORTANTE: respetar FK constraints. Borrar hijos antes que padres.
-- Ejecutar con usuario que tenga DROP TABLE, ALTER TABLE, DELETE.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- ¡LEER ANTES DE EJECUTAR!
-- Este script es IRREVERSIBLE. Haz un dump de la DB antes:
--   mysqldump -u root -p victoria_pecuarios > backup_previo_016.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 0. Seleccionar la base de datos correcta ────────────────────────────────
USE victoria_pecuarios;

-- ─── 0b. Deshabilitar FK checks para poder borrar sin importar el orden ───────
-- Se reactivan al final. Si el script falla a mitad, reconecta y corre
-- SET FOREIGN_KEY_CHECKS = 1; manualmente antes de continuar.
SET FOREIGN_KEY_CHECKS = 0;

-- ─── 1. Tablas hijas de `citas` ──────────────────────────────────────────────
DROP TABLE IF EXISTS citas_anomalias;

-- ─── 2. Tabla de turnos de cajero que referencia citas (si existe FK) ────────
-- cajero_turnos no tiene FK a citas — se queda (es funcionalidad válida).

-- ─── 3. Tabla principal de citas ─────────────────────────────────────────────
DROP TABLE IF EXISTS citas;

-- ─── 4. Tablas de perfil veterinario ─────────────────────────────────────────
DROP TABLE IF EXISTS veterinario_disponibilidad;
DROP TABLE IF EXISTS veterinarios;

-- ─── 5. Órdenes de uso clínico interno ───────────────────────────────────────
-- Estas órdenes eran para que el vet consuma insumos durante una consulta.
-- Sin vets, no tienen sentido.
DROP TABLE IF EXISTS ordenes_servicio;

-- ─── 6. Columna uso_clinico de productos ─────────────────────────────────────
-- Los productos de "uso clínico" son una categoría de negocio que solo tenía
-- sentido si había veterinarios internos consumiéndolos. Como ahora solo hay
-- clientes y cajeros, todos los productos son vendibles al público.
ALTER TABLE productos DROP COLUMN IF EXISTS uso_clinico;

-- ─── 7. Alterar ENUM de rol en usuarios ──────────────────────────────────────
-- Quitar 'veterinario' del ENUM. MySQL requiere redefinir el ENUM completo.
-- Primero: actualizar cualquier usuario con rol 'veterinario' a 'cliente'.
UPDATE usuarios SET rol = 'cliente' WHERE rol = 'veterinario';

-- Luego: redefinir la columna con el ENUM sin 'veterinario'.
ALTER TABLE usuarios
  MODIFY COLUMN rol ENUM('cliente','cajero','admin','superadmin')
    NOT NULL DEFAULT 'cliente';

-- ─── 8. Limpiar columnas de reagendamiento en ordenes (si aplica) ───────────
-- La tabla ordenes tiene items_pendientes_json y cajero_id que SÍ se quedan.
-- No hay columnas de citas en ordenes — nada que limpiar aquí.

-- ─── 9. (Opcional) Borrar favoritos de la tabla si hay FK rota ───────────────
-- La tabla favoritos referencia productos (activos) — se queda intacta.

-- ─── Reactivar FK checks ─────────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 1;

-- ─── Verificación final ───────────────────────────────────────────────────────
SELECT 'Migración 016 ejecutada correctamente.' AS resultado;
SHOW TABLES;
