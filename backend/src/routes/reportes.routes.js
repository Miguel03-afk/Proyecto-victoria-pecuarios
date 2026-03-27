// backend/src/routes/reportes.routes.js
import { Router } from 'express';
import db from '../db.js';
import { verificarToken, soloAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// ──────────────────────────────────────────
// GET /api/reportes/ventas
// Query params: fecha_inicio, fecha_fin, estado
// ──────────────────────────────────────────
router.get('/ventas', verificarToken, soloAdmin, async (req, res) => {
  const { fecha_inicio, fecha_fin, estado } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (fecha_inicio) {
    whereClause += ' AND DATE(o.created_at) >= ?';
    params.push(fecha_inicio);
  }
  if (fecha_fin) {
    whereClause += ' AND DATE(o.created_at) <= ?';
    params.push(fecha_fin);
  }
  if (estado && estado !== 'todos') {
    whereClause += ' AND o.estado = ?';
    params.push(estado);
  }

  const [ordenes] = await db.query(
    `SELECT
       o.id,
       o.codigo,
       o.estado,
       o.subtotal,
       o.descuento,
       o.iva_total,
       o.ganancia_total,
       o.total,
       o.metodo_pago,
       o.created_at,
       CONCAT(u.nombre, ' ', u.apellido) AS cliente,
       u.email AS cliente_email,
       COUNT(d.id) AS num_productos
     FROM ordenes o
     LEFT JOIN usuarios u ON o.usuario_id = u.id
     LEFT JOIN detalle_orden d ON d.orden_id = o.id
     ${whereClause}
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    params
  );

  // Totales del período
  const [totales] = await db.query(
    `SELECT
       COUNT(*) AS total_ordenes,
       COALESCE(SUM(total), 0)          AS ingresos_totales,
       COALESCE(SUM(iva_total), 0)      AS iva_total_periodo,
       COALESCE(SUM(ganancia_total), 0) AS ganancia_total_periodo,
       COALESCE(SUM(subtotal), 0)       AS subtotal_periodo
     FROM ordenes o
     ${whereClause}`,
    params
  );

  res.json({ ordenes, totales: totales[0] });
});

// ──────────────────────────────────────────
// GET /api/reportes/ventas/:id/detalle
// Detalle de una orden con ganancia e IVA por ítem
// ──────────────────────────────────────────
router.get('/ventas/:id/detalle', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;

  const [orden] = await db.query(
    `SELECT o.*, CONCAT(u.nombre,' ',u.apellido) AS cliente, u.email
     FROM ordenes o LEFT JOIN usuarios u ON o.usuario_id = u.id
     WHERE o.id = ?`,
    [id]
  );
  if (!orden.length) return res.status(404).json({ error: 'Orden no encontrada' });

  const [items] = await db.query(
    `SELECT d.*, p.imagen_url
     FROM detalle_orden d
     LEFT JOIN productos p ON d.producto_id = p.id
     WHERE d.orden_id = ?`,
    [id]
  );

  res.json({ orden: orden[0], items });
});

// ──────────────────────────────────────────
// GET /api/reportes/stock-salidas
// Query params: fecha_inicio, fecha_fin, tipo_movimiento, producto_id
// ──────────────────────────────────────────
router.get('/stock-salidas', verificarToken, soloAdmin, async (req, res) => {
  const { fecha_inicio, fecha_fin, tipo_movimiento, producto_id } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (fecha_inicio) {
    whereClause += ' AND DATE(h.fecha) >= ?';
    params.push(fecha_inicio);
  }
  if (fecha_fin) {
    whereClause += ' AND DATE(h.fecha) <= ?';
    params.push(fecha_fin);
  }
  if (tipo_movimiento && tipo_movimiento !== 'todos') {
    whereClause += ' AND h.tipo_movimiento = ?';
    params.push(tipo_movimiento);
  }
  if (producto_id) {
    whereClause += ' AND h.producto_id = ?';
    params.push(producto_id);
  }

  const [movimientos] = await db.query(
    `SELECT
       h.id,
       h.producto_id,
       h.nombre_snap,
       h.stock_anterior,
       h.cantidad,
       h.stock_nuevo,
       h.tipo_movimiento,
       h.referencia_id,
       h.fecha,
       CONCAT(u.nombre, ' ', u.apellido) AS usuario,
       p.imagen_url
     FROM historial_stock h
     LEFT JOIN usuarios u ON h.usuario_id = u.id
     LEFT JOIN productos p ON h.producto_id = p.id
     ${whereClause}
     ORDER BY h.fecha DESC
     LIMIT 500`,
    params
  );

  const [resumen] = await db.query(
    `SELECT
       tipo_movimiento,
       COUNT(*) AS total_movimientos,
       SUM(cantidad) AS total_unidades
     FROM historial_stock h
     ${whereClause}
     GROUP BY tipo_movimiento`,
    params
  );

  res.json({ movimientos, resumen });
});

export default router;