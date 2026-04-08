// backend/src/routes/veterinario.routes.js
// Rutas para el ROL VETERINARIO — agenda, gestión de citas, anomalías
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, soloRol } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren login + rol veterinario
router.use(verificarToken, soloRol("veterinario", "admin", "superadmin"));

/* ─── helper: obtener veterinario_id del usuario autenticado ── */
async function getVetId(usuarioId) {
  const [[vet]] = await pool.query(
    "SELECT id FROM veterinarios WHERE usuario_id = ?", [usuarioId]
  );
  return vet?.id || null;
}

/* ─── GET /api/veterinario/agenda ────────────────────────── */
// Citas del veterinario ordenadas por fecha/hora
// ?estado=pendiente&fecha=2026-04-15
router.get("/agenda", async (req, res) => {
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil de veterinario no encontrado." });

  const { estado, fecha } = req.query;
  try {
    let where = "c.veterinario_id = ?";
    const params = [vetId];

    if (estado && estado !== "todas") {
      where += " AND c.estado = ?";
      params.push(estado);
    }
    if (fecha) {
      where += " AND c.fecha = ?";
      params.push(fecha);
    }

    const [citas] = await pool.query(`
      SELECT c.id, c.codigo, c.fecha, c.hora, c.motivo,
             c.nombre_mascota, c.especie_mascota, c.estado,
             c.motivo_cancelacion, c.notas_vet, c.created_at,
             u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             u.email AS cliente_email, u.telefono AS cliente_tel,
             (SELECT COUNT(*) FROM citas_anomalias a WHERE a.cita_id = c.id) AS anomalias
      FROM citas c
      JOIN usuarios u ON u.id = c.cliente_id
      WHERE ${where}
      ORDER BY c.fecha ASC, c.hora ASC
    `, params);

    res.json(citas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener agenda." });
  }
});

/* ─── GET /api/veterinario/solicitudes ──────────────────── */
// Solo citas pendientes (inbox del veterinario)
router.get("/solicitudes", async (req, res) => {
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });

  try {
    const [citas] = await pool.query(`
      SELECT c.id, c.codigo, c.fecha, c.hora, c.motivo,
             c.nombre_mascota, c.especie_mascota, c.created_at,
             u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             u.email AS cliente_email, u.telefono AS cliente_tel
      FROM citas c
      JOIN usuarios u ON u.id = c.cliente_id
      WHERE c.veterinario_id = ? AND c.estado = 'pendiente'
      ORDER BY c.created_at ASC
    `, [vetId]);

    res.json(citas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener solicitudes." });
  }
});

/* ─── PATCH /api/veterinario/citas/:id/confirmar ─────────── */
router.patch("/citas/:id/confirmar", async (req, res) => {
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });

  try {
    const [[cita]] = await pool.query(
      "SELECT id, estado, veterinario_id FROM citas WHERE id = ?",
      [req.params.id]
    );
    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (cita.veterinario_id !== vetId)
      return res.status(403).json({ error: "No tienes permiso." });
    if (cita.estado !== "pendiente")
      return res.status(400).json({ error: "Solo puedes confirmar citas pendientes." });

    await pool.query(
      "UPDATE citas SET estado='confirmada' WHERE id=?", [req.params.id]
    );
    res.json({ mensaje: "Cita confirmada." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al confirmar." });
  }
});

/* ─── PATCH /api/veterinario/citas/:id/rechazar ──────────── */
router.patch("/citas/:id/rechazar", async (req, res) => {
  const { motivo_cancelacion } = req.body;
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });
  if (!motivo_cancelacion?.trim())
    return res.status(400).json({ error: "Debes indicar el motivo." });

  try {
    const [[cita]] = await pool.query(
      "SELECT id, estado, veterinario_id FROM citas WHERE id=?", [req.params.id]
    );
    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (cita.veterinario_id !== vetId)
      return res.status(403).json({ error: "No tienes permiso." });
    if (!["pendiente","confirmada"].includes(cita.estado))
      return res.status(400).json({ error: "No puedes rechazar esta cita." });

    await pool.query(
      "UPDATE citas SET estado='rechazada', motivo_cancelacion=? WHERE id=?",
      [motivo_cancelacion.trim(), req.params.id]
    );
    res.json({ mensaje: "Cita rechazada." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al rechazar." });
  }
});

