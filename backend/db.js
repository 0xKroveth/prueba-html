// conexion a postgresql

const { Pool } = require("pg");

// creo el pool con los datos del .env
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_DATABASE || "demo_web",
  user: process.env.DB_USER || "demo_user",
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  // maximo de conexiones abiertas a la vez
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on("error", (error) => {
  console.error("Error inesperado en el pool de PostgreSQL:", error.message);
});

// ejecuta una consulta con parametros y devuelve las filas
async function consultar(sql, parametros = []) {
  // pg reemplaza $1, $2... por los parametros de forma segura
  const resultado = await pool.query(sql, parametros);
  return resultado.rows;
}

// prueba la conexion y devuelve info del servidor
async function probarConexion() {
  const filas = await consultar(
    "SELECT current_database() AS base_datos, NOW() AS fecha_servidor"
  );
  return filas[0];
}

module.exports = { pool, consultar, probarConexion };
