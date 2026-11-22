const { Router } = require("express");
const { consultar } = require("../db");
const { asyncHandler } = require("../utils/http");
const { RAREZAS, DIFICULTADES } = require("../constantes");

const router = Router();

/**
 * GET /api/meta
 * Opciones de filtros y categorías con su cantidad de ítems.
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [categorias, versiones, temas] = await Promise.all([
      consultar(
        `SELECT
           c.categoria_id,
           c.nombre,
           c.descripcion,
           c.icono,
           c.slug,
           COUNT(i.item_id)::int AS total_items
         FROM categorias AS c
         LEFT JOIN items AS i ON i.categoria_id = c.categoria_id
         GROUP BY c.categoria_id
         ORDER BY c.categoria_id ASC`
      ),
      consultar("SELECT DISTINCT version FROM items ORDER BY version DESC"),
      consultar("SELECT DISTINCT tema FROM guias ORDER BY tema ASC")
    ]);

    res.json({
      categorias,
      versiones: versiones.map((fila) => fila.version),
      temas: temas.map((fila) => fila.tema),
      rarezas: RAREZAS,
      dificultades: DIFICULTADES
    });
  })
);

module.exports = router;
