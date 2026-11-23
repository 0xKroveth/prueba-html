// servidor principal de craftpedia

const path = require("path");

// leo el .env de la carpeta backend
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");

const { pool, probarConexion } = require("./db");
const { ErrorHttp, asyncHandler } = require("./utils/http");
const metaRouter = require("./routes/meta");
const itemsRouter = require("./routes/items");
const guiasRouter = require("./routes/guias");
const estadisticasRouter = require("./routes/estadisticas");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const RUTA_PUBLICA = path.join(__dirname, "..", "frontend");

// origenes que pueden hacer peticiones a la api
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

// saco el header x-powered-by por seguridad
app.disable("x-powered-by");

// middleware de cors
app.use((req, res, next) => {
  const origen = req.headers.origin;

  if (!origen) {
    return next();
  }

  // reviso si es el mismo origen
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

// ruta de salud para verificar que la bd esta conectada
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

// rutas de la api
app.use("/api/meta", metaRouter);
app.use("/api/items", itemsRouter);
app.use("/api/guias", guiasRouter);
app.use("/api/estadisticas", estadisticasRouter);

// si no existe la ruta en la api
app.use("/api", (_req, res) => {
  res.status(404).json({ mensaje: "Recurso de la API no encontrado." });
});

// sirvo los archivos del frontend
app.use(express.static(RUTA_PUBLICA, { extensions: ["html"] }));

// si no encuentra nada muestro el 404
app.use((_req, res) => {
  res.status(404).sendFile(path.join(RUTA_PUBLICA, "404.html"));
});

// manejo de errores centralizado
app.use((error, _req, res, _next) => {
  if (error instanceof ErrorHttp) {
    return res.status(error.estado).json({
      mensaje: error.message,
      ...(error.detalles ? { detalles: error.detalles } : {})
    });
  }

  // json mal formado
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "El cuerpo de la solicitud no es un JSON válido." });
  }

  // errores de postgres
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

// inicio el servidor
async function iniciar() {
  const info = await probarConexion();
  console.log(`Conectado a PostgreSQL (base de datos: ${info.base_datos}).`);

  const servidor = app.listen(PORT, () => {
    console.log(`CraftPedia disponible en http://localhost:${PORT}`);
  });

  // cierro bien cuando hago ctrl+c
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
