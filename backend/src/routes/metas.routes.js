import { Router } from "express";
import db from "../db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verificarToken, soloAdmin);

const mesActual = () => new Date().toISOString().slice(0, 7);

// GET /api/metas?mes=2026-03  — obtiene meta + progreso real
router.get("/", async (req, res) => {
  try {
    const mes = req.query.mes || mesActual();

    // Meta guardada
    const [rows] = await db.query("SELECT * FROM metas WHERE mes=?", [mes]);
    const meta = rows[0] || { mes, meta_ventas:0, meta_ordenes:0, meta_clientes:0, meta_productos:0 };

    // Progreso real del mes
    const inicio = `${mes}-01`;
    const fin    = `${mes}-31`;

    const [[{ ventas_real }]]    = await db.query(
      "SELECT COALESCE(SUM(total),0) AS ventas_real FROM ordenes WHERE estado!='cancelada' AND created_at BETWEEN ? AND ?",
      [inicio, fin]
    );
    const [[{ ordenes_real }]]   = await db.query(
      "SELECT COUNT(*) AS ordenes_real FROM ordenes WHERE created_at BETWEEN ? AND ?",
      [inicio, fin]
    );
    const [[{ clientes_real }]]  = await db.query(
      "SELECT COUNT(*) AS clientes_real FROM usuarios WHERE rol='cliente' AND created_at BETWEEN ? AND ?",
      [inicio, fin]
    );
    const [[{ productos_real }]] = await db.query(
      `SELECT COALESCE(SUM(d.cantidad),0) AS productos_real
       FROM detalle_orden d
       JOIN ordenes o ON d.orden_id=o.id
       WHERE o.estado!='cancelada' AND o.created_at BETWEEN ? AND ?`,
      [inicio, fin]
    );

    // Mes anterior para comparación
    const date     = new Date(`${mes}-01`);
    date.setMonth(date.getMonth() - 1);
    const mesAnterior = date.toISOString().slice(0, 7);
    const iA = `${mesAnterior}-01`, fA = `${mesAnterior}-31`;

    const [[{ ventas_ant }]]   = await db.query(
      "SELECT COALESCE(SUM(total),0) AS ventas_ant FROM ordenes WHERE estado!='cancelada' AND created_at BETWEEN ? AND ?",
      [iA, fA]
    );
    const [[{ ordenes_ant }]]  = await db.query(
      "SELECT COUNT(*) AS ordenes_ant FROM ordenes WHERE created_at BETWEEN ? AND ?", [iA, fA]
    );
    const [[{ clientes_ant }]] = await db.query(
      "SELECT COUNT(*) AS clientes_ant FROM usuarios WHERE rol='cliente' AND created_at BETWEEN ? AND ?", [iA, fA]
    );

    res.json({
      meta,
      real: { ventas: Number(ventas_real), ordenes: Number(ordenes_real),
              clientes: Number(clientes_real), productos: Number(productos_real) },
      anterior: { ventas: Number(ventas_ant), ordenes: Number(ordenes_ant), clientes: Number(clientes_ant) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener metas." });
  }
});

// POST /api/metas — crear o actualizar meta del mes
router.post("/", async (req, res) => {
  const { mes, meta_ventas, meta_ordenes, meta_clientes, meta_productos } = req.body;
  if (!mes) return res.status(400).json({ error: "El campo mes es requerido (YYYY-MM)." });
  try {
    await db.query(
      `INSERT INTO metas (mes, meta_ventas, meta_ordenes, meta_clientes, meta_productos, created_by)
       VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         meta_ventas=VALUES(meta_ventas), meta_ordenes=VALUES(meta_ordenes),
         meta_clientes=VALUES(meta_clientes), meta_productos=VALUES(meta_productos)`,
      [mes, meta_ventas||0, meta_ordenes||0, meta_clientes||0, meta_productos||0, req.usuario.id]
    );
    res.json({ mensaje: "Meta guardada correctamente." });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar meta." });
  }
});

// GET /api/metas/historial — últimos 6 meses de metas vs real
router.get("/historial", async (req, res) => {
  try {
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      meses.push(d.toISOString().slice(0, 7));
    }
    const resultado = await Promise.all(meses.map(async (mes) => {
      const inicio = `${mes}-01`, fin = `${mes}-31`;
      const [metaRows] = await db.query("SELECT * FROM metas WHERE mes=?", [mes]);
      const [[{ ventas }]] = await db.query(
        "SELECT COALESCE(SUM(total),0) AS ventas FROM ordenes WHERE estado!='cancelada' AND created_at BETWEEN ? AND ?",
        [inicio, fin]
      );
      return {
        mes,
        meta_ventas: metaRows[0]?.meta_ventas || 0,
        ventas_real: Number(ventas),
      };
    }));
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: "Error." });
  }
});

export default router;