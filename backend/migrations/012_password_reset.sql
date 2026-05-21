-- ──────────────────────────────────────────────────────────────────────
-- 012_password_reset.sql
-- Ejecutar: mysql -u root victoria_pecuarios < migrations/012_password_reset.sql
--
-- Agrega soporte para "Olvidé mi contraseña":
--   - reset_token         → token aleatorio (64 chars hex) generado al solicitar reset
--   - reset_token_expira  → DATETIME hasta cuándo es válido el token (10 min)
--   - índice              → para búsqueda rápida del token al validarlo
--
-- Compatibilidad: usuarios EXISTENTES quedan con reset_token = NULL,
-- nada se rompe. Las columnas son NULLABLE.
-- ──────────────────────────────────────────────────────────────────────

ALTER TABLE usuarios
  ADD COLUMN reset_token        VARCHAR(64) NULL,
  ADD COLUMN reset_token_expira DATETIME    NULL;

-- Índice para acelerar la búsqueda por token al validar el link del email.
-- Es UNIQUE porque dos usuarios no pueden tener el mismo token al mismo tiempo.
CREATE UNIQUE INDEX idx_reset_token ON usuarios (reset_token);

-- ──────────────────────────────────────────────────────────────────────
-- Verificación (opcional, después de correr la migración):
--
--   DESCRIBE usuarios;
--   -- Deberías ver reset_token y reset_token_expira al final
--
--   SHOW INDEX FROM usuarios WHERE Key_name = 'idx_reset_token';
--   -- Deberías ver el índice listado
-- ──────────────────────────────────────────────────────────────────────
