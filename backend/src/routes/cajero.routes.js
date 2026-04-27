import { Router } from "express";
import db from "../db.js";
import { verificarToken, soloRol } from "../middlewares/auth.middleware.js";

const router = Router();
const auth = [verificarToken, soloRol("cajero", "admin", "superadmin")];

// ── PRODUCTOS: búsqueda rápida para el POS ────────────────────
router.get("/productos", auth, async (req, res) => {
  const { buscar = "" } = req.query;
  try {
    let q = `SELECT id, nombre, precio, stock, imagen_url, marca, unidad, codigo_barra
             FROM productos WHERE activo = 1`;
    const params = [];
    if (buscar.trim()) {
      // Búsqueda por nombre, marca O código de barras exacto
      q += " AND (nombre LIKE ? OR marca LIKE ? OR codigo_barra = ?)";
      params.push(`%${buscar}%`, `%${buscar}%`, buscar.trim());
    }
    q += " ORDER BY nombre ASC LIMIT 30";
    const [rows] = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CLIENTES: búsqueda por nombre, apellido, doc o email ──────
router.get("/clientes", auth, async (req, res) => {
  const { buscar = "" } = req.query;
  if (!buscar.trim()) return res.json([]);
  try {
    const t = `%${buscar}%`;
    const [rows] = await db.query(
      `SELECT id, nombre, apellido, email, numero_documento, telefono
       FROM usuarios
       WHERE activo = 1
         AND (nombre LIKE ? OR apellido LIKE ? OR numero_documento LIKE ? OR email LIKE ?)
       ORDER BY nombre ASC LIMIT 10`,
      [t, t, t, t]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── MIS VENTAS: historial del cajero autenticado ──────────────
router.get("/mis-ventas", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.id, o.codigo, o.total, o.iva_total, o.estado,
              o.metodo_pago, o.created_at,
              CONCAT(u.nombre,' ',u.apellido) AS cliente,
              COUNT(d.id) AS items
       FROM ordenes o
       LEFT JOIN usuarios u ON o.usuario_id = u.id
       LEFT JOIN detalle_orden d ON d.orden_id = o.id
       WHERE o.cajero_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 100`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CREAR VENTA desde el POS ──────────────────────────────────
router.post("/facturas", auth, async (req, res) => {
  const { usuario_id, items, metodo_pago, notas } = req.body;
  if (!items?.length)
    return res.status(400).json({ error: "Se requieren productos." });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const IVA_PCT = 19;
    let subtotal = 0;

    for (const item of items) {
      const [[prod]] = await conn.query(
        "SELECT precio, precio_costo, stock FROM productos WHERE id = ? AND activo = 1",
        [item.producto_id]
      );
      if (!prod) throw new Error(`Producto ${item.producto_id} no encontrado.`);
      if (prod.stock < item.cantidad)
        throw new Error(`Stock insuficiente para el producto ${item.producto_id}.`);
      item._precio       = prod.precio;
      item._precio_costo = prod.precio_costo || 0;
      subtotal += prod.precio * item.cantidad;
    }

    const total = subtotal;
    let iva_total = 0, ganancia_total = 0;
    for (const item of items) {
      iva_total      += +(item._precio * item.cantidad * IVA_PCT / 100).toFixed(2);
      ganancia_total += +((item._precio - item._precio_costo) * item.cantidad).toFixed(2);
    }

    const anio = new Date().getFullYear();
    const [[{ ultimo }]] = await conn.query(
      "SELECT COUNT(*) AS ultimo FROM ordenes WHERE YEAR(created_at) = ?", [anio]
    );
    const codigo = `VIC-${anio}-${String(ultimo + 1).padStart(5, "0")}`;

    const [ord] = await conn.query(
      `INSERT INTO ordenes
         (usuario_id, cajero_id, codigo, estado, subtotal, descuento, total,
          iva_total, ganancia_total, metodo_pago, notas)
       VALUES (?, ?, ?, 'pagada', ?, 0, ?, ?, ?, ?, ?)`,
      [
        usuario_id || null,
        req.usuario.id,
        codigo,
        subtotal, total,
        iva_total, ganancia_total,
        metodo_pago || "efectivo",
        notas || null,
      ]
    );
    const orden_id = ord.insertId;

    for (const item of items) {
      const item_subtotal = +(item._precio * item.cantidad).toFixed(2);
      const iva_valor     = +(item_subtotal * IVA_PCT / 100).toFixed(2);
      const ganancia      = +((item._precio - item._precio_costo) * item.cantidad).toFixed(2);

      await conn.query(
        `INSERT INTO detalle_orden
           (orden_id, producto_id, nombre_snap, cantidad, precio_unit, precio_costo,
            subtotal, iva_porcentaje, iva_valor, ganancia)
         SELECT ?, id, nombre, ?, ?, ?, ?, ?, ?, ?
         FROM productos WHERE id = ?`,
        [
          orden_id,
          item.cantidad, item._precio, item._precio_costo,
          item_subtotal, IVA_PCT, iva_valor, ganancia,
          item.producto_id,
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ mensaje: "Venta registrada.", orden_id, codigo });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

export default router;