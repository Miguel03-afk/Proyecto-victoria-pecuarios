import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

export function RutaAdmin({ children }) {
  const { usuario, esAdmin, cargando } = useAuth();
  if (cargando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/" replace />;
  return children;
}
