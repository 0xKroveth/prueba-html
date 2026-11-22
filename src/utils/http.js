/** Error controlado que se traduce en una respuesta HTTP concreta. */
class ErrorHttp extends Error {
  constructor(estado, mensaje, detalles = undefined) {
    super(mensaje);
    this.name = "ErrorHttp";
    this.estado = estado;
    this.detalles = detalles;
  }
}

/** Envuelve controladores async para que los errores lleguen al middleware. */
function asyncHandler(controlador) {
  return (req, res, next) => {
    Promise.resolve(controlador(req, res, next)).catch(next);
  };
}

module.exports = { ErrorHttp, asyncHandler };
