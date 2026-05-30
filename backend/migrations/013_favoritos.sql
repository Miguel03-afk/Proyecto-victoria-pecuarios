-- 013_favoritos.sql
-- Tabla de productos favoritos por usuario.
-- - PK compuesta (usuario_id, producto_id) garantiza un solo registro por par.
-- - ON DELETE CASCADE: si se borra el usuario o el producto, el favorito se va.
-- - created_at para ordenar "Favoritos más recientes primero".

CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id  INT NOT NULL,
  producto_id INT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, producto_id),
  CONSTRAINT fk_favoritos_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  CONSTRAINT fk_favoritos_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_favoritos_usuario (usuario_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
