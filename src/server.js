require("dotenv").config();

const path = require("path");
const express = require("express");

const { pool, probarConexion } = require("./db");
const { ErrorHttp, asyncHandler } = require("./utils/http");
const categoriasRouter = require("./routes/categorias");
const productosRouter = require("./routes/productos");
const contactoRouter = require("./routes/contacto");
const estadisticasRouter = require("./routes/estadisticas");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const RUTA_PUBLICA = path.join(__dirname, "..", "public");

const origenesPermitidos = new Set(
  [
    process.env.FRONTEND_URL,
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501",
    "http://127.0.0.1:5501"
  ].filter(Boolean)
);

app.disable("x-powered-by");

// CORS: permite el mismo origen del sitio y los orígenes configurados.
app.use((req, res, next) => {
  const origen = req.headers.origin;

  if (!origen) {
    return next();
  }

  let mismoOrigen = false;

  try {
    const url = new URL(origen);
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    mismoOrigen = url.host === host;
  } catch {
    mismoOrigen = false;
  }

  if (!mismoOrigen && !origenesPermitidos.has(origen)) {
    return next(new ErrorHttp(403, "Origen no permitido por CORS."));
  }

  res.setHeader("Access-Control-Allow-Origin", origen);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
});
app.use(express.json({ limit: "100kb" }));

// API
app.get(
  "/api/salud",
  asyncHandler(async (_req, res) => {
    try {
      const info = await probarConexion();
      res.json({
        estado: "ok",
        base_datos: info.base_datos,
        fecha_servidor: info.fecha_servidor
      });
    } catch (error) {
      res.status(503).json({
        estado: "error",
        mensaje: "No fue posible conectar con la base de datos."
      });
    }
  })
);

app.use("/api/categorias", categoriasRouter);
app.use("/api/productos", productosRouter);
app.use("/api/contacto", contactoRouter);
app.use("/api/estadisticas", estadisticasRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ mensaje: "Recurso de la API no encontrado." });
});

// Frontend estático
app.use(express.static(RUTA_PUBLICA, { extensions: ["html"] }));

app.use((_req, res) => {
  res.status(404).sendFile(path.join(RUTA_PUBLICA, "404.html"));
});

// Manejo centralizado de errores
app.use((error, _req, res, _next) => {
  if (error instanceof ErrorHttp) {
    return res.status(error.estado).json({
      mensaje: error.message,
      ...(error.detalles ? { detalles: error.detalles } : {})
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "El cuerpo de la solicitud no es un JSON válido." });
  }

  if (error.code === "23503") {
    return res.status(400).json({ mensaje: "La referencia indicada no existe." });
  }

  if (error.code === "23505") {
    return res.status(409).json({ mensaje: "El registro ya existe." });
  }

  if (error.code === "23514") {
    return res.status(400).json({ mensaje: "Los datos no cumplen una restricción de la base de datos." });
  }

  if (error.code === "22P02") {
    return res.status(400).json({ mensaje: "Uno de los datos enviados tiene un formato inválido." });
  }

  if (error.code === "ECONNREFUSED" || error.code === "57P01") {
    return res.status(503).json({ mensaje: "La base de datos no está disponible." });
  }

  console.error("Error no controlado:", error);
  return res.status(500).json({ mensaje: "Error interno del servidor." });
});

async function iniciar() {
  const info = await probarConexion();
  console.log(`Conectado a PostgreSQL (base de datos: ${info.base_datos}).`);

  const servidor = app.listen(PORT, () => {
    console.log(`NovaTech Store disponible en http://localhost:${PORT}`);
  });

  const cerrar = () => {
    servidor.close(async () => {
      await pool.end();
      console.log("Servidor detenido correctamente.");
      process.exit(0);
    });
  };

  process.on("SIGINT", cerrar);
  process.on("SIGTERM", cerrar);
}

if (require.main === module) {
  iniciar().catch((error) => {
    console.error("No fue posible iniciar el servidor:", error.message);
    process.exit(1);
  });
}

module.exports = app;
