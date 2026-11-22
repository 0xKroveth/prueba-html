const { Router } = require("express");
const { consultar } = require("../db");
const { asyncHandler } = require("../utils/http");

const router = Router();

/** GET /api/estadisticas: indicadores para la página de inicio. */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const filas = await consultar(
      `SELECT
         (SELECT COUNT(*)::int FROM demo_productos) AS total_productos,
         (SELECT COUNT(*)::int FROM demo_categorias) AS total_categorias,
         (SELECT COUNT(*)::int FROM demo_productos WHERE destacado) AS productos_destacados,
         (SELECT COALESCE(SUM(stock), 0)::int FROM demo_productos) AS unidades_en_stock,
         (SELECT COALESCE(ROUND(AVG(precio), 0), 0)::float8 FROM demo_productos) AS precio_promedio`
    );

    res.json(filas[0]);
  })
);

module.exports = router;
