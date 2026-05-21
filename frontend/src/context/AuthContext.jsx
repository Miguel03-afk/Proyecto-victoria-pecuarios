import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al cargar la app, revisa si hay sesión guardada
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");
    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  const login = (token, datosUsuario) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  const esAdmin     = usuario?.rol === "admin" || usuario?.rol === "superadmin";
  const esSuperAdmin = usuario?.rol === "superadmin";
  const esCajero    = usuario?.rol === "cajero";

  return (
    <AuthContext.Provider value={{ usuario, login, logout, esAdmin, esSuperAdmin, esCajero, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);