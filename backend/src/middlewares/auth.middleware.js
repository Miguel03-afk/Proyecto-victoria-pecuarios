import jwt from "jsonwebtoken";

// Verifica que el token JWT sea válido
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token requerido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, nombre, email, rol }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado." });
  }
};

// Solo permite pasar a admin o superadmin
export const soloAdmin = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.usuario?.rol)) {
    return res.status(403).json({ error: "No tienes permisos de administrador." });
  }
  next();
};

// Solo permite pasar a superadmin
export const soloSuperAdmin = (req, res, next) => {
  if (req.usuario?.rol !== "superadmin") {
    return res.status(403).json({ error: "Acceso restringido a superadmin." });
  }
  next();
};