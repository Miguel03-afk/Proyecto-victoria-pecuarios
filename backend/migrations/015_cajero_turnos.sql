-- 015_cajero_turnos.sql
-- Turnos de caja por cajero. Cada cajero abre un turno con un monto inicial
-- (base de apertura) y lo cierra al final del día declarando el monto final
-- contado. El admin puede ver y cuadrar los turnos desde su panel.
--
-- Reglas:
--  - Un cajero NO puede tener dos turnos abiertos simultáneamente (validado en
--    backend; aquí queda como índice para acelerar la query).
--  - cerrado_at NULL = turno abierto.
--  - monto_cierre y diferencia son nullable hasta que se cierre.
--  - diferencia = (monto_cierre) - (monto_apertura + total_ventas_efectivo).
--    Se calcula en el endpoint al cerrar y se persiste para histórico.

CREATE TABLE IF NOT EXISTS cajero_turnos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cajero_id       INT NOT NULL,
  monto_apertura  DECIMAL(12,2) NOT NULL DEFAULT 0,
  monto_cierre    DECIMAL(12,2) NULL DEFAULT NULL,
  total_ventas    DECIMAL(12,2) NOT NULL DEFAULT 0,
  diferencia      DECIMAL(12,2) NULL DEFAULT NULL,
  abierto_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cerrado_at      DATETIME NULL DEFAULT NULL,
  observaciones   TEXT NULL,
  CONSTRAINT fk_turno_cajero FOREIGN KEY (cajero_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_turno_cajero_abierto (cajero_id, cerrado_at),
  INDEX idx_turno_fecha (abierto_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
