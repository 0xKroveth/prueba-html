// rutas de items (leer, filtrar, crear)

const { Router } = require("express");
const { consultar } = require("../db");
const { asyncHandler, ErrorHttp } = require("../utils/http");
const { texto, entero, opcion, booleano } = require("../utils/validacion");
const { RAREZAS, ORDENES_ITEMS } = require("../constantes");

const router = Router();

// campos que necesito del item con su categoria
const CAMPOS_ITEM = `
  i.item_id,
  i.nombre,
  i.descripcion,
  i.obtencion,
  i.rareza,
  i.version,
  i.stack_max,
  i.icono,
  i.destacado,
  i.creado_en,
  c.categoria_id,
  c.nombre AS categoria,
  c.slug AS categoria_slug,
  c.icono AS categoria_icono
`;

// busca un item por su id
async function buscarPorId(itemId) {
  const filas = await consultar(
    `SELECT ${CAMPOS_ITEM}
     FROM items AS i
     INNER JOIN categorias AS c ON c.categoria_id = i.categoria_id
     WHERE i.item_id = $1`,
    [itemId]
  );
  return filas[0] || null;
}

// GET /api/items/versiones - versiones para el filtro
router.get(
  "/versiones",
  asyncHandler(async (_req, res) => {
    const filas = await consultar(
      "SELECT DISTINCT version FROM items ORDER BY version DESC"
    );
    res.json(filas.map((fila) => fila.version));
  })
);

// GET /api/items - lectura con filtros
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // leo y valido cada filtro que viene en la url (?buscar=...&rareza=...)
    const categoria = req.query.categoria
      ? entero(req.query.categoria, "categoria", { min: 1 })
      : null;
    const buscar = req.query.buscar
      ? texto(req.query.buscar, "buscar", { min: 1, max: 80 })
      : null;
    const rareza = req.query.rareza
      ? opcion(req.query.rareza, "rareza", RAREZAS)
      : null;
    const version = req.query.version
      ? texto(req.query.version, "version", { min: 1, max: 20 })
      : null;
    // si el filtro no viene queda en null y la consulta lo ignora
    const destacados = req.query.destacados === "true" ? true : null;
    // el orden solo puede ser una clave de la lista fija de constantes.js,
    // asi nunca entra texto del usuario directo al ORDER BY
    const orden = Object.hasOwn(ORDENES_ITEMS, req.query.orden)
      ? req.query.orden
      : "nombre";

    // una sola consulta para todos los filtros:
    // - "$1 IS NULL OR ..." hace que un filtro vacio no filtre nada
    // - ILIKE '%texto%' busca el texto en cualquier parte, sin importar mayusculas
    // - los valores van como parametros ($1, $2...) y no pegados al sql,
    //   por eso no se puede hacer inyeccion sql
    const items = await consultar(
      `SELECT ${CAMPOS_ITEM}
       FROM items AS i
       INNER JOIN categorias AS c ON c.categoria_id = i.categoria_id
       WHERE ($1::int IS NULL OR i.categoria_id = $1)
         AND (
           $2::text IS NULL
           OR i.nombre ILIKE '%' || $2 || '%'
           OR i.descripcion ILIKE '%' || $2 || '%'
           OR i.obtencion ILIKE '%' || $2 || '%'
         )
         AND ($3::text IS NULL OR i.rareza = $3)
         AND ($4::text IS NULL OR i.version = $4)
         AND ($5::boolean IS NULL OR i.destacado = $5)
       ORDER BY ${ORDENES_ITEMS[orden]}, i.item_id ASC`,
      [categoria, buscar, rareza, version, destacados]
    );

    // devuelvo el total para el contador y la lista de items
    res.json({ total: items.length, items });
  })
);

// GET /api/items/:id - un item por su id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    // el id tiene que ser un entero positivo, si no responde 400
    const itemId = entero(req.params.id, "id", { min: 1 });
    const item = await buscarPorId(itemId);

    if (!item) {
      throw new ErrorHttp(404, "El ítem solicitado no existe.");
    }

    res.json(item);
  })
);

// POST /api/items - crear un item nuevo
router.post(
  "/",
  asyncHandler(async (req, res) => {
    // datos que manda el formulario en formato json
    const datos = req.body ?? {};

    // valido todos los campos
    const nuevo = {
      nombre: texto(datos.nombre, "nombre", { min: 2, max: 100 }),
      descripcion: texto(datos.descripcion, "descripcion", { min: 10, max: 500 }),
      obtencion: texto(datos.obtencion, "obtencion", { min: 5, max: 300 }),
      categoria_id: entero(datos.categoria_id, "categoria_id", { min: 1 }),
      rareza: opcion(datos.rareza, "rareza", RAREZAS),
      version: texto(datos.version, "version", { min: 1, max: 20 }),
      stack_max: entero(datos.stack_max ?? 64, "stack_max", { min: 1, max: 64 }),
      icono: texto(datos.icono ?? "diamond", "icono", { min: 1, max: 64 }),
      destacado: booleano(datos.destacado)
    };

    // verifico que la categoria exista
    const categorias = await consultar(
      "SELECT categoria_id FROM categorias WHERE categoria_id = $1",
      [nuevo.categoria_id]
    );

    if (categorias.length === 0) {
      throw new ErrorHttp(400, "La categoría indicada no existe.");
    }

    // inserto con parametros y pido de vuelta el id generado
    const insertados = await consultar(
      `INSERT INTO items
         (nombre, descripcion, obtencion, categoria_id, rareza, version, stack_max, icono, destacado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING item_id`,
      [
        nuevo.nombre,
        nuevo.descripcion,
        nuevo.obtencion,
        nuevo.categoria_id,
        nuevo.rareza,
        nuevo.version,
        nuevo.stack_max,
        nuevo.icono,
        nuevo.destacado
      ]
    );

    // devuelvo el item completo con la categoria
    const item = await buscarPorId(insertados[0].item_id);

    // 201 = recurso creado
    res.status(201).json({
      mensaje: "Ítem agregado correctamente a la enciclopedia.",
      item
    });
  })
);

module.exports = router;
