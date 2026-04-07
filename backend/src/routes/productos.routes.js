// backend/src/routes/productos.routes.js
// CRÍTICO: /destacados/lista debe ir ANTES de /:slug
// Si va después, Express captura "destacados" como slug → 404
 
import { Router } from "express";
import db from "../db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";
 
const router = Router();
 
// ── GET / — catálogo paginado con filtros ─────────────────────
router.get("/", async (req, res) => {
  try {
    const { buscar = "", categoria = "", pagina = 1, limite = 12 } = req.query;
    const offset = (Number(pagina) - 1) * Number(limite);
 
    let q = `
      SELECT p.id, p.nombre, p.slug, p.descripcion_corta,
             p.precio, p.precio_antes, p.precio_costo,
             p.stock, p.stock_minimo, p.imagen_url,
             p.marca, p.unidad, p.activo, p.destacado,
             c.nombre AS categoria, c.slug AS categoria_slug
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1`;
    const params = [];
    if (buscar)    { q += " AND p.nombre LIKE ?"; params.push(`%${buscar}%`); }
    if (categoria) { q += " AND c.slug = ?";      params.push(categoria); }
 
    const countQ = `SELECT COUNT(*) AS total FROM productos p
                    JOIN categorias c ON p.categoria_id = c.id
                    WHERE p.activo = 1
                    ${buscar    ? " AND p.nombre LIKE ?" : ""}
                    ${categoria ? " AND c.slug = ?"      : ""}`;
    const countParams = [
      ...(buscar    ? [`%${buscar}%`] : []),
      ...(categoria ? [categoria]     : []),
    ];
 
    q += " ORDER BY p.destacado DESC, p.id DESC LIMIT ? OFFSET ?";
    params.push(Number(limite), offset);
 
    const [productos] = await db.query(q, params);
    const [[{ total }]] = await db.query(countQ, countParams);
    res.json({ productos, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// ── GET /destacados/lista — DEBE IR ANTES DE /:slug ───────────
router.get("/destacados/lista", async (req, res) => {
  try {
    const [productos] = await db.query(`
      SELECT p.id, p.nombre, p.slug, p.descripcion_corta,
             p.precio, p.precio_antes, p.imagen_url, p.marca, p.stock,
             c.nombre AS categoria, c.slug AS categoria_slug
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND p.destacado = 1
      ORDER BY p.id DESC LIMIT 12`
    );
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// ── GET /:slug — detalle completo con variantes ───────────────
router.get("/:slug", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.nombre AS categoria, c.slug AS categoria_slug,
             pr.nombre AS proveedor_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.slug = ? AND p.activo = 1`, [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: "Producto no encontrado." });
 
    const producto = rows[0];
    try {
      producto.imagenes_extra = producto.imagenes_extra
        ? JSON.parse(producto.imagenes_extra) : [];
    } catch { producto.imagenes_extra = []; }
 
    const [variantes] = await db.query(`
      SELECT id, nombre, precio, precio_antes, precio_costo,
             stock, stock_minimo, sku, orden
      FROM producto_variantes
      WHERE producto_id = ? AND activo = 1
      ORDER BY orden ASC, id ASC`, [producto.id]
    );
 
    const [relacionados] = await db.query(`
      SELECT p.id, p.nombre, p.slug, p.precio, p.precio_antes,
             p.imagen_url, p.marca, p.descripcion_corta
      FROM productos p
      WHERE p.categoria_id = ? AND p.activo = 1 AND p.id != ?
      ORDER BY p.destacado DESC LIMIT 4`, [producto.categoria_id, producto.id]
    );
 
    res.json({ producto, variantes, relacionados });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// ── POST / — crear producto (solo admin) ──────────────────────
router.post("/", verificarToken, soloAdmin, async (req, res) => {
  const {
    nombre, slug, descripcion, descripcion_corta, categoria_id, proveedor_id,
    precio, precio_antes, precio_costo, stock, stock_minimo,
    imagen_url, imagenes_extra, marca, unidad, especie,
    requiere_formula, activo, destacado, variantes,
  } = req.body;
 
  if (!nombre || !categoria_id || precio == null)
    return res.status(400).json({ error: "nombre, categoria_id y precio son requeridos." });
 
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
 
    const slugFinal = slug || nombre.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
 
    const [result] = await conn.query(`
      INSERT INTO productos
        (nombre, slug, descripcion, descripcion_corta, categoria_id, proveedor_id,
         precio, precio_antes, precio_costo, stock, stock_minimo,
         imagen_url, imagenes_extra, marca, unidad, especie,
         requiere_formula, activo, destacado)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [nombre, slugFinal, descripcion||null, descripcion_corta||null,
       categoria_id, proveedor_id||null,
       Number(precio), precio_antes||null, precio_costo||0,
       Number(stock||0), Number(stock_minimo||5),
       imagen_url||null,
       imagenes_extra ? JSON.stringify(imagenes_extra) : null,
       marca||null, unidad||null, especie||null,
       requiere_formula?1:0, activo!==false?1:0, destacado?1:0]
    );
    const producto_id = result.insertId;
 
    if (Array.isArray(variantes) && variantes.length > 0) {
      for (const [i, v] of variantes.entries()) {
        if (!v.nombre || v.precio == null) continue;
        await conn.query(`
          INSERT INTO producto_variantes
            (producto_id, nombre, precio, precio_antes, precio_costo,
             stock, stock_minimo, sku, orden)
          VALUES (?,?,?,?,?,?,?,?,?)`,
          [producto_id, v.nombre, Number(v.precio), v.precio_antes||null,
           Number(v.precio_costo||0), Number(v.stock||0), Number(v.stock_minimo||5),
           v.sku||null, v.orden??i]
        );
      }
    }
 
    await conn.commit();
    res.status(201).json({ mensaje: "Producto creado.", producto_id, slug: slugFinal });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Ya existe un producto con ese slug." });
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});
 
// ── PUT /:id — editar producto (solo admin) ───────────────────
router.put("/:id", verificarToken, soloAdmin, async (req, res) => {
  const {
    nombre, slug, descripcion, descripcion_corta, categoria_id, proveedor_id,
    precio, precio_antes, precio_costo, stock, stock_minimo,
    imagen_url, imagenes_extra, marca, unidad, especie,
    requiere_formula, activo, destacado, variantes,
  } = req.body;
 
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
 
    const sets = [], vals = [];
    const campos = {
      nombre, slug, descripcion, descripcion_corta, categoria_id, proveedor_id,
      precio, precio_antes, precio_costo, stock, stock_minimo,
      imagen_url, marca, unidad, especie, requiere_formula, activo, destacado,
    };
    for (const [k, v] of Object.entries(campos)) {
      if (v !== undefined) { sets.push(`${k}=?`); vals.push(v); }
    }
    if (imagenes_extra !== undefined) {
      sets.push("imagenes_extra=?");
      vals.push(JSON.stringify(imagenes_extra));
    }
    if (sets.length > 0) {
      vals.push(req.params.id);
      await conn.query(`UPDATE productos SET ${sets.join(",")} WHERE id=?`, vals);
    }
 
    if (Array.isArray(variantes)) {
      await conn.query("DELETE FROM producto_variantes WHERE producto_id=?", [req.params.id]);
      for (const [i, v] of variantes.entries()) {
        if (!v.nombre || v.precio == null) continue;
        await conn.query(`
          INSERT INTO producto_variantes
            (producto_id, nombre, precio, precio_antes, precio_costo,
             stock, stock_minimo, sku, orden)
          VALUES (?,?,?,?,?,?,?,?,?)`,
          [req.params.id, v.nombre, Number(v.precio), v.precio_antes||null,
           Number(v.precio_costo||0), Number(v.stock||0), Number(v.stock_minimo||5),
           v.sku||null, v.orden??i]
        );
      }
    }
 
    await conn.commit();
    res.json({ mensaje: "Producto actualizado." });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});
 
// ── DELETE /:id — soft delete (solo admin) ────────────────────
router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    await db.query("UPDATE productos SET activo=0 WHERE id=?", [req.params.id]);
    res.json({ mensaje: "Producto desactivado." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
export default router;
 