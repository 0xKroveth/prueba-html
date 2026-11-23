// rutas de guias (leer y filtrar)

const { Router } = require("express");
const { consultar } = require("../db");
const { asyncHandler, ErrorHttp } = require("../utils/http");
const { texto, entero, opcion } = require("../utils/validacion");
const { DIFICULTADES, ORDENES_GUIAS } = require("../constantes");

const router = Router();

// campos que necesito de la guia
const CAMPOS_GUIA = `
  g.guia_id,
  g.titulo,
  g.resumen,
  g.contenido,
  g.tema,
  g.dificultad,
  g.version,
  g.duracion,
  g.icono,
  g.destacada,
  g.creado_en
`;

// GET /api/guias/temas - temas para el filtro
router.get(
  "/temas",
  asyncHandler(async (_req, res) => {
    const filas = await consultar("SELECT DISTINCT tema FROM guias ORDER BY tema ASC");
    res.json(filas.map((fila) => fila.tema));
  })
);

// GET /api/guias - lectura con filtros
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // leo y valido cada filtro que viene en la url (?buscar=...&dificultad=...)
    const buscar = req.query.buscar
      ? texto(req.query.buscar, "buscar", { min: 1, max: 80 })
      : null;
    const dificultad = req.query.dificultad
      ? opcion(req.query.dificultad, "dificultad", DIFICULTADES)
      : null;
    const tema = req.query.tema
      ? texto(req.query.tema, "tema", { min: 1, max: 40 })
      : null;
    const version = req.query.version
      ? texto(req.query.version, "version", { min: 1, max: 20 })
      : null;
    // si el filtro no viene queda en null y la consulta lo ignora
    const destacadas = req.query.destacadas === "true" ? true : null;
    // el orden solo puede ser una clave de la lista fija de constantes.js,
    // asi nunca entra texto del usuario directo al ORDER BY
    const orden = Object.hasOwn(ORDENES_GUIAS, req.query.orden)
      ? req.query.orden
      : "titulo";

    // igual que en items: un filtro vacio (null) no filtra nada,
    // ILIKE busca el texto en titulo, resumen y contenido,
    // y los valores van como parametros para evitar inyeccion sql
    const guias = await consultar(
      `SELECT ${CAMPOS_GUIA}
       FROM guias AS g
       WHERE (
           $1::text IS NULL
           OR g.titulo ILIKE '%' || $1 || '%'
           OR g.resumen ILIKE '%' || $1 || '%'
           OR g.contenido ILIKE '%' || $1 || '%'
         )
         AND ($2::text IS NULL OR g.dificultad = $2)
         AND ($3::text IS NULL OR g.tema = $3)
         AND ($4::text IS NULL OR g.version = $4)
         AND ($5::boolean IS NULL OR g.destacada = $5)
       ORDER BY ${ORDENES_GUIAS[orden]}, g.guia_id ASC`,
      [buscar, dificultad, tema, version, destacadas]
    );

    res.json({ total: guias.length, guias });
  })
);

// GET /api/guias/:id - una guia por su id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    // el id tiene que ser un entero positivo, si no responde 400
    const guiaId = entero(req.params.id, "id", { min: 1 });
    const filas = await consultar(
      `SELECT ${CAMPOS_GUIA} FROM guias AS g WHERE g.guia_id = $1`,
      [guiaId]
    );

    if (filas.length === 0) {
      throw new ErrorHttp(404, "La guía solicitada no existe.");
    }

    res.json(filas[0]);
  })
);

module.exports = router;
