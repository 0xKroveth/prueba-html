// utilidades para manejar errores http

// error con codigo de estado, lo uso para devolver errores al cliente
class ErrorHttp extends Error {
  constructor(estado, mensaje, detalles = undefined) {
    super(mensaje);
    this.name = "ErrorHttp";
    this.estado = estado;
    this.detalles = detalles;
  }
}

// envuelve funciones async para que los errores lleguen al middleware de express
function asyncHandler(controlador) {
  return (req, res, next) => {
    // si la funcion falla, paso el error a next() y lo responde el manejador de server.js
    Promise.resolve(controlador(req, res, next)).catch(next);
  };
}

module.exports = { ErrorHttp, asyncHandler };
