const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_DATABASE || "demo_web",
  user: process.env.DB_USER || "demo_user",
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on("error", (error) => {
  console.error("Error inesperado en el pool de PostgreSQL:", error.message);
});

/**
 * Ejecuta una consulta parametrizada y devuelve las filas.
 * @param {string} sql Consulta SQL con marcadores $1, $2, ...
 * @param {Array<unknown>} parametros Valores de la consulta.
 */
async function consultar(sql, parametros = []) {
  const resultado = await pool.query(sql, parametros);
  return resultado.rows;
}

/** Comprueba la conexión y devuelve información básica del servidor. */
async function probarConexion() {
  const filas = await consultar(
    "SELECT current_database() AS base_datos, NOW() AS fecha_servidor"
  );
  return filas[0];
}

module.exports = { pool, consultar, probarConexion };
