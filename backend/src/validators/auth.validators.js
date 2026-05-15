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