/* ─── PATCH /api/veterinario/citas/:id/completar ─────────── */
router.patch("/citas/:id/completar", async (req, res) => {
  const { notas_vet } = req.body;
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });

  try {
    const [[cita]] = await pool.query(
      "SELECT id, estado, veterinario_id FROM citas WHERE id=?", [req.params.id]
    );
    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (cita.veterinario_id !== vetId)
      return res.status(403).json({ error: "No tienes permiso." });
    if (cita.estado !== "confirmada")
      return res.status(400).json({ error: "La cita debe estar confirmada para completarla." });

    await pool.query(
      "UPDATE citas SET estado='completada', notas_vet=? WHERE id=?",
      [notas_vet?.trim() || null, req.params.id]
    );
    res.json({ mensaje: "Cita marcada como completada." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al completar." });
  }
});

/* ─── PATCH /api/veterinario/citas/:id/no-asistio ─────────── */
router.patch("/citas/:id/no-asistio", async (req, res) => {
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });

  try {
    const [[cita]] = await pool.query(
      "SELECT id, estado, veterinario_id FROM citas WHERE id=?", [req.params.id]
    );
    if (!cita || cita.veterinario_id !== vetId)
      return res.status(404).json({ error: "Cita no encontrada." });

    await pool.query(
      "UPDATE citas SET estado='no_asistio' WHERE id=?", [req.params.id]
    );
    res.json({ mensaje: "Marcada como no asistió." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error." });
  }
});

/* ─── POST /api/veterinario/citas/:id/anomalia ───────────── */
// Reportar anomalía con imagen/video URL
router.post("/citas/:id/anomalia", async (req, res) => {
  const { descripcion, imagen_url, video_url } = req.body;
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });
  if (!descripcion?.trim())
    return res.status(400).json({ error: "La descripción es obligatoria." });

  try {
    const [[cita]] = await pool.query(
      "SELECT id, veterinario_id FROM citas WHERE id=?", [req.params.id]
    );
    if (!cita || cita.veterinario_id !== vetId)
      return res.status(404).json({ error: "Cita no encontrada." });

    await pool.query(`
      INSERT INTO citas_anomalias (cita_id, veterinario_id, descripcion, imagen_url, video_url)
      VALUES (?, ?, ?, ?, ?)
    `, [req.params.id, vetId, descripcion.trim(), imagen_url || null, video_url || null]);

    res.status(201).json({ mensaje: "Anomalía reportada." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al reportar anomalía." });
  }
});

/* ─── GET /api/veterinario/anomalias ─────────────────────── */
// Historial de anomalías reportadas por este vet
router.get("/anomalias", async (req, res) => {
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });

  try {
    const [anomalias] = await pool.query(`
      SELECT a.id, a.descripcion, a.imagen_url, a.video_url, a.created_at,
             c.codigo, c.fecha, c.hora, c.nombre_mascota,
             u.nombre AS cliente_nombre, u.apellido AS cliente_apellido
      FROM citas_anomalias a
      JOIN citas   c ON c.id = a.cita_id
      JOIN usuarios u ON u.id = c.cliente_id
      WHERE a.veterinario_id = ?
      ORDER BY a.created_at DESC
    `, [vetId]);

    res.json(anomalias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener anomalías." });
  }
});

/* ─── GET /api/veterinario/disponibilidad ────────────────── */
router.get("/disponibilidad", async (req, res) => {
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });

  try {
    const [disp] = await pool.query(
      "SELECT * FROM veterinario_disponibilidad WHERE veterinario_id=? ORDER BY dia_semana",
      [vetId]
    );
    res.json(disp);
  } catch (err) {
    res.status(500).json({ error: "Error." });
  }
});

/* ─── PUT /api/veterinario/disponibilidad ────────────────── */
// Reemplaza toda la disponibilidad del vet
router.put("/disponibilidad", async (req, res) => {
  const { disponibilidad } = req.body; // [{dia_semana, hora_inicio, hora_fin, activo}]
  const vetId = await getVetId(req.usuario.id);
  if (!vetId) return res.status(404).json({ error: "Perfil no encontrado." });
  if (!Array.isArray(disponibilidad))
    return res.status(400).json({ error: "Formato inválido." });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM veterinario_disponibilidad WHERE veterinario_id=?", [vetId]);

    for (const d of disponibilidad) {
      if (d.activo) {
        await conn.query(`
          INSERT INTO veterinario_disponibilidad (veterinario_id, dia_semana, hora_inicio, hora_fin)
          VALUES (?, ?, ?, ?)
        `, [vetId, d.dia_semana, d.hora_inicio, d.hora_fin]);
      }
    }
    await conn.commit();
    res.json({ mensaje: "Disponibilidad actualizada." });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Error al actualizar disponibilidad." });
  } finally {
    conn.release();
  }
});

export default router;