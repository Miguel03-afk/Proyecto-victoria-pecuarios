import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes       from "./routes/auth.routes.js";
import productosRoutes  from "./routes/productos.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import adminRoutes      from "./routes/admin.routes.js";
import metasRoutes      from "./routes/metas.routes.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",       authRoutes);
app.use("/api/productos",  productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/metas",      metasRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "API Victoria Pecuarios activa", version: "2.0" });
});

app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no existe.` });
});

app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
});