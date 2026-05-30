// backend/src/routes/favoritos.routes.js
// CRUD de productos favoritos del usuario autenticado.
import { Router } from "express";
import pool from "../db.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verificarToken);

/* ─── GET /api/favoritos ─────────────────────────────────────────────────────
   Lista de favoritos del usuario con snapshot del producto para renderizar
   sin un join extra desde el frontend. Marca stock 0 como "agotado" en el
   campo `agotado` para mostrar badge sin recalcular en cliente. */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         f.producto_id              AS id,
         f.created_at               AS agregado_en,
         p.nombre, p.slug, p.precio, p.marca,
         p.stock,
         (CASE WHEN p.stock <= 0 OR p.activo = 0 THEN 1 ELSE 0 END) AS agotado,
         (SELECT JSON_UNQUOTE(JSON_EXTRACT(p.imagenes_extra, '$[0]'))) AS imagen_url
       FROM favoritos f
       INNER JOIN productos p ON p.id = f.producto_id
       WHERE f.usuario_id = ?
         AND p.activo = 1
       ORDER BY f.created_at DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("[favoritos GET]", err);
    res.status(500).json({ error: "No pudimos cargar tus favoritos." });
  }
});

/* ─── POST /api/favoritos ────────────────────────────────────────────────────
   Body: { producto_id }
   Idempotente: si ya existe, devuelve 200 sin error. */
router.post("/", async (req, res) => {
  const producto_id = Number(req.body?.producto_id);
  if (!producto_id || producto_id <= 0)
    return res.status(400).json({ error: "producto_id requerido." });

  try {
    // Validar que el producto existe y está activo
    const [[prod]] = await pool.query(
      "SELECT id FROM productos WHERE id = ? AND activo = 1",
      [producto_id]
    );
    if (!prod) return res.status(404).json({ error: "Producto no encontrado." });

    await pool.query(
      `INSERT INTO favoritos (usuario_id, producto_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE created_at = created_at`,
      [req.usuario.id, producto_id]
    );
    res.json({ mensaje: "Agregado a favoritos.", producto_id });
  } catch (err) {
    console.error("[favoritos POST]", err);
    res.status(500).json({ error: "No pudimos agregar a favoritos." });
  }
});

/* ─── DELETE /api/favoritos/:producto_id ─────────────────────────────────── */
router.delete("/:producto_id", async (req, res) => {
  const producto_id = Number(req.params.producto_id);
  if (!producto_id) return res.status(400).json({ error: "producto_id inválido." });

  try {
    await pool.query(
      "DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?",
      [req.usuario.id, producto_id]
    );
    res.json({ mensaje: "Eliminado de favoritos." });
  } catch (err) {
    console.error("[favoritos DELETE]", err);
    res.status(500).json({ error: "No pudimos quitar de favoritos." });
  }
});

/* ─── DELETE /api/favoritos (vaciar) ───────────────────────────────────── */
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM favoritos WHERE usuario_id = ?", [req.usuario.id]);
    res.json({ mensaje: "Favoritos vaciados." });
  } catch (err) {
    console.error("[favoritos DELETE all]", err);
    res.status(500).json({ error: "No pudimos vaciar tus favoritos." });
  }
});

export default router;
