-- Migración 008: permitir múltiples bloques de horario por día
-- Eliminar restricción UNIQUE en (veterinario_id, dia_semana) si existe
-- MySQL 8+: DROP INDEX IF EXISTS

ALTER TABLE veterinario_disponibilidad
  DROP INDEX IF EXISTS uq_vet_dia;

ALTER TABLE veterinario_disponibilidad
  DROP INDEX IF EXISTS veterinario_disponibilidad_veterinario_id_dia_semana_uq;

ALTER TABLE veterinario_disponibilidad
  DROP INDEX IF EXISTS veterinario_id;

-- Asegurarse de que exista columna activo con default 1
ALTER TABLE veterinario_disponibilidad
  MODIFY COLUMN activo TINYINT(1) NOT NULL DEFAULT 1;
