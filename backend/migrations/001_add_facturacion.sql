-- Migración: Agregar columna facturacion a tabla usuarios
-- Victoria Pets — 2026
-- Ejecutar en MariaDB/MySQL antes de iniciar el servidor

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS facturacion JSON DEFAULT NULL
  COMMENT 'Datos de facturación (razón social, tipo/número documento, dirección)';
