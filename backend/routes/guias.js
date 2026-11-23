// rutas de guias: listar, buscar y ver una

const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/guias - lista con filtros
router.get("/", async (req, res) => {
  try {
    const buscar = req.query.buscar || null;
    const dificultad = req.query.dificultad || null;
    const tema = req.query.tema || null;
    // destacadas solo se usa en el inicio
    const destacadas = req.query.destacadas === "true" ? true : null;

    // el orden lo elijo yo, nunca pego texto del usuario en el sql
    let orden = "titulo ASC";
    if (req.query.orden === "recientes") {
      orden = "creado_en DESC";
    } else if (req.query.orden === "dificultad") {
      orden = `CASE dificultad WHEN 'Principiante' THEN 1 WHEN 'Intermedio' THEN 2 ELSE 3 END, titulo ASC`;
    }

    // igual que en items: busca en titulo, resumen y contenido
    const resultado = await pool.query(
      `SELECT * FROM guias
       WHERE ($1::text IS NULL
              OR titulo ILIKE '%' || $1 || '%'
              OR resumen ILIKE '%' || $1 || '%'
              OR contenido ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR dificultad = $2)
         AND ($3::text IS NULL OR tema = $3)
         AND ($4::boolean IS NULL OR destacada = $4)
       ORDER BY ${orden}`,
      [buscar, dificultad, tema, destacadas]
    );

    res.json({ total: resultado.rows.length, guias: resultado.rows });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al buscar las guías." });
  }
});

// GET /api/guias/3 - una guia por su id
router.get("/:id", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM guias WHERE guia_id = $1", [req.params.id]);

    // si no encontro nada respondo 404
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "La guía no existe." });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(400).json({ mensaje: "El id no es válido." });
  }
});

module.exports = router;
