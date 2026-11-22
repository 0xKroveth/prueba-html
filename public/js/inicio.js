import { solicitar } from "./api.js";
import {
  crearTarjetaGuia,
  crearTarjetaItem,
  limpiarAlerta,
  mostrarAlerta,
  mostrarEsqueletos
} from "./componentes.js";

const numero = new Intl.NumberFormat("es-CL");

const contenedorCategorias = document.getElementById("contenedorCategorias");
const contenedorItems = document.getElementById("itemsDestacados");
const contenedorGuias = document.getElementById("guiasDestacadas");
const alertaCategorias = document.getElementById("alertaCategorias");
const alertaItems = document.getElementById("alertaItems");
const alertaGuias = document.getElementById("alertaGuias");

async function cargarEstadisticas() {
  try {
    const datos = await solicitar("/estadisticas");
    document.getElementById("statItems").textContent = numero.format(datos.total_items);
    document.getElementById("statGuias").textContent = numero.format(datos.total_guias);
    document.getElementById("statCategorias").textContent = numero.format(datos.total_categorias);
    document.getElementById("statVersiones").textContent = numero.format(datos.total_versiones);
  } catch {
    ["statItems", "statGuias", "statCategorias", "statVersiones"].forEach((id) => {
      document.getElementById(id).textContent = "—";
    });
  }
}

async function cargarCategorias() {
  try {
    const { categorias } = await solicitar("/meta");
    contenedorCategorias.replaceChildren();
    limpiarAlerta(alertaCategorias);

    const fragmento = document.createDocumentFragment();

    categorias.forEach((categoria) => {
      const columna = document.createElement("div");
      columna.className = "col-sm-6 col-lg-4 col-xl-2";

      const enlace = document.createElement("a");
      enlace.className = "categoria-card";
      enlace.href = `/items.html?categoria=${categoria.categoria_id}`;

      const icono = document.createElement("span");
      icono.className = "categoria-icon";
      icono.textContent = categoria.icono;
      icono.setAttribute("aria-hidden", "true");

      const titulo = document.createElement("h3");
      titulo.className = "h6 mb-1";
      titulo.textContent = categoria.nombre;

      const descripcion = document.createElement("p");
      descripcion.className = "small text-secondary mb-2";
      descripcion.textContent = categoria.descripcion;

      const conteo = document.createElement("span");
      conteo.className = "conteo";
      conteo.textContent = `${categoria.total_items} ítem${
        categoria.total_items === 1 ? "" : "s"
      }`;

      enlace.append(icono, titulo, descripcion, conteo);
      columna.append(enlace);
      fragmento.append(columna);
    });

    contenedorCategorias.append(fragmento);
  } catch (error) {
    mostrarAlerta(alertaCategorias, "danger", error.message);
  }
}

async function cargarItemsDestacados() {
  mostrarEsqueletos(contenedorItems, 3, "330px");

  try {
    const datos = await solicitar("/items?destacados=true&orden=rareza");
    contenedorItems.replaceChildren();
    limpiarAlerta(alertaItems);

    const fragmento = document.createDocumentFragment();
    datos.items.slice(0, 3).forEach((item) => {
      fragmento.append(crearTarjetaItem(item));
    });
    contenedorItems.append(fragmento);
  } catch (error) {
    contenedorItems.replaceChildren();
    mostrarAlerta(alertaItems, "danger", error.message);
  }
}

async function cargarGuiasDestacadas() {
  mostrarEsqueletos(contenedorGuias, 2, "240px", "col-lg-6");

  try {
    const datos = await solicitar("/guias?destacadas=true&orden=titulo");
    contenedorGuias.replaceChildren();
    limpiarAlerta(alertaGuias);

    const fragmento = document.createDocumentFragment();
    datos.guias.slice(0, 2).forEach((guia) => {
      fragmento.append(crearTarjetaGuia(guia));
    });
    contenedorGuias.append(fragmento);
  } catch (error) {
    contenedorGuias.replaceChildren();
    mostrarAlerta(alertaGuias, "danger", error.message);
  }
}

cargarEstadisticas();
cargarCategorias();
cargarItemsDestacados();
cargarGuiasDestacadas();
