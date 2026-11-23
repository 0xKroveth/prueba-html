// numeros que se muestran en el inicio

const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/estadisticas
router.get("/", async (req, res) => {
  try {
    // cuento todo en una sola consulta
    const resultado = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM items) AS total_items,
         (SELECT COUNT(*)::int FROM guias) AS total_guias,
         (SELECT COUNT(*)::int FROM categorias) AS total_categorias,
         (SELECT COUNT(DISTINCT version)::int FROM items) AS total_versiones`
    );

    res.json(resultado.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al cargar las estadísticas." });
  }
});

module.exports = router;
