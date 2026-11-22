const { Router } = require("express");
const { consultar } = require("../db");
const { asyncHandler } = require("../utils/http");

const router = Router();

/** GET /api/categorias: listado con la cantidad de productos de cada categoría. */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categorias = await consultar(
      `SELECT
         c.categoria_id,
         c.nombre,
         c.descripcion,
         COUNT(p.producto_id)::int AS total_productos
       FROM demo_categorias AS c
       LEFT JOIN demo_productos AS p ON p.categoria_id = c.categoria_id
       GROUP BY c.categoria_id
       ORDER BY c.nombre ASC`
    );

    res.json(categorias);
  })
);

module.exports = router;
