import { solicitar } from "./api.js";
import {
  claseRareza,
  crearTarjetaItem,
  limpiarAlerta,
  mostrarAlerta,
  mostrarEsqueletos
} from "./componentes.js";

const formFiltros = document.getElementById("formFiltros");
const inputBuscar = document.getElementById("buscar");
const selectCategoria = document.getElementById("categoria");
const selectRareza = document.getElementById("rareza");
const selectVersion = document.getElementById("version");
const selectOrden = document.getElementById("orden");
const btnLimpiar = document.getElementById("btnLimpiar");
const contenedorItems = document.getElementById("listaItems");
const contadorResultados = document.getElementById("contadorResultados");
const resumenFiltros = document.getElementById("resumenFiltros");
const alertaItems = document.getElementById("alertaItems");

const formItem = document.getElementById("formItem");
const nombreItem = document.getElementById("nombreItem");
const categoriaItem = document.getElementById("categoriaItem");
const rarezaItem = document.getElementById("rarezaItem");
const versionItem = document.getElementById("versionItem");
const stackItem = document.getElementById("stackItem");
const iconoItem = document.getElementById("iconoItem");
const obtencionItem = document.getElementById("obtencionItem");
const descripcionItem = document.getElementById("descripcionItem");
const destacadoItem = document.getElementById("destacadoItem");
const contadorDescripcionItem = document.getElementById("contadorDescripcionItem");
const alertaFormularioItem = document.getElementById("alertaFormularioItem");
const btnGuardarItem = document.getElementById("btnGuardarItem");
const spinnerGuardarItem = document.getElementById("spinnerGuardarItem");
const textoGuardarItem = document.getElementById("textoGuardarItem");

const modalDetalleItem = bootstrap.Modal.getOrCreateInstance(
  document.getElementById("modalDetalleItem")
);
const modalAgregarItem = bootstrap.Modal.getOrCreateInstance(
  document.getElementById("modalAgregarItem")
);
const toastItem = bootstrap.Toast.getOrCreateInstance(document.getElementById("toastItem"), {
  delay: 4500
});

const parametrosIniciales = new URLSearchParams(window.location.search);

let meta = { categorias: [], versiones: [], rarezas: [] };
let peticionActual = 0;
let temporizadorBusqueda;

function leerFiltros() {
  return {
    buscar: inputBuscar.value.trim(),
    categoria: selectCategoria.value,
    rareza: selectRareza.value,
    version: selectVersion.value,
    orden: selectOrden.value || "nombre"
  };
}

