-- Columna para diferir la inserción en detalle_orden hasta confirmar pago ePayco
-- Mientras la orden tiene estado 'pendiente_pago', los ítems se guardan aquí
-- y se mueven a detalle_orden solo cuando el webhook confirma la transacción.
-- Esto evita que el trigger de detalle_orden descuente stock antes del pago real.
ALTER TABLE ordenes
  ADD COLUMN IF NOT EXISTS items_pendientes_json TEXT NULL AFTER ciudad_entrega;
