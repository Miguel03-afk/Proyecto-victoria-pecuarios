-- Migración: Campos adicionales en tabla proveedores
-- Victoria Pets — 2026
-- Ejecutar en MariaDB/MySQL si la tabla proveedores ya existe

ALTER TABLE proveedores
  ADD COLUMN IF NOT EXISTS contacto   VARCHAR(150) DEFAULT NULL    COMMENT 'Nombre del representante',
  ADD COLUMN IF NOT EXISTS telefono   VARCHAR(30)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS email      VARCHAR(150) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS activo     TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP;
