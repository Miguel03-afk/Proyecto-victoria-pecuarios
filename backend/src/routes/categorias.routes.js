import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /api/categorias — todas las categorías activas con su padre
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.nombre, c.slug, c.descripcion, c.icono_url, c.parent_id, c.orden,
              p.nombre AS padre
       FROM categorias c
       LEFT JOIN categorias p ON c.parent_id = p.id
       WHERE c.activa = 1
       ORDER BY c.orden ASC, c.nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener categorías." });
  }
});

export default router;