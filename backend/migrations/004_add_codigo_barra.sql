-- Código de barras en productos (escáner POS y admin)
ALTER TABLE productos
  ADD COLUMN codigo_barra VARCHAR(100) NULL DEFAULT NULL,
  ADD INDEX  idx_codigo_barra (codigo_barra);
