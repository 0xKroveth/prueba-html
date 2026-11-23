// conexion a la base de datos postgresql

const { Pool } = require("pg");

// los datos de conexion vienen del archivo .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

module.exports = pool;
