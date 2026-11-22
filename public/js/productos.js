import { solicitar } from "./api.js";
import {
  crearTarjetaProducto,
  estadoStock,
  estiloCategoria,
  formatoCLP,
  limpiarAlerta,
  mostrarAlerta,
  mostrarEsqueletos
} from "./componentes.js";

const formFiltros = document.getElementById("formFiltros");
const inputBuscar = document.getElementById("buscar");
const selectCategoria = document.getElementById("categoria");
const inputPrecioMax = document.getElementById("precioMax");
const selectOrden = document.getElementById("orden");
const btnLimpiar = document.getElementById("btnLimpiar");
const contenedorProductos = document.getElementById("listaProductos");
const contadorResultados = document.getElementById("contadorResultados");
const resumenFiltros = document.getElementById("resumenFiltros");
const alertaProductos = document.getElementById("alertaProductos");

const formProducto = document.getElementById("formProducto");
const selectCategoriaProducto = document.getElementById("categoriaProducto");
const nombreProducto = document.getElementById("nombreProducto");
const precioProducto = document.getElementById("precioProducto");
const stockProducto = document.getElementById("stockProducto");
const descripcionProducto = document.getElementById("descripcionProducto");
const destacadoProducto = document.getElementById("destacadoProducto");
const contadorDescripcion = document.getElementById("contadorDescripcion");
const alertaFormulario = document.getElementById("alertaFormulario");
const btnGuardarProducto = document.getElementById("btnGuardarProducto");
const spinnerGuardar = document.getElementById("spinnerGuardar");
const textoGuardar = document.getElementById("textoGuardar");

const modalDetalle = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalDetalle"));
const modalAgregar = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalAgregar"));
const toastProducto = bootstrap.Toast.getOrCreateInstance(
  document.getElementById("toastProducto"),
  { delay: 4500 }
);

const parametrosIniciales = new URLSearchParams(window.location.search);

let categoriasCache = [];
let peticionActual = 0;
let temporizadorBusqueda;

function leerFiltros() {
  return {
    buscar: inputBuscar.value.trim(),
    categoria: selectCategoria.value,
    precioMax: inputPrecioMax.value,
    orden: selectOrden.value || "nombre"
  };
}

