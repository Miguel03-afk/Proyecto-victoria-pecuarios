import { Router } from "express";
import db from "../db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── PÚBLICAS (sin token) ─────────────────────────────────────

// GET /api/productos  — lista todos los productos activos
router.get("/", async (req, res) => {
  try {
    const { categoria, buscar, pagina = 1, limite = 12 } = req.query;
    const offset = (pagina - 1) * limite;

    let query = `
      SELECT p.id, p.nombre, p.slug, p.descripcion_corta, p.precio, p.precio_antes,
             p.stock, p.imagen_url, p.marca, p.especie, p.destacado,
             c.nombre AS categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
    `;
    const params = [];

    if (categoria) {
      query += " AND c.slug = ?";
      params.push(categoria);
    }

    if (buscar) {
      query += " AND (p.nombre LIKE ? OR p.descripcion_corta LIKE ? OR p.marca LIKE ?)";
      const term = `%${buscar}%`;
      params.push(term, term, term);
    }

    query += " ORDER BY p.destacado DESC, p.id DESC LIMIT ? OFFSET ?";
    params.push(Number(limite), Number(offset));

    const [productos] = await db.query(query, params);

    // Total para paginación
    const [total] = await db.query(
      "SELECT COUNT(*) AS total FROM productos WHERE activo = 1",
      []
    );

    res.json({
      productos,
      total: total[0].total,
      pagina: Number(pagina),
      limite: Number(limite),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener productos." });
  }
});

// GET /api/productos/:slug  — detalle de un producto por slug
router.get("/:slug", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre AS categoria, c.slug AS categoria_slug
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.slug = ? AND p.activo = 1`,
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el producto." });
  }
});

// GET /api/productos/destacados/lista — para la home
router.get("/destacados/lista", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.nombre, p.slug, p.descripcion_corta, p.precio, p.precio_antes,
              p.imagen_url, p.marca, c.nombre AS categoria
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.activo = 1 AND p.destacado = 1
       ORDER BY p.id DESC LIMIT 8`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener destacados." });
  }
});

// ─── PROTEGIDAS (solo admin/superadmin) ──────────────────────

// POST /api/productos  — crear producto
router.post("/", verificarToken, soloAdmin, async (req, res) => {
  const {
    categoria_id, proveedor_id, nombre, slug, descripcion, descripcion_corta,
    precio, precio_antes, stock, stock_minimo, imagen_url, marca, unidad,
    especie, destacado, requiere_formula,
  } = req.body;

  if (!nombre || !precio || !categoria_id) {
    return res.status(400).json({ error: "Nombre, precio y categoría son obligatorios." });
  }

  try {
    const slugFinal = slug || nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const [result] = await db.query(
      `INSERT INTO productos
        (categoria_id, proveedor_id, nombre, slug, descripcion, descripcion_corta,
         precio, precio_antes, stock, stock_minimo, imagen_url, marca, unidad,
         especie, destacado, requiere_formula)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        categoria_id, proveedor_id || null, nombre, slugFinal,
        descripcion || null, descripcion_corta || null,
        precio, precio_antes || null, stock || 0, stock_minimo || 5,
        imagen_url || null, marca || null, unidad || null,
        especie || null, destacado ? 1 : 0, requiere_formula ? 1 : 0,
      ]
    );
    res.status(201).json({ mensaje: "Producto creado.", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el producto." });
  }
});

// PUT /api/productos/:id  — editar producto
router.put("/:id", verificarToken, soloAdmin, async (req, res) => {
  const campos = req.body;
  const permitidos = [
    "nombre","slug","descripcion","descripcion_corta","precio","precio_antes",
    "stock","stock_minimo","imagen_url","marca","unidad","especie",
    "destacado","activo","categoria_id","requiere_formula",
  ];

  const updates = Object.keys(campos)
    .filter((k) => permitidos.includes(k))
    .map((k) => `${k} = ?`);
  const values = Object.keys(campos)
    .filter((k) => permitidos.includes(k))
    .map((k) => campos[k]);

  if (updates.length === 0) return res.status(400).json({ error: "No hay campos válidos para actualizar." });

  try {
    await db.query(`UPDATE productos SET ${updates.join(", ")} WHERE id = ?`, [...values, req.params.id]);
    res.json({ mensaje: "Producto actualizado." });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el producto." });
  }
});

// DELETE /api/productos/:id  — desactivar (soft delete)
router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    await db.query("UPDATE productos SET activo = 0 WHERE id = ?", [req.params.id]);
    res.json({ mensaje: "Producto desactivado." });
  } catch (err) {
    res.status(500).json({ error: "Error al desactivar el producto." });
  }
});

export default router;