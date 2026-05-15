// backend/src/middlewares/validate.middleware.js
// Middleware que valida req.body contra un schema zod.
// Si pasa: sobrescribe req.body con el resultado parseado (datos sanitizados).
// Si falla: devuelve 400 con la lista de errores legible.

/**
 * @param {import('zod').ZodSchema} schema
 * @returns express middleware
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errores = result.error.issues.map(i => ({
      campo:   i.path.join("."),
      mensaje: i.message,
    }));
    return res.status(400).json({
      error: errores[0]?.mensaje || "Datos inválidos",
      errores,
    });
  }
  req.body = result.data;
  next();
};

/**
 * Igual pero para req.query.
 */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errores = result.error.issues.map(i => ({
      campo:   i.path.join("."),
      mensaje: i.message,
    }));
    return res.status(400).json({
      error: errores[0]?.mensaje || "Query inválida",
      errores,
    });
  }
  req.query = result.data;
  next();
};