function actualizarUrl(filtros) {
  const parametros = new URLSearchParams();

  if (filtros.buscar) parametros.set("buscar", filtros.buscar);
  if (filtros.categoria) parametros.set("categoria", filtros.categoria);
  if (filtros.precioMax) parametros.set("precioMax", filtros.precioMax);
  if (filtros.orden && filtros.orden !== "nombre") parametros.set("orden", filtros.orden);

  const consulta = parametros.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${consulta ? `?${consulta}` : ""}`);
}

function llenarSelect(select, categorias, textoInicial) {
  const valorActual = select.value;
  select.replaceChildren();
  select.add(new Option(textoInicial, ""));

  categorias.forEach((categoria) => {
    select.add(
      new Option(`${categoria.nombre} (${categoria.total_productos})`, String(categoria.categoria_id))
    );
  });

  if (valorActual && [...select.options].some((opcion) => opcion.value === valorActual)) {
    select.value = valorActual;
  }
}

async function cargarCategorias() {
  const categorias = await solicitar("/categorias");
  categoriasCache = categorias;
  llenarSelect(selectCategoria, categorias, "Todas las categorías");
  llenarSelect(selectCategoriaProducto, categorias, "Selecciona una categoría");
}

function aplicarParametrosIniciales() {
  inputBuscar.value = parametrosIniciales.get("buscar") || "";
  inputPrecioMax.value = parametrosIniciales.get("precioMax") || "";

  const categoria = parametrosIniciales.get("categoria");
  if (categoria && [...selectCategoria.options].some((opcion) => opcion.value === categoria)) {
    selectCategoria.value = categoria;
  }

  const orden = parametrosIniciales.get("orden");
  if (orden && [...selectOrden.options].some((opcion) => opcion.value === orden)) {
    selectOrden.value = orden;
  }
}

function actualizarResumen(filtros) {
  const partes = [];

  if (filtros.buscar) partes.push(`texto “${filtros.buscar}”`);

  if (filtros.categoria) {
    const categoria = categoriasCache.find(
      (elemento) => String(elemento.categoria_id) === filtros.categoria
    );
    if (categoria) partes.push(`categoría ${categoria.nombre}`);
  }

  if (filtros.precioMax) {
    partes.push(`hasta ${formatoCLP.format(Number(filtros.precioMax))}`);
  }

  if (filtros.orden !== "nombre") {
    const etiqueta = selectOrden.selectedOptions[0]?.textContent || filtros.orden;
    partes.push(`orden: ${etiqueta}`);
  }

  resumenFiltros.textContent = partes.length
    ? `Filtros activos: ${partes.join(" · ")}`
    : "Mostrando todo el catálogo.";
}

function renderizarProductos(productos) {
  contenedorProductos.replaceChildren();

  if (productos.length === 0) {
    const columna = document.createElement("div");
    columna.className = "col-12";

    const vacio = document.createElement("div");
    vacio.className = "empty-state";

    const icono = document.createElement("i");
    icono.className = "bi bi-search fs-1 text-secondary";
    icono.setAttribute("aria-hidden", "true");

    const titulo = document.createElement("h3");
    titulo.className = "h5 mt-3";
    titulo.textContent = "No encontramos productos con esos filtros";

    const texto = document.createElement("p");
    texto.className = "text-secondary mb-0";
    texto.textContent = "Prueba con otra categoría, un precio mayor o limpia los filtros.";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-primary mt-3";
    boton.textContent = "Limpiar filtros";
    boton.addEventListener("click", limpiarFiltros);

    vacio.append(icono, titulo, texto, boton);
    columna.append(vacio);
    contenedorProductos.append(columna);
    return;
  }

  const fragmento = document.createDocumentFragment();
  productos.forEach((producto) => {
    fragmento.append(crearTarjetaProducto(producto, { alVer: abrirDetalle }));
  });
  contenedorProductos.append(fragmento);
}

async function cargarProductos() {
  const filtros = leerFiltros();
  const numeroPeticion = ++peticionActual;

  actualizarUrl(filtros);
  actualizarResumen(filtros);
  contenedorProductos.setAttribute("aria-busy", "true");
  contadorResultados.textContent = "Cargando…";
  mostrarEsqueletos(contenedorProductos, 6);
  limpiarAlerta(alertaProductos);

  const parametros = new URLSearchParams();
  if (filtros.buscar) parametros.set("buscar", filtros.buscar);
  if (filtros.categoria) parametros.set("categoria", filtros.categoria);
  if (filtros.precioMax) parametros.set("precioMax", filtros.precioMax);
  parametros.set("orden", filtros.orden);

  try {
    const datos = await solicitar(`/productos?${parametros.toString()}`);

    if (numeroPeticion !== peticionActual) return;

    renderizarProductos(datos.productos);
    contadorResultados.textContent = `${datos.total} producto${datos.total === 1 ? "" : "s"}`;
  } catch (error) {
    if (numeroPeticion !== peticionActual) return;

    contenedorProductos.replaceChildren();
    contadorResultados.textContent = "0 productos";
    mostrarAlerta(alertaProductos, "danger", error.message);
  } finally {
    if (numeroPeticion === peticionActual) {
      contenedorProductos.removeAttribute("aria-busy");
    }
  }
}

function limpiarFiltros() {
  formFiltros.reset();
  selectOrden.value = "nombre";
  cargarProductos();
}

function llenarDetalle(producto) {
  const estilo = estiloCategoria(producto.categoria_id);
  const stock = estadoStock(producto.stock);

  const visual = document.getElementById("detalleVisual");
  visual.className = `producto-visual rounded-3 flex-shrink-0 ${estilo.clase}`;
  document.getElementById("detalleIcono").className = `bi ${estilo.icono}`;
  document.getElementById("detalleCategoria").textContent = producto.categoria;
  document.getElementById("detalleNombre").textContent = producto.nombre;

  const etiquetaStock = document.getElementById("detalleStock");
  etiquetaStock.className = `badge ${stock.clase}`;
  etiquetaStock.textContent = stock.texto;

  document
    .getElementById("detalleDestacado")
    .classList.toggle("d-none", !producto.destacado);
  document.getElementById("detalleDescripcion").textContent = producto.descripcion;
  document.getElementById("detallePrecio").textContent = formatoCLP.format(producto.precio);
  document.getElementById("detalleId").textContent = `#${String(producto.producto_id).padStart(4, "0")}`;

  document.getElementById("btnConsultarProducto").href =
    `/contacto.html?producto=${encodeURIComponent(producto.nombre)}`;
}

