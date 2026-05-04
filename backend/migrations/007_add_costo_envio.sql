-- Migración 007: columna costo_envio en la tabla ordenes
-- Ejecutar: mysql -u root victoria_pecuarios < migrations/007_add_costo_envio.sql

ALTER TABLE ordenes
  ADD COLUMN IF NOT EXISTS costo_envio DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER subtotal;
