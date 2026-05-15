import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { enviarCodigoVerificacion } from "../services/email.js";
import {
  registroSchema, loginSchema, verificarEmailSchema, reenviarCodigoSchema,
  actualizarPerfilSchema, cambiarPasswordSchema, cambiarEmailSchema,
} from "../validators/auth.validators.js";

const genCodigo = () => String(Math.floor(100000 + Math.random() * 900000));

const router = Router();

// ─── REGISTRO ────────────────────────────────────────────────────────────────
// POST /api/auth/registro
router.post("/registro", validateBody(registroSchema), async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  try {
    const [existe] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0)
      return res.status(409).json({ error: "Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?" });

    const hash   = await bcrypt.hash(password, 10);
    const codigo = genCodigo();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, email_verificado, email_token, email_token_expiry)
       VALUES (?, ?, ?, ?, 'cliente', 0, ?, ?)`,
      [nombre, apellido, email, hash, codigo, expiry]
    );

    // Intentar enviar email — si falla, la cuenta queda pendiente pero el usuario puede reenviar
    try {
      await enviarCodigoVerificacion(email, nombre, codigo);
    } catch (emailErr) {
      console.error("Email no enviado (revisar configuración Brevo):", emailErr.message);
      // No fallamos el registro: el usuario existe y puede solicitar reenvío
    }

    res.status(201).json({ pendienteVerificacion: true, email });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ─── VERIFICAR EMAIL ──────────────────────────────────────────────────────────
// POST /api/auth/verificar-email
router.post("/verificar-email", validateBody(verificarEmailSchema), async (req, res) => {
  const { email, codigo } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, apellido, rol, email_token, email_token_expiry, email_verificado FROM usuarios WHERE email = ?",
      [email]
    );
    if (!rows.length)
      return res.status(404).json({ error: "No se encontró una cuenta con ese correo." });

    const u = rows[0];
    if (u.email_verificado)
      return res.status(400).json({ error: "Este correo ya está verificado. Inicia sesión." });

    if (u.email_token !== String(codigo))
      return res.status(400).json({ error: "Código incorrecto. Revisa tu correo." });

    if (new Date() > new Date(u.email_token_expiry))
      return res.status(400).json({ error: "El código expiró. Solicita uno nuevo.", expirado: true });

    await db.query(
      "UPDATE usuarios SET email_verificado = 1, email_token = NULL, email_token_expiry = NULL WHERE id = ?",
      [u.id]
    );

    const token = jwt.sign(
      { id: u.id, nombre: u.nombre, apellido: u.apellido, email, rol: u.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      mensaje: "Correo verificado. ¡Bienvenido!",
      token,
      usuario: { id: u.id, nombre: u.nombre, apellido: u.apellido, email, rol: u.rol },
    });
  } catch (err) {
    console.error("Error verificando email:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ─── REENVIAR CÓDIGO ──────────────────────────────────────────────────────────
// POST /api/auth/reenviar-codigo
router.post("/reenviar-codigo", validateBody(reenviarCodigoSchema), async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email_verificado FROM usuarios WHERE email = ?",
      [email]
    );
    if (!rows.length)
      return res.status(404).json({ error: "No se encontró una cuenta con ese correo." });
    if (rows[0].email_verificado)
      return res.status(400).json({ error: "Este correo ya está verificado." });

    const codigo = genCodigo();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      "UPDATE usuarios SET email_token = ?, email_token_expiry = ? WHERE id = ?",
      [codigo, expiry, rows[0].id]
    );

    try {
      await enviarCodigoVerificacion(email, rows[0].nombre, codigo);
      res.json({ mensaje: "Código reenviado. Revisa tu correo." });
    } catch (emailErr) {
      console.error("Email no enviado (revisar configuración Brevo):", emailErr.message);
      res.status(503).json({ error: "No se pudo enviar el correo. Verifica la configuración de email en el servidor." });
    }
  } catch (err) {
    console.error("Error reenviando código:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, apellido, email, password_hash, rol, activo, email_verificado FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: "Tu cuenta está desactivada. Contacta al administrador." });
    }

    if (usuario.email_verificado === 0) {
      return res.status(403).json({
        error: "Debes verificar tu correo antes de iniciar sesión.",
        pendienteVerificacion: true,
        email: usuario.email,
      });
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
router.put("/perfil", verificarToken, validateBody(actualizarPerfilSchema), async (req, res) => {
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
router.put("/cambiar-email", verificarToken, validateBody(cambiarEmailSchema), async (req, res) => {
  const { nuevo_email, password_actual } = req.body;

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
router.patch("/cambiar-password", verificarToken, validateBody(cambiarPasswordSchema), async (req, res) => {
  const { password_actual, nueva_password } = req.body;

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
      `SELECT o.id, o.codigo, o.total, o.subtotal, o.costo_envio, o.iva_total,
              LOWER(o.estado) AS estado,
              LOWER(o.metodo_pago) AS metodo_pago,
              o.direccion_entrega, o.ciudad_entrega, o.created_at,
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

// ─── DETALLE DE UNA ORDEN ────────────────────────────────────────────────────
// GET /api/auth/mis-ordenes/:id
router.get("/mis-ordenes/:id", verificarToken, async (req, res) => {
  try {
    const [[orden]] = await db.query(
      `SELECT id, codigo, total, subtotal, iva_total, estado,
              metodo_pago, direccion_entrega, ciudad_entrega, created_at
       FROM ordenes WHERE id = ? AND usuario_id = ?`,
      [req.params.id, req.usuario.id]
    );
    if (!orden) return res.status(404).json({ error: "Orden no encontrada." });

    const [items] = await db.query(
      `SELECT nombre_snap, cantidad, precio_unit, subtotal, iva_valor
       FROM detalle_orden WHERE orden_id = ?`,
      [orden.id]
    );

    res.json({ ...orden, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