async function abrirDetalle(productoResumen) {
  try {
    const producto = await solicitar(`/productos/${productoResumen.producto_id}`);
    llenarDetalle(producto);
    modalDetalle.show();
  } catch (error) {
    mostrarAlerta(alertaProductos, "danger", error.message);
  }
}

function actualizarContadorDescripcion() {
  contadorDescripcion.textContent = String(descripcionProducto.value.length);
}

function bloquearFormulario(bloqueado) {
  btnGuardarProducto.disabled = bloqueado;
  spinnerGuardar.classList.toggle("d-none", !bloqueado);
  textoGuardar.textContent = bloqueado ? "Guardando…" : "Guardar producto";
}

function mostrarToast(mensaje) {
  document.getElementById("toastProductoTexto").textContent = mensaje;
  toastProducto.show();
}

formFiltros.addEventListener("submit", (evento) => {
  evento.preventDefault();
  cargarProductos();
});

inputBuscar.addEventListener("input", () => {
  window.clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = window.setTimeout(cargarProductos, 350);
});

selectCategoria.addEventListener("change", cargarProductos);
selectOrden.addEventListener("change", cargarProductos);
inputPrecioMax.addEventListener("change", cargarProductos);
btnLimpiar.addEventListener("click", limpiarFiltros);

descripcionProducto.addEventListener("input", actualizarContadorDescripcion);

formProducto.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  evento.stopPropagation();
  formProducto.classList.add("was-validated");

  if (!formProducto.checkValidity()) {
    return;
  }

  const datos = {
    nombre: nombreProducto.value.trim(),
    descripcion: descripcionProducto.value.trim(),
    precio: Number(precioProducto.value),
    stock: Number(stockProducto.value),
    categoria_id: Number(selectCategoriaProducto.value),
    destacado: destacadoProducto.checked
  };

  bloquearFormulario(true);
  limpiarAlerta(alertaFormulario);

  try {
    const respuesta = await solicitar("/productos", {
      method: "POST",
      body: JSON.stringify(datos)
    });

    modalAgregar.hide();
    formProducto.reset();
    formProducto.classList.remove("was-validated");
    actualizarContadorDescripcion();

    await cargarCategorias();
    await cargarProductos();

    mostrarToast(`Se agregó “${respuesta.producto.nombre}” al catálogo.`);
  } catch (error) {
    mostrarAlerta(alertaFormulario, "danger", error.message);
  } finally {
    bloquearFormulario(false);
  }
});

document.getElementById("modalAgregar").addEventListener("hidden.bs.modal", () => {
  limpiarAlerta(alertaFormulario);
});

async function iniciar() {
  actualizarContadorDescripcion();
  mostrarEsqueletos(contenedorProductos, 6);

  try {
    await cargarCategorias();
  } catch (error) {
    mostrarAlerta(alertaProductos, "danger", error.message);
  }

  aplicarParametrosIniciales();
  await cargarProductos();
}

iniciar();
