const BASE_URL = "/api";

export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
  }
}

/**
 * Realiza una petición a la API y normaliza los errores.
 * @param {string} ruta Ruta relativa, por ejemplo "/items".
 * @param {RequestInit} opciones Opciones de fetch.
 */
export async function solicitar(ruta, opciones = {}) {
  const configuracion = {
    ...opciones,
    headers: {
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(opciones.headers || {})
    }
  };

  let respuesta;

  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, configuracion);
  } catch {
    throw new ErrorApi(
      "No fue posible comunicarse con el servidor. Verifica que el backend esté en ejecución.",
      0
    );
  }

  const tipoContenido = respuesta.headers.get("content-type") || "";
  const datos = tipoContenido.includes("application/json") ? await respuesta.json() : null;

  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.mensaje || `La solicitud falló con el código ${respuesta.status}.`,
      respuesta.status
    );
  }

  return datos;
}
