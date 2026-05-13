// backend/src/routes/ordenes-servicio.routes.js
// Órdenes de Servicio (consulta veterinaria + insumos)
//
// Flujo:
//  1) Recepcionista/admin POST /  → crea orden (estado 'pendiente') con precio base de config
//  2) Veterinario  GET /vet/mis-ordenes  → lista pendientes/en_consulta
//  3) Veterinario  PATCH /:id/diagnostico → escribe diagnóstico
//  4) Veterinario  POST /:id/items → agrega insumo (descuenta stock)
//  5) Veterinario  DELETE /:id/items/:itemId → corrige error (devuelve stock)
//  6) Veterinario  PATCH /:id/cerrar → estado 'esperando_pago'
//  7) Cajero       GET /cajero/pendientes-pago → lista esperando_pago
//  8) Cajero       PATCH /:id/pagar → estado 'completada'

import { Router } from "express";
import pool from "../db.js";
import { verificarToken, soloAdmin, soloRol } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verificarToken);

const codigoServicio = () => {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SRV-${ts}-${rnd}`;
};

const getPrecioBase = async () => {
  const [[row]] = await pool.query(
    "SELECT valor FROM config_sistema WHERE clave='precio_consulta_base'"
  );
  return Number(row?.valor ?? 56000);
};

/* ═══ CONFIG: precio base de consulta ═══════════════════════════════ */
router.get("/config/precio-consulta", async (_req, res) => {
  try {
    const valor = await getPrecioBase();
    res.json({ precio_consulta_base: valor });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/config/precio-consulta", soloAdmin, async (req, res) => {
  const valor = Number(req.body.valor);
  if (!Number.isFinite(valor) || valor < 0)
    return res.status(400).json({ error: "Valor inválido." });
  try {
    await pool.query(`
      INSERT INTO config_sistema (clave, valor, descripcion)
      VALUES ('precio_consulta_base', ?, 'Costo base de la consulta veterinaria (COP)')
      ON DUPLICATE KEY UPDATE valor = VALUES(valor)
    `, [String(valor)]);
    res.json({ ok: true, precio_consulta_base: valor });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ═══ POST / — Crear orden (check-in) ═══════════════════════════════ */
router.post("/", soloRol("admin", "superadmin", "cajero", "veterinario"), async (req, res) => {
  const {
    cliente_id, cita_id, veterinario_id,
    motivo_consulta, nombre_mascota, especie_mascota,
  } = req.body;

  if (!cliente_id) return res.status(400).json({ error: "Falta cliente_id." });

  try {
    const precio = await getPrecioBase();
    const codigo = codigoServicio();
    const [r] = await pool.query(`
      INSERT INTO ordenes_servicio
        (codigo, cliente_id, cita_id, veterinario_id, recepcionista_id,
         precio_consulta, total, estado, motivo_consulta, nombre_mascota, especie_mascota)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?)
    `, [codigo, cliente_id, cita_id || null, veterinario_id || null, req.usuario.id,
        precio, precio, motivo_consulta || null, nombre_mascota || null, especie_mascota || null]);

    res.status(201).json({ id: r.insertId, codigo, precio_consulta: precio, total: precio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la orden de servicio." });
  }
});

/* ═══ GET /vet/mis-ordenes ═══════════════════════════════════════════ */
router.get("/vet/mis-ordenes", soloRol("veterinario", "admin", "superadmin"), async (req, res) => {
  const { estado } = req.query;
  try {
    // Para vet, filtrar por sus órdenes; admin ve todas
    const esVet = req.usuario.rol === "veterinario";
    const [[vet]] = esVet
      ? await pool.query("SELECT id FROM veterinarios WHERE usuario_id = ?", [req.usuario.id])
      : [[null]];

    const where = [];
    const params = [];
    if (esVet && vet) { where.push("(os.veterinario_id = ? OR os.veterinario_id IS NULL)"); params.push(vet.id); }
    if (estado)       { where.push("os.estado = ?"); params.push(estado); }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [filas] = await pool.query(`
      SELECT os.id, os.codigo, os.estado, os.precio_consulta, os.subtotal_insumos, os.total,
             os.diagnostico, os.motivo_consulta, os.nombre_mascota, os.especie_mascota,
             os.created_at, os.cerrada_at,
             u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             u.telefono AS cliente_tel,
             (SELECT COUNT(*) FROM orden_servicio_items i WHERE i.orden_servicio_id = os.id) AS items_count
      FROM ordenes_servicio os
      JOIN usuarios u ON u.id = os.cliente_id
      ${whereSQL}
      ORDER BY
        CASE os.estado
          WHEN 'en_consulta' THEN 1
          WHEN 'pendiente'   THEN 2
          WHEN 'esperando_pago' THEN 3
          ELSE 4
        END,
        os.created_at DESC
      LIMIT 100
    `, params);

    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar órdenes." });
  }
});

/* ═══ GET /:id — Detalle ═════════════════════════════════════════════ */
router.get("/:id", async (req, res) => {
  try {
    const [[orden]] = await pool.query(`
      SELECT os.*,
             u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             u.telefono AS cliente_tel, u.email AS cliente_email
      FROM ordenes_servicio os
      JOIN usuarios u ON u.id = os.cliente_id
      WHERE os.id = ?
    `, [req.params.id]);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada." });

    const [items] = await pool.query(`
      SELECT osi.id, osi.producto_id, osi.nombre_snap, osi.cantidad, osi.precio_unitario, osi.subtotal,
             p.uso_clinico, p.marca
      FROM orden_servicio_items osi
      JOIN productos p ON p.id = osi.producto_id
      WHERE osi.orden_servicio_id = ?
      ORDER BY osi.id
    `, [req.params.id]);

    res.json({ orden, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══ PATCH /:id/diagnostico ════════════════════════════════════════ */
router.patch("/:id/diagnostico", soloRol("veterinario", "admin", "superadmin"), async (req, res) => {
  const { diagnostico, notas_internas } = req.body;
  try {
    const [[orden]] = await pool.query("SELECT estado FROM ordenes_servicio WHERE id = ?", [req.params.id]);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada." });
    if (orden.estado === "completada") return res.status(400).json({ error: "Orden ya cerrada." });

    await pool.query(`
      UPDATE ordenes_servicio
      SET diagnostico = ?, notas_internas = ?,
          estado = CASE WHEN estado = 'pendiente' THEN 'en_consulta' ELSE estado END
      WHERE id = ?
    `, [diagnostico || null, notas_internas || null, req.params.id]);

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ═══ POST /:id/items — Agregar insumo (descuenta stock) ════════════ */
router.post("/:id/items", soloRol("veterinario", "admin", "superadmin"), async (req, res) => {
  const { producto_id, cantidad = 1 } = req.body;
  if (!producto_id) return res.status(400).json({ error: "Falta producto_id." });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[orden]] = await conn.query(
      "SELECT id, estado FROM ordenes_servicio WHERE id = ? FOR UPDATE",
      [req.params.id]
    );
    if (!orden)                          { await conn.rollback(); return res.status(404).json({ error: "Orden no encontrada." }); }
    if (orden.estado === "completada" || orden.estado === "cancelada") {
      await conn.rollback();
      return res.status(400).json({ error: "Orden ya cerrada — no se pueden agregar insumos." });
    }

    const [[prod]] = await conn.query(`
      SELECT id, nombre, precio, stock, uso_clinico, activo
      FROM productos WHERE id = ? FOR UPDATE
    `, [producto_id]);
    if (!prod)             { await conn.rollback(); return res.status(404).json({ error: "Producto no encontrado." }); }
    if (!prod.uso_clinico) { await conn.rollback(); return res.status(400).json({ error: "Este producto no es de uso clínico." }); }
    if (prod.activo !== 1) { await conn.rollback(); return res.status(400).json({ error: "Producto inactivo." }); }
    if (prod.stock < cantidad) { await conn.rollback(); return res.status(400).json({ error: `Stock insuficiente. Solo quedan ${prod.stock} unidades.` }); }

    const precio = Number(prod.precio);
    const subtotal = precio * cantidad;

    // Insertar item
    await conn.query(`
      INSERT INTO orden_servicio_items
        (orden_servicio_id, producto_id, nombre_snap, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.params.id, producto_id, prod.nombre, cantidad, precio, subtotal]);

    // Descontar stock
    await conn.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [cantidad, producto_id]);

    // Registrar en historial_stock (si existe la tabla)
    try {
      await conn.query(`
        INSERT INTO historial_stock (producto_id, tipo_movimiento, cantidad, stock_antes, stock_despues, referencia, usuario_id)
        VALUES (?, 'venta', ?, ?, ?, ?, ?)
      `, [producto_id, cantidad, prod.stock, prod.stock - cantidad, `OS-${req.params.id}`, req.usuario.id]);
    } catch {}

    // Recalcular total de la orden
    const [[suma]] = await conn.query(
      "SELECT COALESCE(SUM(subtotal),0) AS s FROM orden_servicio_items WHERE orden_servicio_id = ?",
      [req.params.id]
    );
    await conn.query(`
      UPDATE ordenes_servicio
      SET subtotal_insumos = ?,
          total = precio_consulta + ?,
          estado = CASE WHEN estado = 'pendiente' THEN 'en_consulta' ELSE estado END
      WHERE id = ?
    `, [suma.s, suma.s, req.params.id]);

    await conn.commit();
    res.status(201).json({ ok: true, subtotal_insumos: Number(suma.s) });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Error al agregar insumo." });
  } finally {
    conn.release();
  }
});

