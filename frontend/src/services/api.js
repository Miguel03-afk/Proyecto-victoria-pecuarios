import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Rutas donde NO debemos redirigir aunque haya 401:
//  - El usuario ya está en una pantalla de auth (no tiene sentido).
//  - Páginas públicas: si un endpoint público da 401 por bug del lado del
//    servidor, no queremos secuestrar al usuario al login.
const AUTH_PATHS = [
  "/login", "/registro", "/verificar-email",
  "/solicitar-reset", "/restablecer-password",
];
const PUBLIC_PATHS = ["/", "/equipo", "/contacto", "/galeria"];

// Interceptor: adjunta el token JWT automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: si el token expiró (401), limpia sesión.
// IMPORTANTE: no redirigir con window.location.href si:
//  a) Ya estamos en una ruta de auth — eso causaba un loop reload→login→reload
//     cuando un token viejo expirado seguía en localStorage.
//  b) Estamos en una ruta pública — el componente puede manejar el error y
//     no tiene sentido sacar al usuario de allí.
// No actuar en 403 — puede ser rol insuficiente o email no verificado.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      const path = window.location.pathname;
      const enAuth   = AUTH_PATHS.some(p => path.startsWith(p));
      const enPublic = PUBLIC_PATHS.includes(path);

      if (!enAuth && !enPublic) {
        // SPA-friendly: usar history en lugar de href para no recargar
        // y preservar el state actual cuando react-router-dom esté disponible.
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;