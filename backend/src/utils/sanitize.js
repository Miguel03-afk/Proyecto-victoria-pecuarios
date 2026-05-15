// backend/src/utils/sanitize.js
// Helpers para evitar exponer datos sensibles en respuestas API.

/**
 * Lista de campos que NUNCA deben salir del backend.
 * Si en el futuro agregas campos sensibles (tokens, hashes), ponlos aquí.
 */
const CAMPOS_PROHIBIDOS_USUARIO = [
  "password_hash",
  "password",
  "email_token",
  "email_token_expiry",
  "codigo_verificacion",
  "codigo_verificacion_expira",
  "reset_token",
  "reset_token_expiry",
];

/**
 * Sanitiza un objeto usuario (o array) quitando campos sensibles.
 * Acepta null/undefined sin fallar.
 *
 * @param {object|object[]|null} usuario
 * @returns {object|object[]|null}
 */
export function sanitizeUser(usuario) {
  if (usuario == null) return usuario;
  if (Array.isArray(usuario)) return usuario.map(sanitizeUser);

  const clean = { ...usuario };
  for (const campo of CAMPOS_PROHIBIDOS_USUARIO) {
    if (campo in clean) delete clean[campo];
  }
  return clean;
}

/**
 * Genérico: sanitiza cualquier objeto removiendo claves específicas.
 *
 * @param {object} obj
 * @param {string[]} campos
 */
export function omit(obj, campos = []) {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(item => omit(item, campos));
  const clean = { ...obj };
  for (const c of campos) delete clean[c];
  return clean;
}

/**
 * Sanitiza una orden completa (incluido detalles del cliente si vinieran anidados).
 */
export function sanitizeOrden(orden) {
  if (!orden) return orden;
  if (Array.isArray(orden)) return orden.map(sanitizeOrden);
  const clean = { ...orden };
  // Si la orden trae el cliente anidado
  if (clean.cliente) clean.cliente = sanitizeUser(clean.cliente);
  if (clean.usuario) clean.usuario = sanitizeUser(clean.usuario);
  return clean;
}
