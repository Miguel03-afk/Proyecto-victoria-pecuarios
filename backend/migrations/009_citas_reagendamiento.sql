-- Migración 009: reagendamiento de citas
-- Permite al admin proponer nueva fecha/hora y que el cliente responda

ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS reagendamiento_motivo     TEXT        NULL AFTER notas_vet,
  ADD COLUMN IF NOT EXISTS reagendamiento_nueva_fecha DATE        NULL AFTER reagendamiento_motivo,
  ADD COLUMN IF NOT EXISTS reagendamiento_nueva_hora  TIME        NULL AFTER reagendamiento_nueva_fecha,
  ADD COLUMN IF NOT EXISTS reagendamiento_estado      ENUM('ninguno','propuesta','aceptada','rechazada')
                                                       NOT NULL DEFAULT 'ninguno' AFTER reagendamiento_nueva_hora;
