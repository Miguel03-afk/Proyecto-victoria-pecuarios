import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── REGISTRO ────────────────────────────────────────────────────────────────
// POST /api/auth/registro
// Solo nombre, apellido, email, password — fricción mínima
router.post("/registro", async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: "Nombre, apellido, correo y contraseña son obligatorios." });
  }
  if (!RE_EMAIL.test(email)) {
    return res.status(400).json({ error: "El correo ingresado no es válido." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: "La contraseña debe incluir al menos 1 número." });
  }

  try {
    const [existe] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(409).json({
        error: "Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
       VALUES (?, ?, ?, ?, 'cliente')`,
      [nombre, apellido, email, hash]
    );

    const token = jwt.sign(
      { id: result.insertId, nombre, apellido, email, rol: "cliente" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      mensaje: "Cuenta creada exitosamente.",
      token,
      usuario: { id: result.insertId, nombre, apellido, email, rol: "cliente" },
    });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, apellido, email, password_hash, rol, activo FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: "Tu cuenta está desactivada. Contacta al administrador." });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      mensaje: "Sesión iniciada correctamente.",
      token,
      usuario: {
        id:       usuario.id,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
        email:    usuario.email,
        rol:      usuario.rol,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ─── PERFIL PROPIO ────────────────────────────────────────────────────────────
// GET /api/auth/me
router.get("/me", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, apellido, email, telefono, rol, activo,
              avatar_url, facturacion, created_at
       FROM usuarios WHERE id = ?`,
      [req.usuario.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });

    const user = rows[0];
    // Parsear facturacion si viene como string
    if (user.facturacion && typeof user.facturacion === "string") {
      try { user.facturacion = JSON.parse(user.facturacion); } catch { user.facturacion = null; }
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EDITAR PERFIL ────────────────────────────────────────────────────────────
// PUT /api/auth/perfil
// Acepta: nombre, apellido, telefono, facturacion (JSON)
// NO acepta: email, password (tienen sus propios endpoints)
router.put("/perfil", verificarToken, async (req, res) => {
  const { nombre, apellido, telefono, facturacion } = req.body;

  const updates = [];
  const values  = [];

  if (nombre     !== undefined) { updates.push("nombre      = ?"); values.push(nombre     || null); }
  if (apellido   !== undefined) { updates.push("apellido    = ?"); values.push(apellido   || null); }
  if (telefono   !== undefined) { updates.push("telefono    = ?"); values.push(telefono   || null); }
  if (facturacion !== undefined) {
    updates.push("facturacion = ?");
    values.push(facturacion ? JSON.stringify(facturacion) : null);
  }

  if (!updates.length) return res.json({ mensaje: "Sin cambios." });

  values.push(req.usuario.id);
  try {
    await db.query(`UPDATE usuarios SET ${updates.join(", ")} WHERE id = ?`, values);
    res.json({ mensaje: "Perfil actualizado correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CAMBIAR EMAIL ────────────────────────────────────────────────────────────
// PUT /api/auth/cambiar-email
router.put("/cambiar-email", verificarToken, async (req, res) => {
  const { nuevo_email, password_actual } = req.body;

  if (!nuevo_email || !password_actual) {
    return res.status(400).json({ error: "El nuevo correo y la contraseña actual son requeridos." });
  }
  if (!RE_EMAIL.test(nuevo_email)) {
    return res.status(400).json({ error: "El correo ingresado no es válido." });
  }

  try {
    const [rows] = await db.query(
      "SELECT password_hash FROM usuarios WHERE id = ?",
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado." });

    const valida = await bcrypt.compare(password_actual, rows[0].password_hash);
    if (!valida) return res.status(401).json({ error: "La contraseña actual es incorrecta." });

    const [existe] = await db.query(
      "SELECT id FROM usuarios WHERE email = ? AND id != ?",
      [nuevo_email, req.usuario.id]
    );
    if (existe.length > 0) {
      return res.status(409).json({ error: "Este correo ya está en uso por otra cuenta." });
    }

    await db.query("UPDATE usuarios SET email = ? WHERE id = ?", [nuevo_email, req.usuario.id]);
    res.json({ mensaje: "Correo actualizado correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CAMBIAR CONTRASEÑA ───────────────────────────────────────────────────────
// PATCH /api/auth/cambiar-password
router.patch("/cambiar-password", verificarToken, async (req, res) => {
  const { password_actual, nueva_password } = req.body;

  if (!password_actual || !nueva_password) {
    return res.status(400).json({ error: "Se requieren ambas contraseñas." });
  }
  if (nueva_password.length < 8) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres." });
  }
  if (!/[0-9]/.test(nueva_password)) {
    return res.status(400).json({ error: "La contraseña debe incluir al menos 1 número." });
  }

  try {
    const [rows] = await db.query(
      "SELECT password_hash FROM usuarios WHERE id = ?",
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado." });

    const valida = await bcrypt.compare(password_actual, rows[0].password_hash);
    if (!valida) return res.status(401).json({ error: "La contraseña actual es incorrecta." });

    const hash = await bcrypt.hash(nueva_password, 10);
    await db.query("UPDATE usuarios SET password_hash = ? WHERE id = ?", [hash, req.usuario.id]);

    res.json({ mensaje: "Contraseña actualizada correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MIS ÓRDENES ─────────────────────────────────────────────────────────────
// GET /api/auth/mis-ordenes
router.get("/mis-ordenes", verificarToken, async (req, res) => {
  try {
    const [ordenes] = await db.query(
      `SELECT o.id, o.codigo, o.total, o.subtotal, o.iva_total, o.estado,
              o.metodo_pago, o.direccion_entrega, o.ciudad_entrega, o.created_at,
              COUNT(d.id) AS items
       FROM ordenes o
       LEFT JOIN detalle_orden d ON d.orden_id = o.id
       WHERE o.usuario_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.usuario.id]
    );
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
