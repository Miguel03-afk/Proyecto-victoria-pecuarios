-- Migración 010: expiración de propuesta de reagendamiento (1 hora)
ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS reagendamiento_expira_en DATETIME NULL DEFAULT NULL
    AFTER reagendamiento_estado;
