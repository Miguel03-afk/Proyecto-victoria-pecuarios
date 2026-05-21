// backend/src/validators/auth.validators.js
// Schemas zod para validar inputs de /api/auth/* antes de tocar BD.
import { z } from "zod";

/* ─── Helpers comunes ───────────────────────────────────────────────────── */
const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .email("Email inválido")
  .max(120, "Email demasiado largo");

const passwordSchema = z.string()
  .min(8,  "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede tener más de 72 caracteres") // bcrypt limit
  .refine(
    (p) => /[A-Z]/.test(p) || /[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p),
    "Usa al menos una mayúscula, número o símbolo"
  );

/* Schema más estricto para reset de contraseña: exige mayúscula Y carácter
   especial obligatorios (ambos, no uno u otro). Más seguro que el de registro
   porque el reset implica que la cuenta ya fue comprometida o el usuario
   olvidó la clave — momento ideal para forzar una mejor. */
const passwordStrongSchema = z.string()
  .min(8,  "La contraseña debe tener al menos 8 caracteres")
  .max(20, "La contraseña no puede tener más de 20 caracteres")
  .regex(/[A-Z]/,        "Debe contener al menos una letra mayúscula")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial (!@#$%^&*...)");

const nombreSchema = z.string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(60, "Máximo 60 caracteres")
  .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "Solo letras, espacios, apóstrofes y guiones");

const telefonoSchema = z.string()
  .trim()
  .regex(/^[\d+\s()-]{7,20}$/, "Teléfono inválido")
  .optional()
  .nullable()
  .transform((v) => v || null);

/* ─── Schemas por endpoint ──────────────────────────────────────────────── */
export const registroSchema = z.object({
  nombre:   nombreSchema,
  apellido: nombreSchema,
  email:    emailSchema,
  password: passwordSchema,
  telefono: telefonoSchema,
});

export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, "Contraseña requerida").max(72),
});

export const verificarEmailSchema = z.object({
  email:  emailSchema,
  codigo: z.string()
    .trim()
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d+$/, "El código debe ser numérico"),
});

export const reenviarCodigoSchema = z.object({
  email: emailSchema,
});

export const actualizarPerfilSchema = z.object({
  nombre:      nombreSchema.optional(),
  apellido:    nombreSchema.optional(),
  telefono:    telefonoSchema,
  avatar_url:  z.string().url().max(500).optional().nullable(),
  facturacion: z.union([z.string(), z.object({}).passthrough()]).optional().nullable(),
}).refine(
  (data) => Object.values(data).some(v => v !== undefined),
  "Debes enviar al menos un campo a actualizar"
);

export const cambiarPasswordSchema = z.object({
  password_actual: z.string().min(1, "Contraseña actual requerida"),
  nueva_password:  passwordSchema,
});

export const cambiarEmailSchema = z.object({
  nuevo_email:     emailSchema,
  password_actual: z.string().min(1, "Contraseña actual requerida"),
});

/* ─── Reset de contraseña (flujo "Olvidé mi contraseña") ────────────────── */

// 1) Solicitar reset → recibe email, genera token, envía correo.
export const solicitarResetSchema = z.object({
  email: emailSchema,
});

// 2) Restablecer con token → recibe token + nueva password.
export const restablecerPasswordSchema = z.object({
  token: z.string()
    .length(64, "Token inválido")
    .regex(/^[a-f0-9]+$/i, "Token inválido"),
  nueva_password: passwordStrongSchema,
});