/* ═══ DELETE /:id/items/:itemId — Eliminar (corrige error) ══════════ */
// Solo vet puede corregir
router.delete("/:id/items/:itemId", soloRol("veterinario", "admin", "superadmin"), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[item]] = await conn.query(`
      SELECT osi.id, osi.producto_id, osi.cantidad
      FROM orden_servicio_items osi
      JOIN ordenes_servicio os ON os.id = osi.orden_servicio_id
      WHERE osi.id = ? AND osi.orden_servicio_id = ? AND os.estado != 'completada'
    `, [req.params.itemId, req.params.id]);
    if (!item) { await conn.rollback(); return res.status(404).json({ error: "Item no encontrado o orden cerrada." }); }

    // Borrar item
    await conn.query("DELETE FROM orden_servicio_items WHERE id = ?", [item.id]);

    // Devolver stock
    await conn.query("UPDATE productos SET stock = stock + ? WHERE id = ?", [item.cantidad, item.producto_id]);

    // Recalcular total
    const [[suma]] = await conn.query(
      "SELECT COALESCE(SUM(subtotal),0) AS s FROM orden_servicio_items WHERE orden_servicio_id = ?",
      [req.params.id]
    );
    await conn.query(`
      UPDATE ordenes_servicio SET subtotal_insumos = ?, total = precio_consulta + ? WHERE id = ?
    `, [suma.s, suma.s, req.params.id]);

    await conn.commit();
    res.json({ ok: true, subtotal_insumos: Number(suma.s) });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/* ═══ PATCH /:id/cerrar — Cerrar consulta (esperando_pago) ══════════ */
