// backend/src/routes/citas.routes.js
// Rutas para CLIENTES — agendar, consultar, cancelar citas
import { Router } from "express";
import pool from "../db.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { enviarNotificacionVetReagendamiento } from "../services/email.js";

const router = Router();

// Todas las rutas requieren login
router.use(verificarToken);

/* ─── helpers ──────────────────────────────────────────────── */
function codigoCita() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `CIT-${ts}-${rnd}`;
}

function slotsDia(horaInicio, horaFin, duracionMin) {
  const slots = [];
  let [h, m] = horaInicio.split(":").map(Number);
  const [hFin, mFin] = horaFin.split(":").map(Number);
  const finMin = hFin * 60 + mFin;

  while (h * 60 + m + duracionMin <= finMin) {
    slots.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    m += duracionMin;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}

/* ─── GET /api/citas/veterinarios ─────────────────────────── */
// Lista veterinarios activos con su disponibilidad
router.get("/veterinarios", async (req, res) => {
  try {
    const [vets] = await pool.query(`
      SELECT v.id, v.especialidad, v.descripcion, v.foto_url,
             v.duracion_cita, u.nombre, u.apellido, u.avatar_url
      FROM veterinarios v
      JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.activo = 1 AND u.activo = 1
      ORDER BY u.nombre
    `);

    const [disp] = await pool.query(`
      SELECT veterinario_id, dia_semana, hora_inicio, hora_fin
      FROM veterinario_disponibilidad
      WHERE activo = 1
    `);

    // Agrupar por vet: { dia, bloques: [{hora_inicio, hora_fin}] }
    const vetsConDisp = vets.map(v => {
      const vetRows = disp.filter(d => d.veterinario_id === v.id);
      const diasMap  = {};
      for (const row of vetRows) {
        const d = row.dia_semana;
        if (!diasMap[d]) diasMap[d] = { dia: d, bloques: [] };
        diasMap[d].bloques.push({
          hora_inicio: row.hora_inicio.slice(0, 5),
          hora_fin:    row.hora_fin.slice(0, 5),
        });
      }
      return { ...v, disponibilidad: Object.values(diasMap).sort((a,b) => a.dia - b.dia) };
    });

    res.json(vetsConDisp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener veterinarios." });
  }
});

/* ─── GET /api/citas/disponibilidad ──────────────────────── */
// ?veterinario_id=1&fecha=2026-04-15  → devuelve slots libres
router.get("/disponibilidad", async (req, res) => {
  const { veterinario_id, fecha } = req.query;
  if (!veterinario_id || !fecha)
    return res.status(400).json({ error: "Faltan parámetros." });

  try {
    const fechaObj   = new Date(fecha + "T00:00:00");
    const diaSemana  = fechaObj.getDay(); // 0=Dom … 6=Sáb

    // Todos los bloques del día (pueden ser varios)
    const [bloques] = await pool.query(`
      SELECT vd.hora_inicio, vd.hora_fin, v.duracion_cita,
             (SELECT GROUP_CONCAT(DISTINCT dia_semana ORDER BY dia_semana)
              FROM veterinario_disponibilidad
              WHERE veterinario_id = ? AND activo = 1) AS dias_activos
      FROM veterinario_disponibilidad vd
      JOIN veterinarios v ON v.id = vd.veterinario_id
      WHERE vd.veterinario_id = ? AND vd.dia_semana = ? AND vd.activo = 1
      ORDER BY vd.hora_inicio
    `, [veterinario_id, veterinario_id, diaSemana]);

    if (!bloques.length) {
      // Construir lista de días disponibles para el mensaje
      const [[{ dias_raw }]] = await pool.query(
        `SELECT GROUP_CONCAT(DISTINCT dia_semana ORDER BY dia_semana) AS dias_raw
         FROM veterinario_disponibilidad WHERE veterinario_id = ? AND activo = 1`,
        [veterinario_id]
      );
      const NOMBRE_DIA = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
      const diasLabel = dias_raw
        ? dias_raw.split(",").map(n => NOMBRE_DIA[parseInt(n)]).join(", ")
        : "sin días configurados";
      return res.json({
        slots: [],
        mensaje: `El veterinario no atiende ese día. Días disponibles: ${diasLabel}`,
      });
    }

    // Citas ya ocupadas ese día
    const [ocupadas] = await pool.query(`
      SELECT hora FROM citas
      WHERE veterinario_id = ? AND fecha = ?
        AND estado NOT IN ('rechazada','cancelada_cliente','cancelada_vet')
    `, [veterinario_id, fecha]);

    const horasOcupadas = new Set(ocupadas.map(c => c.hora.slice(0, 5)));
    const duracion = bloques[0].duracion_cita;

    // Generar slots de todos los bloques y unirlos
    let todos = [];
    for (const b of bloques) {
      todos = todos.concat(slotsDia(b.hora_inicio.slice(0,5), b.hora_fin.slice(0,5), duracion));
    }
    // Deduplicar y ordenar
    todos = [...new Set(todos)].sort();
    const libres = todos.filter(s => !horasOcupadas.has(s));

    res.json({ slots: libres, duracion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar disponibilidad." });
  }
});

/* ─── POST /api/citas ─────────────────────────────────────── */
// Cliente agenda una cita
router.post("/", async (req, res) => {
  const { veterinario_id, fecha, hora, motivo, nombre_mascota, especie_mascota } = req.body;
  const cliente_id = req.usuario.id;

  if (!veterinario_id || !fecha || !hora || !motivo || !nombre_mascota)
    return res.status(400).json({ error: "Completa todos los campos obligatorios." });

  try {
    // Verificar que el slot esté libre
    const [[ocupado]] = await pool.query(`
      SELECT id FROM citas
      WHERE veterinario_id = ? AND fecha = ? AND hora = ?
        AND estado NOT IN ('rechazada','cancelada_cliente','cancelada_vet')
    `, [veterinario_id, fecha, hora]);

    if (ocupado) return res.status(409).json({ error: "Ese horario ya fue reservado. Elige otro." });

    // Verificar que el cliente no tenga otra cita a la misma hora
    const [[conflicto]] = await pool.query(`
      SELECT id FROM citas
      WHERE cliente_id = ? AND fecha = ? AND hora = ?
        AND estado NOT IN ('rechazada','cancelada_cliente','cancelada_vet')
    `, [cliente_id, fecha, hora]);

    if (conflicto) return res.status(409).json({ error: "Ya tienes una cita a esa hora." });

    const codigo = codigoCita();
    const [result] = await pool.query(`
      INSERT INTO citas (codigo, cliente_id, veterinario_id, fecha, hora, motivo, nombre_mascota, especie_mascota)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [codigo, cliente_id, veterinario_id, fecha, hora, motivo, nombre_mascota, especie_mascota || "Perro"]);

    res.status(201).json({ mensaje: "Cita agendada exitosamente.", codigo, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al agendar la cita." });
  }
});

/* ─── GET /api/citas/mis-citas ────────────────────────────── */
// Historial del cliente autenticado
router.get("/mis-citas", async (req, res) => {
  const cliente_id = req.usuario.id;
  try {
    const [citas] = await pool.query(`
      SELECT c.id, c.codigo, DATE_FORMAT(c.fecha,'%Y-%m-%d') AS fecha, c.hora, c.motivo,
             c.nombre_mascota, c.especie_mascota, c.estado,
             c.motivo_cancelacion, c.notas_vet, c.created_at,
             c.reagendamiento_motivo, c.reagendamiento_estado,
             DATE_FORMAT(c.reagendamiento_nueva_fecha,'%Y-%m-%d') AS reagendamiento_nueva_fecha,
             c.reagendamiento_nueva_hora,
             u.nombre AS vet_nombre, u.apellido AS vet_apellido,
             v.especialidad, v.foto_url AS vet_foto
      FROM citas c
      JOIN veterinarios v ON v.id = c.veterinario_id
      JOIN usuarios u     ON u.id = v.usuario_id
      WHERE c.cliente_id = ?
      ORDER BY c.fecha DESC, c.hora DESC
    `, [cliente_id]);

    res.json(citas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener citas." });
  }
});

/* ─── PATCH /api/citas/:id/aceptar-reagendamiento ─────────── */
// Cliente acepta la propuesta de nueva fecha/hora
router.patch("/:id/aceptar-reagendamiento", async (req, res) => {
  const cliente_id = req.usuario.id;
  try {
    const [[cita]] = await pool.query(
      `SELECT c.id, c.codigo, c.cliente_id, c.nombre_mascota,
              c.reagendamiento_estado, c.reagendamiento_nueva_fecha, c.reagendamiento_nueva_hora,
              u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
              uv.email AS vet_email, uv.nombre AS vet_nombre
       FROM citas c
       JOIN veterinarios v ON v.id = c.veterinario_id
       JOIN usuarios uv    ON uv.id = v.usuario_id
       JOIN usuarios u     ON u.id = c.cliente_id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (cita.cliente_id !== cliente_id)
      return res.status(403).json({ error: "Sin acceso." });
    if (cita.reagendamiento_estado !== "propuesta")
      return res.status(400).json({ error: "No hay propuesta pendiente." });
    if (!cita.reagendamiento_nueva_fecha || !cita.reagendamiento_nueva_hora)
      return res.status(400).json({ error: "La propuesta no incluye nueva fecha." });

    await pool.query(
      `UPDATE citas SET
         fecha = reagendamiento_nueva_fecha,
         hora  = reagendamiento_nueva_hora,
         reagendamiento_estado = 'aceptada',
         estado = 'confirmada'
       WHERE id = ?`,
      [req.params.id]
    );

    try {
      await enviarNotificacionVetReagendamiento(
        cita.vet_email,
        cita.vet_nombre,
        cita,
        cita.reagendamiento_nueva_fecha,
        cita.reagendamiento_nueva_hora
      );
    } catch (emailErr) {
      console.error("Email vet reagendamiento:", emailErr.message);
    }

    res.json({ mensaje: "Cita reagendada correctamente." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al aceptar el reagendamiento." });
  }
});

/* ─── PATCH /api/citas/:id/rechazar-reagendamiento ─────────── */
// Cliente rechaza la propuesta — la cita queda cancelada
router.patch("/:id/rechazar-reagendamiento", async (req, res) => {
  const cliente_id = req.usuario.id;
  try {
    const [[cita]] = await pool.query(
      "SELECT id, cliente_id, reagendamiento_estado FROM citas WHERE id = ?",
      [req.params.id]
    );

    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (cita.cliente_id !== cliente_id)
      return res.status(403).json({ error: "Sin acceso." });
    if (cita.reagendamiento_estado !== "propuesta")
      return res.status(400).json({ error: "No hay propuesta pendiente." });

    await pool.query(
      `UPDATE citas SET
         reagendamiento_estado = 'rechazada',
         estado = 'cancelada_cliente',
         motivo_cancelacion = 'El cliente rechazó la propuesta de reagendamiento'
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({ mensaje: "Propuesta rechazada. La cita ha sido cancelada." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al rechazar el reagendamiento." });
  }
});

/* ─── PATCH /api/citas/:id/cancelar ──────────────────────── */
// Cliente cancela su cita (solo si está pendiente o confirmada)
router.patch("/:id/cancelar", async (req, res) => {
  const { motivo_cancelacion } = req.body;
  const cliente_id = req.usuario.id;

  if (!motivo_cancelacion?.trim())
    return res.status(400).json({ error: "Debes indicar el motivo de cancelación." });

  try {
    const [[cita]] = await pool.query(
      "SELECT id, estado, cliente_id FROM citas WHERE id = ?",
      [req.params.id]
    );

    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (cita.cliente_id !== cliente_id)
      return res.status(403).json({ error: "No puedes cancelar esta cita." });
    if (!["pendiente","confirmada"].includes(cita.estado))
      return res.status(400).json({ error: "Esta cita no puede cancelarse." });

    await pool.query(
      "UPDATE citas SET estado='cancelada_cliente', motivo_cancelacion=? WHERE id=?",
      [motivo_cancelacion.trim(), req.params.id]
    );

    res.json({ mensaje: "Cita cancelada correctamente." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cancelar la cita." });
  }
});

export default router;