-- 011_uso_clinico_servicios.sql
-- Marca productos como insumos médicos y soporta órdenes de servicio veterinario.

-- 1) Productos: flag uso_clinico
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS uso_clinico TINYINT(1) NOT NULL DEFAULT 0 AFTER requiere_formula;

-- 2) Configuración global del sistema (precios base, etc.)
CREATE TABLE IF NOT EXISTS config_sistema (
  clave   VARCHAR(64)  PRIMARY KEY,
  valor   VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Precio base de la consulta veterinaria — editable desde el admin
INSERT IGNORE INTO config_sistema (clave, valor, descripcion)
VALUES ('precio_consulta_base', '56000', 'Costo base de la consulta veterinaria (COP)');

-- 3) Tabla de órdenes de servicio (consultas + insumos)
-- Estados: pendiente → en_consulta → esperando_pago → completada → cancelada
CREATE TABLE IF NOT EXISTS ordenes_servicio (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(32) UNIQUE NOT NULL,
  cita_id         INT NULL,
  cliente_id      INT NOT NULL,
  veterinario_id  INT NULL,
  recepcionista_id INT NULL,
  cajero_id       INT NULL,

  precio_consulta DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal_insumos DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,

  estado          ENUM('pendiente','en_consulta','esperando_pago','completada','cancelada')
                  NOT NULL DEFAULT 'pendiente',

  diagnostico     TEXT,
  notas_internas  TEXT,

  motivo_consulta VARCHAR(255),
  nombre_mascota  VARCHAR(120),
  especie_mascota VARCHAR(80),

  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  cerrada_at      DATETIME NULL,
  pagada_at       DATETIME NULL,

  FOREIGN KEY (cita_id)         REFERENCES citas(id)         ON DELETE SET NULL,
  FOREIGN KEY (cliente_id)      REFERENCES usuarios(id),
  FOREIGN KEY (veterinario_id)  REFERENCES veterinarios(id)  ON DELETE SET NULL,
  FOREIGN KEY (recepcionista_id) REFERENCES usuarios(id)     ON DELETE SET NULL,
  FOREIGN KEY (cajero_id)       REFERENCES usuarios(id)      ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_cliente (cliente_id),
  INDEX idx_vet (veterinario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) Items (insumos médicos agregados durante la consulta)
CREATE TABLE IF NOT EXISTS orden_servicio_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  orden_servicio_id INT NOT NULL,
  producto_id       INT NOT NULL,
  nombre_snap       VARCHAR(255) NOT NULL,
  cantidad          INT NOT NULL DEFAULT 1,
  precio_unitario   DECIMAL(10,2) NOT NULL,
  subtotal          DECIMAL(10,2) NOT NULL,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_servicio_id) REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id)       REFERENCES productos(id),
  INDEX idx_orden (orden_servicio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) Marcar algunos productos como uso clínico para pruebas (vacunas, antiparasitarios, etc.)
UPDATE productos
SET uso_clinico = 1
WHERE LOWER(nombre) LIKE '%vacun%'
   OR LOWER(nombre) LIKE '%antiparasit%'
   OR LOWER(nombre) LIKE '%desparasit%'
   OR LOWER(nombre) LIKE '%antibio%'
   OR LOWER(nombre) LIKE '%analges%'
   OR LOWER(nombre) LIKE '%inyect%'
   OR LOWER(nombre) LIKE '%suero%';
