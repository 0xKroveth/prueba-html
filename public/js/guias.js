import { solicitar } from "./api.js";
import {
  claseDificultad,
  crearTarjetaGuia,
  limpiarAlerta,
  mostrarAlerta,
  mostrarEsqueletos
} from "./componentes.js";

const formFiltros = document.getElementById("formFiltrosGuias");
const inputBuscar = document.getElementById("buscarGuia");
const selectDificultad = document.getElementById("dificultadGuia");
const selectTema = document.getElementById("temaGuia");
const selectOrden = document.getElementById("ordenGuia");
const btnLimpiar = document.getElementById("btnLimpiarGuias");
const contenedorGuias = document.getElementById("listaGuias");
const contadorGuias = document.getElementById("contadorGuias");
const resumenFiltros = document.getElementById("resumenFiltrosGuias");
const alertaGuias = document.getElementById("alertaGuias");

const modalDetalle = bootstrap.Modal.getOrCreateInstance(
  document.getElementById("modalDetalleGuia")
);

const parametrosIniciales = new URLSearchParams(window.location.search);

let meta = { dificultades: [], temas: [] };
let peticionActual = 0;
let temporizadorBusqueda;

function llenarSelect(select, opciones, textoInicial) {
  const valorActual = select.value;
  select.replaceChildren();
  select.add(new Option(textoInicial, ""));

  opciones.forEach((opcion) => {
    select.add(new Option(opcion, opcion));
  });

  if (valorActual && [...select.options].some((opcion) => opcion.value === valorActual)) {
    select.value = valorActual;
  }
}

async function cargarMeta() {
  meta = await solicitar("/meta");
  llenarSelect(selectDificultad, meta.dificultades, "Todas las dificultades");
  llenarSelect(selectTema, meta.temas, "Todos los temas");
}

function aplicarParametrosIniciales() {
  inputBuscar.value = parametrosIniciales.get("buscar") || "";

  const dificultad = parametrosIniciales.get("dificultad");
  if (dificultad && [...selectDificultad.options].some((opcion) => opcion.value === dificultad)) {
    selectDificultad.value = dificultad;
  }

  const tema = parametrosIniciales.get("tema");
  if (tema && [...selectTema.options].some((opcion) => opcion.value === tema)) {
    selectTema.value = tema;
  }

  const orden = parametrosIniciales.get("orden");
  if (orden && [...selectOrden.options].some((opcion) => opcion.value === orden)) {
    selectOrden.value = orden;
  }
}

function leerFiltros() {
  return {
    buscar: inputBuscar.value.trim(),
    dificultad: selectDificultad.value,
    tema: selectTema.value,
    orden: selectOrden.value || "titulo"
  };
}

