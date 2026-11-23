// rutas de items: listar, buscar, ver uno y agregar

const express = require("express");
const pool = require("../db");

const router = express.Router();

// rarezas que acepto al agregar un item
const rarezas = ["Común", "Poco común", "Raro", "Épico", "Legendario"];

// GET /api/items - lista con filtros
router.get("/", async (req, res) => {
  try {
    // si un filtro no viene queda en null
    const buscar = req.query.buscar || null;
    const categoria = req.query.categoria || null;
    const rareza = req.query.rareza || null;
    const version = req.query.version || null;
    // destacados solo se usa en el inicio
    const destacados = req.query.destacados === "true" ? true : null;

    // el orden lo elijo yo, nunca pego texto del usuario en el sql
    let orden = "i.nombre ASC";
    if (req.query.orden === "recientes") {
      orden = "i.creado_en DESC";
    } else if (req.query.orden === "stack_desc") {
      orden = "i.stack_max DESC, i.nombre ASC";
    } else if (req.query.orden === "rareza") {
      orden = `CASE i.rareza WHEN 'Legendario' THEN 1 WHEN 'Épico' THEN 2
               WHEN 'Raro' THEN 3 WHEN 'Poco común' THEN 4 ELSE 5 END, i.nombre ASC`;
    }

    // si un filtro es null no filtra nada
    // ILIKE busca el texto sin importar mayusculas
    // los $1, $2... evitan inyeccion sql
    const resultado = await pool.query(
      `SELECT i.*, c.nombre AS categoria, c.slug AS categoria_slug, c.icono AS categoria_icono
       FROM items i
       INNER JOIN categorias c ON c.categoria_id = i.categoria_id
       WHERE ($1::text IS NULL
              OR i.nombre ILIKE '%' || $1 || '%'
              OR i.descripcion ILIKE '%' || $1 || '%'
              OR i.obtencion ILIKE '%' || $1 || '%')
         AND ($2::int IS NULL OR i.categoria_id = $2)
         AND ($3::text IS NULL OR i.rareza = $3)
         AND ($4::text IS NULL OR i.version = $4)
         AND ($5::boolean IS NULL OR i.destacado = $5)
       ORDER BY ${orden}`,
      [buscar, categoria, rareza, version, destacados]
    );

    // devuelvo cuantos son y la lista
    res.json({ total: resultado.rows.length, items: resultado.rows });
  } catch (error) {
    // si algo falla lo muestro en la consola y aviso al navegador
    console.log(error);
    res.status(500).json({ mensaje: "Error al buscar los ítems." });
  }
});

// GET /api/items/5 - un item por su id
router.get("/:id", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT i.*, c.nombre AS categoria, c.slug AS categoria_slug, c.icono AS categoria_icono
       FROM items i
       INNER JOIN categorias c ON c.categoria_id = i.categoria_id
       WHERE i.item_id = $1`,
      [req.params.id]
    );

    // si no encontro nada respondo 404
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "El ítem no existe." });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(400).json({ mensaje: "El id no es válido." });
  }
});

// POST /api/items - agregar un item nuevo
router.post("/", async (req, res) => {
  try {
    // saco los datos que mando el formulario
    const { nombre, descripcion, obtencion, categoria_id, rareza, version, icono } = req.body;
    // si no viene el stack uso 64
    const stack_max = req.body.stack_max || 64;
    const destacado = req.body.destacado === true;

    // reviso los datos antes de guardar
    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({ mensaje: "El nombre debe tener al menos 2 letras." });
    }
    if (!descripcion || descripcion.trim().length < 10) {
      return res.status(400).json({ mensaje: "La descripción debe tener al menos 10 letras." });
    }
    if (!obtencion || obtencion.trim().length < 5) {
      return res.status(400).json({ mensaje: "Escribe cómo se obtiene (mínimo 5 letras)." });
    }
    if (!categoria_id) {
      return res.status(400).json({ mensaje: "Elige una categoría." });
    }
    if (!rarezas.includes(rareza)) {
      return res.status(400).json({ mensaje: "Elige una rareza válida." });
    }
    if (!version) {
      return res.status(400).json({ mensaje: "Escribe la versión." });
    }
    if (stack_max < 1 || stack_max > 64) {
      return res.status(400).json({ mensaje: "El stack debe estar entre 1 y 64." });
    }

    // guardo el item y RETURNING me devuelve la fila creada
    const resultado = await pool.query(
      `INSERT INTO items (nombre, descripcion, obtencion, categoria_id, rareza, version, stack_max, icono, destacado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nombre.trim(), descripcion.trim(), obtencion.trim(), categoria_id, rareza,
        version.trim(), stack_max, icono || "diamond", destacado]
    );

    // 201 significa que se creo
    res.status(201).json({ mensaje: "Ítem agregado correctamente.", item: resultado.rows[0] });
  } catch (error) {
    console.log(error);
    // por ejemplo si la categoria no existe
    res.status(400).json({ mensaje: "No se pudo guardar el ítem, revisa los datos." });
  }
});

module.exports = router;
