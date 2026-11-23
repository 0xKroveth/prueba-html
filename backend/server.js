// servidor de craftpedia

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const pool = require("./db");

// creo la aplicacion de express
const app = express();
// puerto del .env o 3000 si no viene
const PORT = process.env.PORT || 3000;
const carpetaFrontend = path.join(__dirname, "..", "frontend");

// para poder leer el json que manda el formulario
app.use(express.json());

// rutas de la api, cada una esta en su archivo dentro de routes/
app.use("/api/items", require("./routes/items"));
app.use("/api/guias", require("./routes/guias"));
app.use("/api/meta", require("./routes/meta"));
app.use("/api/estadisticas", require("./routes/estadisticas"));

// muestro las paginas del frontend
app.use(express.static(carpetaFrontend));

// si la pagina no existe muestro el 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(carpetaFrontend, "404.html"));
});

// si llega un json mal escrito respondo con un mensaje simple
app.use((error, req, res, next) => {
  res.status(400).json({ mensaje: "Los datos enviados no son válidos." });
});

// pruebo la base de datos y despues prendo el servidor
pool.query("SELECT NOW()")
  .then(() => {
    console.log("Conectado a PostgreSQL");
    app.listen(PORT, () => {
      console.log("CraftPedia en http://localhost:" + PORT);
    });
  })
  .catch((error) => {
    console.log("No se pudo conectar a la base de datos:", error.message);
  });
