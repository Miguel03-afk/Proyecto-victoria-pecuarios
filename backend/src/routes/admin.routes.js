import { Router } from "express";
import db from "../db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";
 
const router = Router();
router.use(verificarToken, soloAdmin);
 
// ── STATS DASHBOARD ──────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [[{ total_usuarios }]] = await db.query("SELECT COUNT(*) AS total_usuarios FROM usuarios WHERE rol='cliente'");
    const [[{ total_productos }]] = await db.query("SELECT COUNT(*) AS total_productos FROM productos WHERE activo=1");
    const [[{ total_ordenes }]]   = await db.query("SELECT COUNT(*) AS total_ordenes FROM ordenes");
    const [[{ ingresos }]]        = await db.query("SELECT COALESCE(SUM(total),0) AS ingresos FROM ordenes WHERE estado != 'cancelada'");
    const [[{ stock_bajo }]]      = await db.query("SELECT COUNT(*) AS stock_bajo FROM productos WHERE stock <= stock_minimo AND activo=1");
 
    // Ventas por mes (últimos 6 meses)
    const [ventas_mes] = await db.query(`
      SELECT DATE_FORMAT(created_at,'%Y-%m') AS mes,
             COUNT(*) AS ordenes,
             COALESCE(SUM(total),0) AS total
      FROM ordenes
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND estado != 'cancelada'
      GROUP BY mes ORDER BY mes ASC`);
 
    const [ordenes_recientes] = await db.query(`
      SELECT o.id, o.codigo, o.total, o.estado, o.created_at,
             CONCAT(u.nombre,' ',u.apellido) AS cliente
      FROM ordenes o JOIN usuarios u ON o.usuario_id=u.id
      ORDER BY o.created_at DESC LIMIT 6`);
 
    const [productos_stock_bajo] = await db.query(`
      SELECT id, nombre, stock, stock_minimo FROM productos
      WHERE stock <= stock_minimo AND activo=1 ORDER BY stock ASC LIMIT 5`);
 
    res.json({ total_usuarios, total_productos, total_ordenes, ingresos,
               stock_bajo, ventas_mes, ordenes_recientes, productos_stock_bajo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener estadísticas." });
  }
});
 
// ── USUARIOS ─────────────────────────────────────────────────
router.get("/usuarios", async (req, res) => {
  try {
    const { buscar = "", pagina = 1, limite = 12 } = req.query;
    const offset = (pagina - 1) * limite;
    let q = `SELECT id,nombre,apellido,email,telefono,tipo_documento,
             numero_documento,rol,activo,created_at FROM usuarios WHERE 1=1`;
    const p = [];
    if (buscar) {
      q += " AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR numero_documento LIKE ?)";
      const t = `%${buscar}%`;
      p.push(t,t,t,t);
    }
    q += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    p.push(Number(limite), Number(offset));
    const [rows] = await db.query(q, p);
    const [[{ total }]] = await db.query(
      buscar
        ? "SELECT COUNT(*) AS total FROM usuarios WHERE nombre LIKE ? OR email LIKE ?"
        : "SELECT COUNT(*) AS total FROM usuarios",
      buscar ? [`%${buscar}%`,`%${buscar}%`] : []
    );
    res.json({ usuarios: rows, total });
  } catch (err) { res.status(500).json({ error: "Error al obtener usuarios." }); }
});
 
