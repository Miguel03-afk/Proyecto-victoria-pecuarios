// backend/src/index.js — entry point con hardening de seguridad
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes        from "./routes/auth.routes.js";
import productosRoutes   from "./routes/productos.routes.js";
import categoriasRoutes  from "./routes/categorias.routes.js";
import adminRoutes       from "./routes/admin.routes.js";
import metasRoutes       from "./routes/metas.routes.js";
import reportesRoutes    from "./routes/reportes.routes.js";
import citasRouter           from "./routes/citas.routes.js";
import veterinarioRouter     from "./routes/veterinario.routes.js";
import adminVetsRouter       from "./routes/admin.veterinarios.routes.js";
import cajeroRouter          from "./routes/cajero.routes.js";
import pagosRoutes           from "./routes/pagos.routes.js";
import ordenesServicioRouter from "./routes/ordenes-servicio.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

/* ─── 1) CORS dinámico con whitelist desde .env ─────────────────────────────
   FRONTEND_ORIGINS en .env, separado por comas:
     FRONTEND_ORIGINS=http://localhost:5173,https://victoriapecuarios.com
   En dev, si no está definido, permite localhost:5173-5175.
*/
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
const allowedOrigins = (process.env.FRONTEND_ORIGINS || DEV_ORIGINS.join(","))
  .split(",").map(o => o.trim()).filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Permite requests sin origin (Postman, curl, server-to-server, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} no permitido por CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

/* ─── 2) Helmet — headers de seguridad estándar ─────────────────────────────
   Desactivo CSP en dev para no romper Vite HMR. En prod sí va con CSP estricto.
   crossOriginResourcePolicy: lo dejamos en cross-origin para que /uploads
   pueda ser leído desde el frontend en otro puerto.
*/
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === "production" ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

/* ─── 3) Compression para bajar payload ─────────────────────────────────────*/
app.use(compression());

/* ─── 4) Logging HTTP estructurado ──────────────────────────────────────────*/
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

/* ─── 5) Body parsers (con límite anti-DoS) ─────────────────────────────────*/
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

/* ─── 6) Rate limiting ──────────────────────────────────────────────────────
   - global: 300 req / 15 min por IP (sano para una SPA)
   - auth:   más estricto, 20 req / 15 min en /api/auth/* (anti brute force)
   - pagos:  10 req / 15 min en /api/pagos/* (anti abuso checkout)
   En dev, los límites son más laxos.
*/
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 300 : 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Intenta de nuevo en unos minutos." },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 20 : 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true, // solo cuenta los fallidos (login/registro errados)
  message: { error: "Demasiados intentos. Espera unos minutos antes de reintentar." },
});

const pagosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 10 : 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones de pago. Intenta de nuevo en unos minutos." },
});

/* ─── 7) Servir uploads (públicos, ya que el frontend los muestra) ──────────*/
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  maxAge: "7d",
  setHeaders(res) {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  },
}));

/* ─── 8) Rutas ──────────────────────────────────────────────────────────────*/
app.use("/api/citas",                  citasRouter);
app.use("/api/veterinario",            veterinarioRouter);
app.use("/api/admin/veterinarios",     adminVetsRouter);
app.use("/api/cajero",                 cajeroRouter);
app.use("/api/auth",       authLimiter, authRoutes);    // ← rate-limited
app.use("/api/productos",  productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/metas",      metasRoutes);
app.use("/api/reportes",   reportesRoutes);
app.use("/api/pagos",      pagosLimiter, pagosRoutes);  // ← rate-limited
app.use("/api/ordenes-servicio", ordenesServicioRouter);

/* ─── 9) Health check ───────────────────────────────────────────────────────*/
app.get("/", (req, res) => {
  res.json({ mensaje: "API Victoria Pecuarios activa", version: "2.0", env: NODE_ENV });
});
app.get("/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

/* ─── 10) Manejo 404 ────────────────────────────────────────────────────────*/
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no existe.` });
});

/* ─── 11) Manejo global de errores ──────────────────────────────────────────
   Captura los errores que tiren las rutas (incluido el de CORS) para no
   filtrar stack traces al cliente.
*/
app.use((err, req, res, _next) => {
  // CORS rechazado
  if (err && /CORS/i.test(err.message || "")) {
    return res.status(403).json({ error: "Origin no permitido" });
  }
  // Rate limit / validación zod / otros
  const status = err.status || err.statusCode || 500;
  const isProd = NODE_ENV === "production";
  res.status(status).json({
    error: isProd && status === 500 ? "Error interno del servidor" : (err.message || "Error"),
  });
  // Log server-side (no se envía al cliente)
  if (status >= 500) console.error("[ERROR]", err);
});

app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en http://localhost:${PORT} [${NODE_ENV}]`);
  console.log(`  CORS allow: ${allowedOrigins.join(", ")}`);
});
