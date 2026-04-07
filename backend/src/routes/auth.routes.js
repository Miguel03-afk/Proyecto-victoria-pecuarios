import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── REGISTRO ────────────────────────────────────────────────
// POST /api/auth/registro
router.post("/registro", async (req, res) => {
  const { nombre, apellido, email, password, telefono, tipo_documento, numero_documento, fecha_nacimiento } = req.body;

  // Validación básica
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: "Nombre, apellido, email y contraseña son obligatorios." });
  }

  try {
    // Verificar si el email ya existe
    const [existe] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email." });
    }

    // Hashear la contraseña (10 rondas de sal)
    const hash = await bcrypt.hash(password, 10);

    // Insertar usuario con rol 'cliente' por defecto e incluyendo fecha_nacimiento
    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, tipo_documento, numero_documento, rol, fecha_nacimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'cliente', ?)`,
      [
        nombre, 
        apellido, 
        email, 
        hash, 
        telefono || null, 
        tipo_documento || "CC", 
        numero_documento || null, 
        fecha_nacimiento || null
      ]
    );

    // Generar token JWT inmediatamente
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

// ─── LOGIN ───────────────────────────────────────────────────
// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios." });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, apellido, email, password_hash, rol, activo FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: "Tu cuenta está desactivada. Contacta al administrador." });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
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
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ─── PERFIL PROPIO ────────────────────────────────────────────
// GET /api/auth/me (Actualizado con fecha_nacimiento)
router.get("/me", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, apellido, email, telefono, tipo_documento,
              numero_documento, rol, activo, avatar_url, fecha_nacimiento, created_at
       FROM usuarios WHERE id = ?`, 
      [req.usuario.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EDITAR PERFIL ────────────────────────────────────────────
// PUT /api/auth/perfil
router.put("/perfil", verificarToken, async (req, res) => {
  const { nombre, apellido, telefono, tipo_documento, numero_documento, fecha_nacimiento } = req.body;
  try {
    await db.query(
      `UPDATE usuarios SET
         nombre           = COALESCE(?, nombre),
         apellido         = COALESCE(?, apellido),
         telefono         = COALESCE(?, telefono),
         tipo_documento   = COALESCE(?, tipo_documento),
         numero_documento = COALESCE(?, numero_documento),
         fecha_nacimiento = COALESCE(?, fecha_nacimiento)
       WHERE id = ?`,
      [
        nombre || null, 
        apellido || null, 
        telefono || null,
        tipo_documento || null, 
        numero_documento || null,
        fecha_nacimiento || null, 
        req.usuario.id
      ]
    );
    res.json({ mensaje: "Perfil actualizado correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CAMBIAR CONTRASEÑA ───────────────────────────────────────
// PATCH /api/auth/cambiar-password
router.patch("/cambiar-password", verificarToken, async (req, res) => {
  const { password_actual, nueva_password } = req.body;
  
  if (!password_actual || !nueva_password) {
    return res.status(400).json({ error: "Se requieren ambas contraseñas." });
  }
  if (nueva_password.length < 6) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
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

// ─── MIS ÓRDENES ──────────────────────────────────────────────
// GET /api/auth/mis-ordenes
router.get("/mis-ordenes", verificarToken, async (req, res) => {
  try {
    const [ordenes] = await db.query(
      `SELECT o.id, o.codigo, o.total, o.estado, o.metodo_pago,
              o.direccion_entrega, o.created_at,
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