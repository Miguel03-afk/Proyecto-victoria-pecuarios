// backend/src/routes/public.routes.js
// Endpoints públicos (sin auth) consumidos por:
//  - El agente Coco vía n8n (tool buscar_productos)
//  - El buscador con autocompletado del Navbar / Tienda
//
// Quedan bajo el rate limiter global. Si el tráfico crece, se puede agregar
// un limiter dedicado más estricto.

import { Router } from "express";
import pool from "../db.js";

const router = Router();

/* ─── GET /api/public/buscar?q=&limit= ───────────────────────────────────────
   Búsqueda fuzzy (LIKE) por nombre o marca. Solo productos visibles al público:
   activo = 1. Todos los productos visibles son vendibles al público.
   Devuelve campos mínimos para el agente y el autocomplete del navbar. */
router.get("/buscar", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20);

  if (q.length < 2) {
    return res.json({ resultados: [], query: q });
  }

  try {
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT
         p.id, p.nombre, p.slug, p.precio, p.marca,
         p.stock,
         (CASE WHEN p.stock <= 0 THEN 1 ELSE 0 END) AS agotado,
         c.nombre AS categoria,
         (SELECT JSON_UNQUOTE(JSON_EXTRACT(p.imagenes_extra, '$[0]'))) AS imagen_url
       FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       WHERE p.activo = 1
         AND 1=1
         AND (p.nombre LIKE ? OR p.marca LIKE ?)
       ORDER BY
         (p.nombre LIKE ?) DESC,   -- los que empiezan por el query van primero
         p.destacado DESC,
         p.stock > 0 DESC,
         p.nombre ASC
       LIMIT ?`,
      [like, like, `${q}%`, limit]
    );

    res.json({
      query: q,
      total: rows.length,
      resultados: rows.map(r => ({
        ...r,
        agotado: r.agotado === 1,
      })),
    });
  } catch (err) {
    console.error("[public/buscar]", err);
    res.status(500).json({ error: "Error al buscar productos." });
  }
});


/* ─── GET /api/public/sugerir?q= ─────────────────────────────────────────────
   Solo los nombres (no precios/stock) para el autocompletado del buscador.
   Endpoint más ligero que /buscar — devuelve solo strings únicos. */
router.get("/sugerir", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return res.json({ sugerencias: [] });

  try {
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT DISTINCT p.nombre
       FROM productos p
       WHERE p.activo = 1
         AND 1=1
         AND (p.nombre LIKE ? OR p.marca LIKE ?)
       ORDER BY (p.nombre LIKE ?) DESC, p.nombre ASC
       LIMIT 8`,
      [like, like, `${q}%`]
    );
    res.json({ sugerencias: rows.map(r => r.nombre) });
  } catch (err) {
    console.error("[public/sugerir]", err);
    res.status(500).json({ error: "Error al obtener sugerencias." });
  }
});

export default router;