router.patch("/:id/cerrar", soloRol("veterinario", "admin", "superadmin"), async (req, res) => {
  try {
    const [[orden]] = await pool.query("SELECT estado FROM ordenes_servicio WHERE id = ?", [req.params.id]);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada." });
    if (orden.estado === "completada" || orden.estado === "cancelada")
      return res.status(400).json({ error: "Orden ya cerrada." });

    await pool.query(`
      UPDATE ordenes_servicio
      SET estado = 'esperando_pago', cerrada_at = NOW()
      WHERE id = ?
    `, [req.params.id]);

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ═══ GET /cajero/pendientes-pago ═══════════════════════════════════ */
router.get("/cajero/pendientes-pago", soloRol("cajero", "admin", "superadmin"), async (_req, res) => {
  try {
    const [filas] = await pool.query(`
      SELECT os.id, os.codigo, os.precio_consulta, os.subtotal_insumos, os.total,
             os.diagnostico, os.motivo_consulta, os.nombre_mascota, os.especie_mascota,
             os.cerrada_at, os.created_at,
             u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             u.telefono AS cliente_tel,
             v.id AS vet_id, uv.nombre AS vet_nombre, uv.apellido AS vet_apellido,
             (SELECT COUNT(*) FROM orden_servicio_items i WHERE i.orden_servicio_id = os.id) AS items_count
      FROM ordenes_servicio os
      JOIN usuarios u ON u.id = os.cliente_id
      LEFT JOIN veterinarios v ON v.id = os.veterinario_id
      LEFT JOIN usuarios uv ON uv.id = v.usuario_id
      WHERE os.estado = 'esperando_pago'
      ORDER BY os.cerrada_at ASC
    `);
    res.json(filas);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ═══ PATCH /:id/pagar — Procesar pago (cajero) ═════════════════════ */
router.patch("/:id/pagar", soloRol("cajero", "admin", "superadmin"), async (req, res) => {
  const { metodo_pago = "efectivo" } = req.body;
  try {
    const [[orden]] = await pool.query("SELECT estado FROM ordenes_servicio WHERE id = ?", [req.params.id]);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada." });
    if (orden.estado !== "esperando_pago")
      return res.status(400).json({ error: "La orden no está lista para pago." });

    await pool.query(`
      UPDATE ordenes_servicio
      SET estado = 'completada', pagada_at = NOW(), cajero_id = ?, notas_internas = COALESCE(notas_internas, ?)
      WHERE id = ?
    `, [req.usuario.id, `Método: ${metodo_pago}`, req.params.id]);

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ═══ Stats: ventas con insumos médicos para reportes ══════════════ */
router.get("/stats/insumos", soloRol("admin", "superadmin", "veterinario"), async (req, res) => {
  try {
    const [[totales]] = await pool.query(`
      SELECT
        COUNT(DISTINCT os.id) AS consultas_con_insumos,
        COALESCE(SUM(osi.subtotal), 0) AS total_insumos,
        COALESCE(SUM(osi.cantidad), 0) AS unidades_dispensadas
      FROM ordenes_servicio os
      JOIN orden_servicio_items osi ON osi.orden_servicio_id = os.id
      WHERE os.estado = 'completada'
    `);
    res.json(totales);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
