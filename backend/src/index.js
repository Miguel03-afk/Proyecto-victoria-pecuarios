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

import authRoutes      from "./routes/auth.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import adminRoutes     from "./routes/admin.routes.js";
import metasRoutes     from "./routes/metas.routes.js";
import reportesRoutes  from "./routes/reportes.routes.js";
import cajeroRouter    from "./routes/cajero.routes.js";
import pagosRoutes     from "./routes/pagos.routes.js";
import favoritosRouter from "./routes/favoritos.routes.js";
import publicRouter    from "./routes/public.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

/* ─── CORS dinámico con whitelist desde .env ──────────────────────────────── */
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
const allowedOrigins = (process.env.FRONTEND_ORIGINS || DEV_ORIGINS.join(","))
  .split(",").map(o => o.trim()).filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} no permitido por CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

/* ─── Helmet — headers de seguridad ──────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === "production" ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

app.use(compression());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

/* ─── Rate limiting ───────────────────────────────────────────────────────── */
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
  skipSuccessfulRequests: true,
  message: { error: "Demasiados intentos. Espera unos minutos antes de reintentar." },
});

const pagosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 10 : 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones de pago. Intenta de nuevo en unos minutos." },
});

/* ─── Uploads estáticos ───────────────────────────────────────────────────── */
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  maxAge: "5m",
  etag: true,
  lastModified: true,
  setHeaders(res) {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  },
}));

/* ─── Rutas ───────────────────────────────────────────────────────────────── */
app.use("/api/auth",       authLimiter, authRoutes);
app.use("/api/productos",  productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/metas",      metasRoutes);
app.use("/api/reportes",   reportesRoutes);
app.use("/api/cajero",     cajeroRouter);
app.use("/api/pagos",      pagosLimiter, pagosRoutes);
app.use("/api/favoritos",  favoritosRouter);
app.use("/api/public",     publicRouter);

/* ─── Health check ────────────────────────────────────────────────────────── */
app.get("/", (req, res) => {
  res.json({ mensaje: "API Victoria Pets · Tienda Veterinaria", version: "3.0", env: NODE_ENV });
});
app.get("/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

/* ─── 404 ─────────────────────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no existe.` });
});

/* ─── Error handler global ────────────────────────────────────────────────── */
app.use((err, req, res, _next) => {
  if (err && /CORS/i.test(err.message || "")) {
    return res.status(403).json({ error: "Origin no permitido" });
  }
  const status = err.status || err.statusCode || 500;
  const isProd = NODE_ENV === "production";
  res.status(status).json({
    error: isProd && status === 500 ? "Error interno del servidor" : (err.message || "Error"),
  });
  if (status >= 500) console.error("[ERROR]", err);
});

app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en http://localhost:${PORT} [${NODE_ENV}]`);
  console.log(`  CORS allow: ${allowedOrigins.join(", ")}`);
});
