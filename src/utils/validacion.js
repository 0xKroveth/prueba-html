const { ErrorHttp } = require("./http");

/**
 * Valida y normaliza un texto.
 */
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

/**
 * Valida un número entero dentro de un rango.
 */
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

/**
 * Valida un número decimal y lo redondea a dos decimales.
 */
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

/**
 * Valida un correo electrónico con un formato básico.
 */
function correo(valor, campo = "email") {
  const limpio = texto(valor, campo, { min: 5, max: 120 });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio)) {
    throw new ErrorHttp(400, `El campo "${campo}" no tiene un formato válido.`);
  }

  return limpio.toLowerCase();
}

/**
 * Normaliza valores provenientes de formularios o JSON.
 */
function booleano(valor) {
  return valor === true || valor === 1 || valor === "1" || valor === "true" || valor === "on";
}

module.exports = { texto, entero, decimal, correo, booleano };
