// backend/src/routes/admin.veterinarios.routes.js
// Rutas de ADMIN para gestionar perfiles de veterinario
// Montar en index.js como: app.use("/api/admin/veterinarios", adminVetRouter)
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, soloRol } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verificarToken, soloRol("admin", "superadmin"));

/* ─── GET /api/admin/veterinarios ──────────────────────────── */
// Lista todos los veterinarios (con o sin perfil aún)
router.get("/", async (req, res) => {
  try {
    const [vets] = await pool.query(`
      SELECT u.id AS usuario_id, u.nombre, u.apellido, u.email, u.activo AS usuario_activo,
             v.id AS vet_id, v.especialidad, v.duracion_cita,
             v.descripcion, v.activo AS vet_activo, v.created_at,
             (SELECT COUNT(*) FROM citas c WHERE c.veterinario_id = v.id) AS total_citas,
             (SELECT COUNT(*) FROM citas c WHERE c.veterinario_id = v.id AND c.estado='pendiente') AS citas_pendientes
      FROM usuarios u
      LEFT JOIN veterinarios v ON v.usuario_id = u.id
      WHERE u.rol = 'veterinario'
      ORDER BY u.nombre
    `);
    res.json(vets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener veterinarios." });
  }
});

/* ─── GET /api/admin/veterinarios/candidatos ──────────────── */
// Usuarios que se pueden convertir en veterinario (rol cliente/admin sin perfil vet)
router.get("/candidatos", async (req, res) => {
  try {
    const [candidatos] = await pool.query(`
      SELECT u.id, u.nombre, u.apellido, u.email, u.rol
      FROM usuarios u
      WHERE u.activo = 1
        AND u.id NOT IN (SELECT usuario_id FROM veterinarios)
      ORDER BY u.nombre
    `);
    res.json(candidatos);
  } catch (err) {
    res.status(500).json({ error: "Error." });
  }
});

/* ─── POST /api/admin/veterinarios ─────────────────────────── */
// Asignar rol veterinario + crear perfil
router.post("/", async (req, res) => {
  const { usuario_id, especialidad, duracion_cita, descripcion } = req.body;
  if (!usuario_id) return res.status(400).json({ error: "usuario_id requerido." });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Cambiar rol
    await conn.query(
      "UPDATE usuarios SET rol='veterinario' WHERE id=?", [usuario_id]
    );

    // Crear perfil (si ya existe actualiza)
    await conn.query(`
      INSERT INTO veterinarios (usuario_id, especialidad, duracion_cita, descripcion)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        especialidad=VALUES(especialidad),
        duracion_cita=VALUES(duracion_cita),
        descripcion=VALUES(descripcion),
        activo=1
    `, [
      usuario_id,
      especialidad || "Medicina General",
      duracion_cita || 30,
      descripcion   || null,
    ]);

    await conn.commit();
    res.status(201).json({ mensaje: "Veterinario creado correctamente." });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Error al crear veterinario." });
  } finally {
    conn.release();
  }
});

/* ─── PUT /api/admin/veterinarios/:id ──────────────────────── */
// Editar perfil de veterinario
router.put("/:id", async (req, res) => {
  const { especialidad, duracion_cita, descripcion, activo } = req.body;
  try {
    await pool.query(`
      UPDATE veterinarios SET
        especialidad  = COALESCE(?, especialidad),
        duracion_cita = COALESCE(?, duracion_cita),
        descripcion   = COALESCE(?, descripcion),
        activo        = COALESCE(?, activo)
      WHERE id = ?
    `, [especialidad, duracion_cita, descripcion, activo, req.params.id]);

    res.json({ mensaje: "Veterinario actualizado." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar." });
  }
});

/* ─── DELETE /api/admin/veterinarios/:id ───────────────────── */
// Desactivar (no elimina — soft delete)
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("UPDATE veterinarios SET activo=0 WHERE id=?", [req.params.id]);
    res.json({ mensaje: "Veterinario desactivado." });
  } catch (err) {
    res.status(500).json({ error: "Error al desactivar." });
  }
});

/* ─── GET /api/admin/veterinarios/:id/citas ────────────────── */
// Ver todas las citas de un veterinario específico
router.get("/:id/citas", async (req, res) => {
  try {
    const [citas] = await pool.query(`
      SELECT c.id, c.codigo, c.fecha, c.hora, c.estado,
             c.nombre_mascota, c.especie_mascota, c.motivo,
             u.nombre AS cliente_nombre, u.apellido AS cliente_apellido
      FROM citas c
      JOIN usuarios u ON u.id = c.cliente_id
      WHERE c.veterinario_id = ?
      ORDER BY c.fecha DESC, c.hora DESC
      LIMIT 50
    `, [req.params.id]);
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: "Error." });
  }
});

export default router;