router.get("/usuarios/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id,nombre,apellido,email,telefono,tipo_documento,numero_documento,
              rol,activo,avatar_url,created_at FROM usuarios WHERE id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado." });
    const [ordenes] = await db.query(
      `SELECT o.id,o.codigo,o.total,o.estado,o.metodo_pago,o.created_at,
              COUNT(d.id) AS items
       FROM ordenes o
       LEFT JOIN detalle_orden d ON d.orden_id=o.id
       WHERE o.usuario_id=?
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.params.id]
    );
    const [[{ total_gastado }]] = await db.query(
      "SELECT COALESCE(SUM(total),0) AS total_gastado FROM ordenes WHERE usuario_id=? AND estado!='cancelada'",
      [req.params.id]
    );
    res.json({ ...rows[0], ordenes, total_gastado });
  } catch (err) { res.status(500).json({ error: "Error." }); }
});
 
router.put("/usuarios/:id", async (req, res) => {
  const { nombre, apellido, email, telefono, tipo_documento, numero_documento, rol, activo } = req.body;
  try {
    await db.query(
      `UPDATE usuarios SET
         nombre=COALESCE(?,nombre), apellido=COALESCE(?,apellido),
         email=COALESCE(?,email), telefono=COALESCE(?,telefono),
         tipo_documento=COALESCE(?,tipo_documento),
         numero_documento=COALESCE(?,numero_documento),
         rol=COALESCE(?,rol), activo=COALESCE(?,activo)
       WHERE id=?`,
      [nombre??null, apellido??null, email??null, telefono??null,
       tipo_documento??null, numero_documento??null, rol??null, activo??null,
       req.params.id]
    );
    res.json({ mensaje: "Usuario actualizado." });
  } catch (err) { res.status(500).json({ error: "Error al actualizar." }); }
});
 
router.patch("/usuarios/:id/password", async (req, res) => {
  const { nueva_password } = req.body;
  if (!nueva_password || nueva_password.length < 6)
    return res.status(400).json({ error: "Mínimo 6 caracteres." });
  try {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.default.hash(nueva_password, 10);
    await db.query("UPDATE usuarios SET password_hash=? WHERE id=?", [hash, req.params.id]);
    res.json({ mensaje: "Contraseña actualizada." });
  } catch (err) { res.status(500).json({ error: "Error." }); }
});
 
router.delete("/usuarios/:id", async (req, res) => {
  if (req.params.id == req.usuario.id)
    return res.status(400).json({ error: "No puedes eliminarte a ti mismo." });
  try {
    await db.query("UPDATE usuarios SET activo=0 WHERE id=?", [req.params.id]);
    res.json({ mensaje: "Usuario desactivado." });
  } catch (err) { res.status(500).json({ error: "Error." }); }
});
 
// ── PRODUCTOS ─────────────────────────────────────────────────
router.get("/productos", async (req, res) => {
  try {
    const { buscar = "", pagina = 1, limite = 12 } = req.query;
    const offset = (pagina - 1) * limite;
    let q = `SELECT p.id,p.nombre,p.slug,p.precio,p.precio_antes,p.stock,
             p.stock_minimo,p.activo,p.destacado,p.imagen_url,p.marca,
             c.nombre AS categoria
             FROM productos p JOIN categorias c ON p.categoria_id=c.id WHERE 1=1`;
    const params = [];
    if (buscar) { q += " AND p.nombre LIKE ?"; params.push(`%${buscar}%`); }
    q += " ORDER BY p.id DESC LIMIT ? OFFSET ?";
    params.push(Number(limite), Number(offset));
    const [rows] = await db.query(q, params);
    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM productos");
    res.json({ productos: rows, total });
  } catch (err) { res.status(500).json({ error: "Error." }); }
});
 
// ── ÓRDENES ───────────────────────────────────────────────────
router.get("/ordenes", async (req, res) => {
  try {
    const { estado = "", pagina = 1, limite = 12 } = req.query;
    const offset = (pagina - 1) * limite;
    let q = `SELECT o.id,o.codigo,o.total,o.estado,o.metodo_pago,o.created_at,
             o.direccion_entrega,o.ciudad_entrega,
             CONCAT(u.nombre,' ',u.apellido) AS cliente, u.email
             FROM ordenes o JOIN usuarios u ON o.usuario_id=u.id WHERE 1=1`;
    const params = [];
    if (estado) { q += " AND o.estado=?"; params.push(estado); }
    q += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limite), Number(offset));
    const [rows] = await db.query(q, params);
    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM ordenes");
    res.json({ ordenes: rows, total });
  } catch (err) { res.status(500).json({ error: "Error." }); }
});
 
router.patch("/ordenes/:id/estado", async (req, res) => {
  const { estado } = req.body;
  const validos = ["pendiente","pagada","procesando","enviada","entregada","cancelada"];
  if (!validos.includes(estado)) return res.status(400).json({ error: "Estado inválido." });
  try {
    await db.query("UPDATE ordenes SET estado=? WHERE id=?", [estado, req.params.id]);
    res.json({ mensaje: "Estado actualizado." });
  } catch (err) { res.status(500).json({ error: "Error." }); }
});
 
// ── FACTURA MANUAL ────────────────────────────────────────────
router.post("/facturas", async (req, res) => {
  const { usuario_id, items, metodo_pago, direccion_entrega, ciudad_entrega, notas } = req.body;
  if (!usuario_id || !items?.length)
    return res.status(400).json({ error: "usuario_id e items son requeridos." });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let subtotal = 0;
    for (const item of items) {
      const [[prod]] = await conn.query("SELECT precio, stock FROM productos WHERE id=?", [item.producto_id]);
      if (!prod) throw new Error(`Producto ${item.producto_id} no encontrado.`);
      if (prod.stock < item.cantidad) throw new Error(`Stock insuficiente para producto ${item.producto_id}.`);
      item._precio = prod.precio;
      subtotal += prod.precio * item.cantidad;
    }
    const total = subtotal;
    const anio = new Date().getFullYear();
    const [[{ ultimo }]] = await conn.query("SELECT COUNT(*) AS ultimo FROM ordenes WHERE YEAR(created_at)=?", [anio]);
    const codigo = `VIC-${anio}-${String(ultimo + 1).padStart(5,"0")}`;
    const [ord] = await conn.query(
      `INSERT INTO ordenes (usuario_id,codigo,estado,subtotal,descuento,total,metodo_pago,
        direccion_entrega,ciudad_entrega,notas)
       VALUES (?,?,'pagada',?,0,?,?,?,?,?)`,
      [usuario_id, codigo, subtotal, total, metodo_pago||"efectivo",
       direccion_entrega||null, ciudad_entrega||null, notas||null]
    );
    const orden_id = ord.insertId;
    for (const item of items) {
      await conn.query(
        `INSERT INTO detalle_orden (orden_id,producto_id,nombre_snap,cantidad,precio_unit,subtotal)
         SELECT ?,id,nombre,?,?,? FROM productos WHERE id=?`,
        [orden_id, item.cantidad, item._precio, item._precio * item.cantidad, item.producto_id]
      );
    }
    await conn.commit();
    res.status(201).json({ mensaje: "Factura creada.", orden_id, codigo });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally { conn.release(); }
});
 
export default router;