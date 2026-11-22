const { Router } = require("express");
const { consultar } = require("../db");
const { asyncHandler } = require("../utils/http");
const { texto, correo } = require("../utils/validacion");

const router = Router();

/** POST /api/contacto: guarda un mensaje enviado desde el formulario. */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const datos = req.body ?? {};

    const mensaje = {
      nombre: texto(datos.nombre, "nombre", { min: 2, max: 80 }),
      email: correo(datos.email),
      asunto: texto(datos.asunto, "asunto", { min: 3, max: 120 }),
      mensaje: texto(datos.mensaje, "mensaje", { min: 10, max: 1000 })
    };

    const insertados = await consultar(
      `INSERT INTO mensajes_contacto (nombre, email, asunto, mensaje)
       VALUES ($1, $2, $3, $4)
       RETURNING mensaje_id, creado_en`,
      [mensaje.nombre, mensaje.email, mensaje.asunto, mensaje.mensaje]
    );

    res.status(201).json({
      mensaje: "Tu mensaje fue enviado correctamente. ¡Gracias por aportar a la comunidad!",
      registro: insertados[0]
    });
  })
);

module.exports = router;
