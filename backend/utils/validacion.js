// funciones de validacion para los datos que llegan al backend

const { ErrorHttp } = require("./http");

// valida que sea texto y que tenga el largo correcto
function texto(valor, campo, { min = 1, max = 255, obligatorio = true } = {}) {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    if (!obligatorio) return "";
    throw new ErrorHttp(400, `El campo "${campo}" es obligatorio.`);
  }

  if (typeof valor !== "string") {
    throw new ErrorHttp(400, `El campo "${campo}" debe ser texto.`);
  }

  // quito espacios al inicio y al final antes de medir el largo
  const limpio = valor.trim();

  if (limpio.length < min || limpio.length > max) {
    throw new ErrorHttp(
      400,
      `El campo "${campo}" debe tener entre ${min} y ${max} caracteres.`
    );
  }

  return limpio;
}

// valida que sea un numero entero dentro de un rango
function entero(valor, campo, { min = 0, max = Number.MAX_SAFE_INTEGER, obligatorio = true } = {}) {
  if (valor === undefined || valor === null || valor === "") {
    if (!obligatorio) return null;
    throw new ErrorHttp(400, `El campo "${campo}" es obligatorio.`);
  }

  // Number("abc") da NaN y Number("2.5") no es entero, ambos se rechazan
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < min || numero > max) {
    throw new ErrorHttp(
      400,
      `El campo "${campo}" debe ser un número entero entre ${min} y ${max}.`
    );
  }

  return numero;
}

// valida que el valor este en la lista de opciones permitidas
function opcion(valor, campo, permitidos) {
  const limpio = texto(valor, campo, { min: 1, max: 40 });

  if (!permitidos.includes(limpio)) {
    throw new ErrorHttp(
      400,
      `El campo "${campo}" debe ser uno de: ${permitidos.join(", ")}.`
    );
  }

  return limpio;
}

// convierte valores tipo "true", "1", "on" a booleano
function booleano(valor) {
  return valor === true || valor === 1 || valor === "1" || valor === "true" || valor === "on";
}

module.exports = { texto, entero, opcion, booleano };
