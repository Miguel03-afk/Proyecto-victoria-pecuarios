-- Migración 005: columnas de ePayco en la tabla ordenes
-- Ejecutar: mysql -u root victoria_pecuarios < migrations/005_pagos_epayco.sql

ALTER TABLE ordenes
  ADD COLUMN IF NOT EXISTS epayco_ref VARCHAR(100) NULL AFTER metodo_pago,
  ADD COLUMN IF NOT EXISTS epayco_id  VARCHAR(100) NULL AFTER epayco_ref;

-- Estado 'pendiente_pago' se usará para órdenes web esperando confirmación de ePayco
-- Estado 'pendiente'      para contraentrega / transferencia (esperando despacho)
-- Los valores anteriores 'pagada', 'cancelada', 'rechazada' siguen igual