function actualizarUrl(filtros) {
  const parametros = new URLSearchParams();

  if (filtros.buscar) parametros.set("buscar", filtros.buscar);
  if (filtros.categoria) parametros.set("categoria", filtros.categoria);
  if (filtros.rareza) parametros.set("rareza", filtros.rareza);
  if (filtros.version) parametros.set("version", filtros.version);
  if (filtros.orden && filtros.orden !== "nombre") parametros.set("orden", filtros.orden);

  const consulta = parametros.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${consulta ? `?${consulta}` : ""}`);
}

function llenarSelect(select, opciones, textoInicial) {
  const valorActual = select.value;
  select.replaceChildren();
  select.add(new Option(textoInicial, ""));

  opciones.forEach(({ valor, texto }) => {
    select.add(new Option(texto, String(valor)));
  });

  if (valorActual && [...select.options].some((opcion) => opcion.value === valorActual)) {
    select.value = valorActual;
  }
}

async function cargarMeta() {
  meta = await solicitar("/meta");

  llenarSelect(
    selectCategoria,
    meta.categorias.map((categoria) => ({
      valor: categoria.categoria_id,
      texto: `${categoria.icono} ${categoria.nombre} (${categoria.total_items})`
    })),
    "Todas las categorías"
  );

  llenarSelect(
    selectRareza,
    meta.rarezas.map((rareza) => ({ valor: rareza, texto: rareza })),
    "Todas las rarezas"
  );

  llenarSelect(
    selectVersion,
    meta.versiones.map((version) => ({ valor: version, texto: `Versión ${version}` })),
    "Todas las versiones"
  );

  llenarSelect(
    categoriaItem,
    meta.categorias.map((categoria) => ({
      valor: categoria.categoria_id,
      texto: `${categoria.icono} ${categoria.nombre}`
    })),
    "Selecciona una categoría"
  );

  llenarSelect(
    rarezaItem,
    meta.rarezas.map((rareza) => ({ valor: rareza, texto: rareza })),
    "Selecciona una rareza"
  );

  const listaVersiones = document.getElementById("listaVersiones");
  listaVersiones.replaceChildren();
  meta.versiones.forEach((version) => {
    listaVersiones.append(new Option(`Versión ${version}`, version));
  });
}

function aplicarParametrosIniciales() {
  inputBuscar.value = parametrosIniciales.get("buscar") || "";

  const categoria = parametrosIniciales.get("categoria");
  if (categoria && [...selectCategoria.options].some((opcion) => opcion.value === categoria)) {
    selectCategoria.value = categoria;
  }

  const rareza = parametrosIniciales.get("rareza");
  if (rareza && [...selectRareza.options].some((opcion) => opcion.value === rareza)) {
    selectRareza.value = rareza;
  }

  const version = parametrosIniciales.get("version");
  if (version && [...selectVersion.options].some((opcion) => opcion.value === version)) {
    selectVersion.value = version;
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
    const categoria = meta.categorias.find(
      (elemento) => String(elemento.categoria_id) === filtros.categoria
    );
    if (categoria) partes.push(`categoría ${categoria.nombre}`);
  }

  if (filtros.rareza) partes.push(`rareza ${filtros.rareza}`);
  if (filtros.version) partes.push(`versión ${filtros.version}`);

  if (filtros.orden !== "nombre") {
    const etiqueta = selectOrden.selectedOptions[0]?.textContent || filtros.orden;
    partes.push(`orden: ${etiqueta}`);
  }

  resumenFiltros.textContent = partes.length
    ? `Filtros activos: ${partes.join(" · ")}`
    : "Mostrando toda la enciclopedia.";
}

function renderizarItems(items) {
  contenedorItems.replaceChildren();

  if (items.length === 0) {
    const columna = document.createElement("div");
    columna.className = "col-12";

    const vacio = document.createElement("div");
    vacio.className = "empty-state";

    const icono = document.createElement("div");
    icono.className = "fs-1 emoji";
    icono.textContent = "🧱";
    icono.setAttribute("aria-hidden", "true");

    const titulo = document.createElement("h3");
    titulo.className = "h5 mt-3";
    titulo.textContent = "No encontramos ítems con esos filtros";

    const texto = document.createElement("p");
    texto.className = "text-secondary mb-0";
    texto.textContent = "Prueba con otra categoría, rareza o versión, o limpia los filtros.";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-cp mt-3";
    boton.textContent = "Limpiar filtros";
    boton.addEventListener("click", limpiarFiltros);

    vacio.append(icono, titulo, texto, boton);
    columna.append(vacio);
    contenedorItems.append(columna);
    return;
  }

  const fragmento = document.createDocumentFragment();
  items.forEach((item) => {
    fragmento.append(crearTarjetaItem(item, { alVer: abrirDetalle }));
  });
  contenedorItems.append(fragmento);
}

async function cargarItems() {
  const filtros = leerFiltros();
  const numeroPeticion = ++peticionActual;

  actualizarUrl(filtros);
  actualizarResumen(filtros);
  contenedorItems.setAttribute("aria-busy", "true");
  contadorResultados.textContent = "Cargando…";
  mostrarEsqueletos(contenedorItems, 6, "330px");
  limpiarAlerta(alertaItems);

  const parametros = new URLSearchParams();
  if (filtros.buscar) parametros.set("buscar", filtros.buscar);
  if (filtros.categoria) parametros.set("categoria", filtros.categoria);
  if (filtros.rareza) parametros.set("rareza", filtros.rareza);
  if (filtros.version) parametros.set("version", filtros.version);
  parametros.set("orden", filtros.orden);

  try {
    const datos = await solicitar(`/items?${parametros.toString()}`);

    if (numeroPeticion !== peticionActual) return;

    renderizarItems(datos.items);
    contadorResultados.textContent = `${datos.total} ítem${datos.total === 1 ? "" : "s"}`;
  } catch (error) {
    if (numeroPeticion !== peticionActual) return;

    contenedorItems.replaceChildren();
    contadorResultados.textContent = "0 ítems";
    mostrarAlerta(alertaItems, "danger", error.message);
  } finally {
    if (numeroPeticion === peticionActual) {
      contenedorItems.removeAttribute("aria-busy");
    }
  }
}

function limpiarFiltros() {
  formFiltros.reset();
  selectOrden.value = "nombre";
  cargarItems();
}

function llenarDetalle(item) {
  const visual = document.getElementById("detalleItemVisual");
  visual.className = `item-visual item-visual--${item.categoria_slug || "bloques"}`;
  document.getElementById("detalleItemIcono").textContent = item.icono;

  document.getElementById("detalleItemCategoria").textContent =
    `${item.categoria_icono} ${item.categoria}`;
  document.getElementById("detalleItemNombre").textContent = item.nombre;

  const rareza = document.getElementById("detalleItemRareza");
  rareza.className = `rareza ${claseRareza(item.rareza)}`;
  rareza.textContent = item.rareza;

  document.getElementById("detalleItemVersion").textContent = `v${item.version}`;
  document.getElementById("detalleItemStack").textContent = `Stack máximo: ${item.stack_max}`;
  document.getElementById("detalleItemDescripcion").textContent = item.descripcion;
  document.getElementById("detalleItemObtencion").textContent = item.obtencion;
  document
    .getElementById("detalleItemDestacado")
    .classList.toggle("d-none", !item.destacado);

  document.getElementById("btnConsultarItem").href =
    `/contacto.html?item=${encodeURIComponent(item.nombre)}`;
}

async function abrirDetalle(itemResumen) {
  try {
    const item = await solicitar(`/items/${itemResumen.item_id}`);
    llenarDetalle(item);
    modalDetalleItem.show();
  } catch (error) {
    mostrarAlerta(alertaItems, "danger", error.message);
  }
}

function actualizarContadorDescripcion() {
  contadorDescripcionItem.textContent = String(descripcionItem.value.length);
}

function bloquearFormulario(bloqueado) {
  btnGuardarItem.disabled = bloqueado;
  spinnerGuardarItem.classList.toggle("d-none", !bloqueado);
  textoGuardarItem.textContent = bloqueado ? "Guardando…" : "Guardar ítem";
}

function mostrarToast(mensaje) {
  document.getElementById("toastItemTexto").textContent = mensaje;
  toastItem.show();
}

formFiltros.addEventListener("submit", (evento) => {
  evento.preventDefault();
  cargarItems();
});

inputBuscar.addEventListener("input", () => {
  window.clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = window.setTimeout(cargarItems, 350);
});

selectCategoria.addEventListener("change", cargarItems);
selectRareza.addEventListener("change", cargarItems);
selectVersion.addEventListener("change", cargarItems);
selectOrden.addEventListener("change", cargarItems);
btnLimpiar.addEventListener("click", limpiarFiltros);

descripcionItem.addEventListener("input", actualizarContadorDescripcion);

document.querySelectorAll("[data-icono]").forEach((boton) => {
  boton.addEventListener("click", () => {
    iconoItem.value = boton.dataset.icono;
    iconoItem.focus();
  });
});

formItem.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  evento.stopPropagation();
  formItem.classList.add("was-validated");

  if (!formItem.checkValidity()) {
    return;
  }

  const datos = {
    nombre: nombreItem.value.trim(),
    descripcion: descripcionItem.value.trim(),
    obtencion: obtencionItem.value.trim(),
    categoria_id: Number(categoriaItem.value),
    rareza: rarezaItem.value,
    version: versionItem.value.trim(),
    stack_max: Number(stackItem.value),
    icono: iconoItem.value.trim() || "🧱",
    destacado: destacadoItem.checked
  };

  bloquearFormulario(true);
  limpiarAlerta(alertaFormularioItem);

  try {
    const respuesta = await solicitar("/items", {
      method: "POST",
      body: JSON.stringify(datos)
    });

    modalAgregarItem.hide();
    formItem.reset();
    formItem.classList.remove("was-validated");
    actualizarContadorDescripcion();

    await cargarMeta();
    await cargarItems();

    mostrarToast(`Se agregó “${respuesta.item.nombre}” a la enciclopedia.`);
  } catch (error) {
    mostrarAlerta(alertaFormularioItem, "danger", error.message);
  } finally {
    bloquearFormulario(false);
  }
});

document.getElementById("modalAgregarItem").addEventListener("hidden.bs.modal", () => {
  limpiarAlerta(alertaFormularioItem);
});

async function iniciar() {
  actualizarContadorDescripcion();
  mostrarEsqueletos(contenedorItems, 6, "330px");

  try {
    await cargarMeta();
  } catch (error) {
    mostrarAlerta(alertaItems, "danger", error.message);
  }

  aplicarParametrosIniciales();
  await cargarItems();
}

iniciar();
