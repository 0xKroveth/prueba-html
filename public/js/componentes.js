export const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
});

const ESTILOS_CATEGORIA = {
  1: { icono: "bi-laptop", clase: "producto-visual--1" },
  2: { icono: "bi-phone", clase: "producto-visual--2" },
  3: { icono: "bi-headphones", clase: "producto-visual--3" },
  4: { icono: "bi-router", clase: "producto-visual--4" }
};

export function estiloCategoria(categoriaId) {
  return ESTILOS_CATEGORIA[categoriaId] || { icono: "bi-box-seam", clase: "" };
}

export function estadoStock(stock) {
  if (stock <= 0) {
    return { texto: "Agotado", clase: "stock-agotado" };
  }
  if (stock <= 5) {
    return { texto: `Últimas ${stock} unidades`, clase: "stock-bajo" };
  }
  return { texto: `Disponible (${stock})`, clase: "stock-ok" };
}

/**
 * Crea una tarjeta de producto usando DOM seguro (sin inyectar datos como HTML).
 */
export function crearTarjetaProducto(producto, { alVer = null } = {}) {
  const columna = document.createElement("div");
  columna.className = "col-sm-6 col-xl-4";

  const tarjeta = document.createElement("article");
  tarjeta.className = "card card-producto h-100";

  const estilo = estiloCategoria(producto.categoria_id);
  const visual = document.createElement("div");
  visual.className = `producto-visual ${estilo.clase}`;

  const icono = document.createElement("i");
  icono.className = `bi ${estilo.icono}`;
  icono.setAttribute("aria-hidden", "true");
  visual.append(icono);

  if (producto.destacado) {
    const destacado = document.createElement("span");
    destacado.className = "badge badge-destacado";
    destacado.textContent = "Destacado";
    visual.append(destacado);
  }

  const categoria = document.createElement("span");
  categoria.className = "badge badge-categoria";
  categoria.textContent = producto.categoria;
  visual.append(categoria);

  const cuerpo = document.createElement("div");
  cuerpo.className = "card-body d-flex flex-column";

  const stock = estadoStock(producto.stock);
  const filaStock = document.createElement("div");
  filaStock.className = "d-flex justify-content-between align-items-center mb-2";

  const etiquetaStock = document.createElement("span");
  etiquetaStock.className = `badge ${stock.clase}`;
  etiquetaStock.textContent = stock.texto;
  filaStock.append(etiquetaStock);

  const titulo = document.createElement("h3");
  titulo.className = "h5 card-title mb-2";
  titulo.textContent = producto.nombre;

  const descripcion = document.createElement("p");
  descripcion.className = "card-text text-secondary small flex-grow-1 descripcion-corta";
  descripcion.textContent = producto.descripcion;

  const pie = document.createElement("div");
  pie.className = "d-flex justify-content-between align-items-center gap-2 mt-3";

  const precio = document.createElement("span");
  precio.className = "precio";
  precio.textContent = formatoCLP.format(producto.precio);
  pie.append(precio);

  if (typeof alVer === "function") {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-sm btn-outline-primary";
    boton.textContent = "Ver detalle";
    boton.addEventListener("click", () => alVer(producto));
    pie.append(boton);
  } else {
    const enlace = document.createElement("a");
    enlace.className = "btn btn-sm btn-outline-primary";
    enlace.href = "/productos.html";
    enlace.textContent = "Ver catálogo";
    pie.append(enlace);
  }

  cuerpo.append(filaStock, titulo, descripcion, pie);
  tarjeta.append(visual, cuerpo);
  columna.append(tarjeta);

  return columna;
}

export function mostrarEsqueletos(contenedor, cantidad = 6) {
  contenedor.replaceChildren();

  for (let indice = 0; indice < cantidad; indice += 1) {
    const columna = document.createElement("div");
    columna.className = "col-sm-6 col-xl-4";

    const bloque = document.createElement("div");
    bloque.className = "skeleton";
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
