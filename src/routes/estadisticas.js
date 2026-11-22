// ruta de estadisticas para la pagina de inicio

const { Router } = require("express");
const { consultar } = require("../db");
const { asyncHandler } = require("../utils/http");

const router = Router();

// GET /api/estadisticas - totales para los contadores del inicio
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const filas = await consultar(
      `SELECT
         (SELECT COUNT(*)::int FROM items) AS total_items,
         (SELECT COUNT(*)::int FROM guias) AS total_guias,
         (SELECT COUNT(*)::int FROM categorias) AS total_categorias,
         (SELECT COUNT(DISTINCT version)::int FROM items) AS total_versiones,
         (SELECT COUNT(*)::int FROM items WHERE destacado) AS items_destacados,
         (SELECT COUNT(DISTINCT tema)::int FROM guias) AS total_temas`
    );

    res.json(filas[0]);
  })
);

module.exports = router;
