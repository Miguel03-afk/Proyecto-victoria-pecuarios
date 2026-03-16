import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = Router();

// ─── REGISTRO ────────────────────────────────────────────────
// POST /api/auth/registro
router.post("/registro", async (req, res) => {
  const { nombre, apellido, email, password, telefono, tipo_documento, numero_documento } = req.body;

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

    // Insertar usuario con rol 'cliente' por defecto
    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, tipo_documento, numero_documento, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'cliente')`,
      [nombre, apellido, email, hash, telefono || null, tipo_documento || "CC", numero_documento || null]
    );

    // Generar token JWT inmediatamente (el usuario queda logueado tras registrarse)
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
    // Buscar usuario por email
    const [rows] = await db.query(
      "SELECT id, nombre, apellido, email, password_hash, rol, activo FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    const usuario = rows[0];

    // Verificar que la cuenta esté activa
    if (!usuario.activo) {
      return res.status(403).json({ error: "Tu cuenta está desactivada. Contacta al administrador." });
    }

    // Comparar contraseña con el hash
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    // Generar JWT
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
// GET /api/auth/me  (requiere token)
import { verificarToken } from "../middlewares/auth.middleware.js";

router.get("/me", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nombre, apellido, email, telefono, tipo_documento, numero_documento, rol, avatar_url, created_at FROM usuarios WHERE id = ?",
      [req.usuario.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;