import express from "express";
import db from "./db.js";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Servidor Express activo");
});

app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS resultado", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error de conexión DB" });
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
