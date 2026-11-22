export const formatoNumero = new Intl.NumberFormat("es-CL");

const CLASES_RAREZA = {
  "Común": "rareza--comun",
  "Poco común": "rareza--poco-comun",
  "Raro": "rareza--raro",
  "Épico": "rareza--epico",
  "Legendario": "rareza--legendario"
};

const CLASES_DIFICULTAD = {
  Principiante: "dificultad--principiante",
  Intermedio: "dificultad--intermedio",
  Avanzado: "dificultad--avanzado"
};

export function claseRareza(rareza) {
  return CLASES_RAREZA[rareza] || "rareza--comun";
}

export function claseDificultad(dificultad) {
  return CLASES_DIFICULTAD[dificultad] || "dificultad--principiante";
}

/**
 * Crea una tarjeta de ítem usando DOM seguro (sin inyectar datos como HTML).
 */
export function crearTarjetaItem(item, { alVer = null } = {}) {
  const columna = document.createElement("div");
  columna.className = "col-sm-6 col-xl-4";

  const tarjeta = document.createElement("article");
  tarjeta.className = "cp-card item-card h-100";

  const visual = document.createElement("div");
  visual.className = `item-visual item-visual--${item.categoria_slug || "bloques"}`;

  const icono = document.createElement("span");
  icono.textContent = item.icono;
  icono.setAttribute("aria-hidden", "true");
  visual.append(icono);

  if (item.destacado) {
    const destacado = document.createElement("span");
    destacado.className = "badge-destacado";
    destacado.textContent = "Destacado";
    visual.append(destacado);
  }

  const categoria = document.createElement("span");
  categoria.className = "badge-categoria";
  categoria.textContent = `${item.categoria_icono} ${item.categoria}`;
  visual.append(categoria);

  const cuerpo = document.createElement("div");
  cuerpo.className = "card-body d-flex flex-column";

  const filaSuperior = document.createElement("div");
  filaSuperior.className = "d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2";

  const rareza = document.createElement("span");
  rareza.className = `rareza ${claseRareza(item.rareza)}`;
  rareza.textContent = item.rareza;

  const stack = document.createElement("span");
  stack.className = "item-meta";
  stack.textContent = `Stack: ${item.stack_max}`;
  filaSuperior.append(rareza, stack);

  const titulo = document.createElement("h3");
  titulo.className = "card-title mb-2";
  titulo.textContent = item.nombre;

  const descripcion = document.createElement("p");
  descripcion.className = "text-secondary small flex-grow-1 descripcion-corta mb-2";
  descripcion.textContent = item.descripcion;

  const meta = document.createElement("div");
  meta.className = "item-meta mb-3";
  meta.textContent = `Versión ${item.version}`;

  const pie = document.createElement("div");
  pie.className = "d-flex justify-content-between align-items-center gap-2 mt-auto";

  const version = document.createElement("span");
  version.className = "badge text-bg-light border";
  version.textContent = `v${item.version}`;
  pie.append(version);

  if (typeof alVer === "function") {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-sm btn-cp-outline";
    boton.textContent = "Ver ficha";
    boton.addEventListener("click", () => alVer(item));
    pie.append(boton);
  } else {
    const enlace = document.createElement("a");
    enlace.className = "btn btn-sm btn-cp-outline";
    enlace.href = "/items.html";
    enlace.textContent = "Ver ficha";
    pie.append(enlace);
  }

  cuerpo.append(filaSuperior, titulo, descripcion, meta, pie);
  tarjeta.append(visual, cuerpo);
  columna.append(tarjeta);

  return columna;
}

/**
 * Crea una tarjeta de guía.
 */
export function crearTarjetaGuia(guia, { alVer = null } = {}) {
  const columna = document.createElement("div");
  columna.className = "col-lg-6";

  const tarjeta = document.createElement("article");
  tarjeta.className = "cp-card guia-card h-100";

  const icono = document.createElement("div");
  icono.className = "guia-icon";
  icono.textContent = guia.icono;
  icono.setAttribute("aria-hidden", "true");

  const contenido = document.createElement("div");
  contenido.className = "flex-grow-1 d-flex flex-column";

  const filaBadges = document.createElement("div");
  filaBadges.className = "d-flex flex-wrap align-items-center gap-2 mb-2";

  const dificultad = document.createElement("span");
  dificultad.className = `dificultad ${claseDificultad(guia.dificultad)}`;
  dificultad.textContent = guia.dificultad;
  filaBadges.append(dificultad);

  const tema = document.createElement("span");
  tema.className = "badge text-bg-light border";
  tema.textContent = guia.tema;
  filaBadges.append(tema);

  if (guia.destacada) {
    const destacada = document.createElement("span");
    destacada.className = "badge text-bg-warning";
    destacada.textContent = "Destacada";
    filaBadges.append(destacada);
  }

  const titulo = document.createElement("h3");
  titulo.className = "card-title mb-2";
  titulo.textContent = guia.titulo;

  const resumen = document.createElement("p");
  resumen.className = "text-secondary small flex-grow-1 mb-3";
  resumen.textContent = guia.resumen;

  const pie = document.createElement("div");
  pie.className = "d-flex flex-wrap justify-content-between align-items-center gap-2 mt-auto";

  const meta = document.createElement("div");
  meta.className = "guia-meta";

  const reloj = document.createElement("i");
  reloj.className = "bi bi-clock";
  reloj.setAttribute("aria-hidden", "true");

  const textoMeta = document.createElement("span");
  textoMeta.textContent = `${guia.duracion} · v${guia.version}`;

  meta.append(reloj, textoMeta);

  if (typeof alVer === "function") {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-sm btn-cp";
    boton.textContent = "Leer guía";
    boton.addEventListener("click", () => alVer(guia));
    pie.append(meta, boton);
  } else {
    const enlace = document.createElement("a");
    enlace.className = "btn btn-sm btn-cp";
    enlace.href = "/guias.html";
    enlace.textContent = "Leer guía";
    pie.append(meta, enlace);
  }

  contenido.append(filaBadges, titulo, resumen, pie);
  tarjeta.append(icono, contenido);
  columna.append(tarjeta);

  return columna;
}

export function mostrarEsqueletos(
  contenedor,
  cantidad = 6,
  altura = "320px",
  claseColumna = "col-sm-6 col-xl-4"
) {
  contenedor.replaceChildren();

  for (let indice = 0; indice < cantidad; indice += 1) {
    const columna = document.createElement("div");
    columna.className = claseColumna;

    const bloque = document.createElement("div");
    bloque.className = "skeleton";
    bloque.style.minHeight = altura;
    bloque.setAttribute("aria-hidden", "true");

    columna.append(bloque);
    contenedor.append(columna);
  }
}

export function mostrarAlerta(contenedor, tipo, mensaje) {
  contenedor.replaceChildren();

  const alerta = document.createElement("div");
  alerta.className = `alert alert-${tipo} d-flex align-items-start gap-2`;
  alerta.setAttribute("role", tipo === "danger" ? "alert" : "status");

  const icono = document.createElement("i");
  icono.className = `bi ${
    tipo === "danger" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"
  }`;
  icono.setAttribute("aria-hidden", "true");

  const texto = document.createElement("span");
  texto.textContent = mensaje;

  alerta.append(icono, texto);
  contenedor.append(alerta);
}

export function limpiarAlerta(contenedor) {
  contenedor.replaceChildren();
}
