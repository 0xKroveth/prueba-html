const { Router } = require("express");
const { consultar } = require("../db");
const { asyncHandler, ErrorHttp } = require("../utils/http");
const { texto, entero, decimal, booleano } = require("../utils/validacion");

const router = Router();

const ORDENES = {
  nombre: "p.nombre ASC",
  precio_asc: "p.precio ASC",
  precio_desc: "p.precio DESC",
  recientes: "p.creado_en DESC"
};

const CAMPOS_PRODUCTO = `
  p.producto_id,
  p.nombre,
  p.descripcion,
  p.precio::float8 AS precio,
  p.stock,
  p.destacado,
  p.creado_en,
  c.categoria_id,
  c.nombre AS categoria
`;

async function buscarPorId(productoId) {
  const filas = await consultar(
    `SELECT ${CAMPOS_PRODUCTO}
     FROM demo_productos AS p
     INNER JOIN demo_categorias AS c ON c.categoria_id = p.categoria_id
     WHERE p.producto_id = $1`,
    [productoId]
  );
  return filas[0] || null;
}

/**
 * GET /api/productos
 * Lectura con filtros opcionales por categoría, texto, precio y destacados.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categoria = req.query.categoria
      ? entero(req.query.categoria, "categoria", { min: 1 })
      : null;
    const buscar = req.query.buscar
      ? texto(req.query.buscar, "buscar", { min: 1, max: 80 })
      : null;
    const precioMax = req.query.precioMax
      ? decimal(req.query.precioMax, "precioMax", { min: 1, max: 99999999.99 })
      : null;
    const destacados = req.query.destacados === "true" ? true : null;
    const orden = Object.hasOwn(ORDENES, req.query.orden) ? req.query.orden : "nombre";

    const productos = await consultar(
      `SELECT ${CAMPOS_PRODUCTO}
       FROM demo_productos AS p
       INNER JOIN demo_categorias AS c ON c.categoria_id = p.categoria_id
       WHERE ($1::int IS NULL OR p.categoria_id = $1)
         AND (
           $2::text IS NULL
           OR p.nombre ILIKE '%' || $2 || '%'
           OR p.descripcion ILIKE '%' || $2 || '%'
         )
         AND ($3::numeric IS NULL OR p.precio <= $3)
         AND ($4::boolean IS NULL OR p.destacado = $4)
       ORDER BY ${ORDENES[orden]}, p.producto_id ASC`,
      [categoria, buscar, precioMax, destacados]
    );

    res.json({ total: productos.length, productos });
  })
);

/** GET /api/productos/:id */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const productoId = entero(req.params.id, "id", { min: 1 });
    const producto = await buscarPorId(productoId);

    if (!producto) {
      throw new ErrorHttp(404, "El producto solicitado no existe.");
    }

    res.json(producto);
  })
);

/**
 * POST /api/productos
 * Inserción de un producto validado en el servidor.
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const datos = req.body ?? {};

    const nuevo = {
      nombre: texto(datos.nombre, "nombre", { min: 3, max: 120 }),
      descripcion: texto(datos.descripcion, "descripcion", { min: 10, max: 500 }),
      precio: decimal(datos.precio, "precio", { min: 1, max: 99999999.99 }),
      stock: entero(datos.stock ?? 0, "stock", { min: 0, max: 100000 }),
      categoria_id: entero(datos.categoria_id, "categoria_id", { min: 1 }),
      destacado: booleano(datos.destacado)
    };

    const categorias = await consultar(
      "SELECT categoria_id FROM demo_categorias WHERE categoria_id = $1",
      [nuevo.categoria_id]
    );

    if (categorias.length === 0) {
      throw new ErrorHttp(400, "La categoría indicada no existe.");
    }

    const insertados = await consultar(
      `INSERT INTO demo_productos
         (nombre, descripcion, precio, stock, categoria_id, destacado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING producto_id`,
      [
        nuevo.nombre,
        nuevo.descripcion,
        nuevo.precio,
        nuevo.stock,
        nuevo.categoria_id,
        nuevo.destacado
      ]
    );

    const producto = await buscarPorId(insertados[0].producto_id);

    res.status(201).json({
      mensaje: "Producto agregado correctamente.",
      producto
    });
  })
);

module.exports = router;
