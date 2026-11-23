// datos para llenar los selects de los filtros

const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/meta
router.get("/", async (req, res) => {
  try {
    // categorias con cuantos items tiene cada una
    const categorias = await pool.query(
      `SELECT c.*, COUNT(i.item_id)::int AS total_items
       FROM categorias c
       LEFT JOIN items i ON i.categoria_id = c.categoria_id
       GROUP BY c.categoria_id
       ORDER BY c.categoria_id`
    );
    // versiones y temas sin repetir para los filtros
    const versiones = await pool.query("SELECT DISTINCT version FROM items ORDER BY version DESC");
    const temas = await pool.query("SELECT DISTINCT tema FROM guias ORDER BY tema");

    res.json({
      categorias: categorias.rows,
      versiones: versiones.rows.map((fila) => fila.version),
      temas: temas.rows.map((fila) => fila.tema),
      // estas son fijas, no cambian
      rarezas: ["Común", "Poco común", "Raro", "Épico", "Legendario"],
      dificultades: ["Principiante", "Intermedio", "Avanzado"]
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al cargar los filtros." });
  }
});

module.exports = router;
