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

  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < min || numero > max) {
    throw new ErrorHttp(
      400,
      `El campo "${campo}" debe ser un número entero entre ${min} y ${max}.`
    );
  }

  return numero;
}

// valida un numero decimal y lo redondea a 2 decimales
function decimal(valor, campo, { min = 0, max = Number.MAX_SAFE_INTEGER, obligatorio = true } = {}) {
  if (valor === undefined || valor === null || valor === "") {
    if (!obligatorio) return null;
    throw new ErrorHttp(400, `El campo "${campo}" es obligatorio.`);
  }

  const numero = Number(String(valor).replace(",", "."));

  if (!Number.isFinite(numero) || numero < min || numero > max) {
    throw new ErrorHttp(
      400,
      `El campo "${campo}" debe ser un número entre ${min} y ${max}.`
    );
  }

  return Math.round(numero * 100) / 100;
}

// valida un correo basico
function correo(valor, campo = "email") {
  const limpio = texto(valor, campo, { min: 5, max: 120 });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio)) {
    throw new ErrorHttp(400, `El campo "${campo}" no tiene un formato válido.`);
  }

  return limpio.toLowerCase();
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

module.exports = { texto, entero, decimal, correo, opcion, booleano };