function actualizarUrl(filtros) {
  const parametros = new URLSearchParams();

  if (filtros.buscar) parametros.set("buscar", filtros.buscar);
  if (filtros.dificultad) parametros.set("dificultad", filtros.dificultad);
  if (filtros.tema) parametros.set("tema", filtros.tema);
  if (filtros.orden && filtros.orden !== "titulo") parametros.set("orden", filtros.orden);

  const consulta = parametros.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${consulta ? `?${consulta}` : ""}`);
}

function actualizarResumen(filtros) {
  const partes = [];

  if (filtros.buscar) partes.push(`texto “${filtros.buscar}”`);
  if (filtros.dificultad) partes.push(`dificultad ${filtros.dificultad}`);
  if (filtros.tema) partes.push(`tema ${filtros.tema}`);

  if (filtros.orden !== "titulo") {
    const etiqueta = selectOrden.selectedOptions[0]?.textContent || filtros.orden;
    partes.push(`orden: ${etiqueta}`);
  }

  resumenFiltros.textContent = partes.length
    ? `Filtros activos: ${partes.join(" · ")}`
    : "Mostrando todas las guías.";
}

function renderizarGuias(guias) {
  contenedorGuias.replaceChildren();

  if (guias.length === 0) {
    const columna = document.createElement("div");
    columna.className = "col-12";

    const vacio = document.createElement("div");
    vacio.className = "empty-state";

    const icono = document.createElement("div");
    icono.className = "fs-1 emoji";
    icono.textContent = "📖";
    icono.setAttribute("aria-hidden", "true");

    const titulo = document.createElement("h2");
    titulo.className = "h5 mt-3";
    titulo.textContent = "No encontramos guías con esos filtros";

    const texto = document.createElement("p");
    texto.className = "text-secondary mb-0";
    texto.textContent = "Prueba con otra dificultad o tema, o limpia los filtros.";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-cp mt-3";
    boton.textContent = "Limpiar filtros";
    boton.addEventListener("click", limpiarFiltros);

    vacio.append(icono, titulo, texto, boton);
    columna.append(vacio);
    contenedorGuias.append(columna);
    return;
  }

  const fragmento = document.createDocumentFragment();
  guias.forEach((guia) => {
    fragmento.append(crearTarjetaGuia(guia, { alVer: abrirDetalle }));
  });
  contenedorGuias.append(fragmento);
}

async function cargarGuias() {
  const filtros = leerFiltros();
  const numeroPeticion = ++peticionActual;

  actualizarUrl(filtros);
  actualizarResumen(filtros);
  contenedorGuias.setAttribute("aria-busy", "true");
  contadorGuias.textContent = "Cargando…";
  mostrarEsqueletos(contenedorGuias, 4, "240px", "col-lg-6");
  limpiarAlerta(alertaGuias);

  const parametros = new URLSearchParams();
  if (filtros.buscar) parametros.set("buscar", filtros.buscar);
  if (filtros.dificultad) parametros.set("dificultad", filtros.dificultad);
  if (filtros.tema) parametros.set("tema", filtros.tema);
  parametros.set("orden", filtros.orden);

  try {
    const datos = await solicitar(`/guias?${parametros.toString()}`);

    if (numeroPeticion !== peticionActual) return;

    renderizarGuias(datos.guias);
    contadorGuias.textContent = `${datos.total} guía${datos.total === 1 ? "" : "s"}`;
  } catch (error) {
    if (numeroPeticion !== peticionActual) return;

    contenedorGuias.replaceChildren();
    contadorGuias.textContent = "0 guías";
    mostrarAlerta(alertaGuias, "danger", error.message);
  } finally {
    if (numeroPeticion === peticionActual) {
      contenedorGuias.removeAttribute("aria-busy");
    }
  }
}

function limpiarFiltros() {
  formFiltros.reset();
  selectOrden.value = "titulo";
  cargarGuias();
}

function llenarDetalle(guia) {
  document.getElementById("detalleGuiaIcono").textContent = guia.icono;
  document.getElementById("detalleGuiaTitulo").textContent = guia.titulo;
  document.getElementById("detalleGuiaResumen").textContent = guia.resumen;
  document.getElementById("detalleGuiaTema").textContent = guia.tema;
  const meta = document.getElementById("detalleGuiaMeta");
  meta.replaceChildren();

  const reloj = document.createElement("i");
  reloj.className = "bi bi-clock";
  reloj.setAttribute("aria-hidden", "true");

  const textoMeta = document.createElement("span");
  textoMeta.textContent = `${guia.duracion} · Versión ${guia.version}`;

  meta.append(reloj, textoMeta);

  const dificultad = document.getElementById("detalleGuiaDificultad");
  dificultad.className = `dificultad ${claseDificultad(guia.dificultad)}`;
  dificultad.textContent = guia.dificultad;

  const contenido = document.getElementById("detalleGuiaContenido");
  contenido.replaceChildren();

  guia.contenido
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean)
    .forEach((linea) => {
      const parrafo = document.createElement("p");
      parrafo.className = "mb-2";
      parrafo.textContent = linea;
      contenido.append(parrafo);
    });
}

async function abrirDetalle(guiaResumen) {
  try {
    const guia = await solicitar(`/guias/${guiaResumen.guia_id}`);
    llenarDetalle(guia);
    modalDetalle.show();
  } catch (error) {
    mostrarAlerta(alertaGuias, "danger", error.message);
  }
}

formFiltros.addEventListener("submit", (evento) => {
  evento.preventDefault();
  cargarGuias();
});

inputBuscar.addEventListener("input", () => {
  window.clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = window.setTimeout(cargarGuias, 350);
});

selectDificultad.addEventListener("change", cargarGuias);
selectTema.addEventListener("change", cargarGuias);
selectOrden.addEventListener("change", cargarGuias);
btnLimpiar.addEventListener("click", limpiarFiltros);

async function iniciar() {
  mostrarEsqueletos(contenedorGuias, 4, "240px", "col-lg-6");

  try {
    await cargarMeta();
  } catch (error) {
    mostrarAlerta(alertaGuias, "danger", error.message);
  }

  aplicarParametrosIniciales();
  await cargarGuias();
}

iniciar();
