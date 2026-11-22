import { solicitar } from "./api.js";
import {
  crearTarjetaProducto,
  estiloCategoria,
  formatoCLP,
  limpiarAlerta,
  mostrarAlerta,
  mostrarEsqueletos
} from "./componentes.js";

const numero = new Intl.NumberFormat("es-CL");

const contenedorCategorias = document.getElementById("contenedorCategorias");
const contenedorDestacados = document.getElementById("productosDestacados");
const alertaCategorias = document.getElementById("alertaCategorias");
const alertaDestacados = document.getElementById("alertaDestacados");

async function cargarEstadisticas() {
  try {
    const datos = await solicitar("/estadisticas");
    document.getElementById("statProductos").textContent = numero.format(datos.total_productos);
    document.getElementById("statCategorias").textContent = numero.format(datos.total_categorias);
    document.getElementById("statStock").textContent = numero.format(datos.unidades_en_stock);
    document.getElementById("statPrecio").textContent = formatoCLP.format(datos.precio_promedio);
  } catch {
    ["statProductos", "statCategorias", "statStock", "statPrecio"].forEach((id) => {
      document.getElementById(id).textContent = "—";
    });
  }
}

async function cargarCategorias() {
  try {
    const categorias = await solicitar("/categorias");
    contenedorCategorias.replaceChildren();
    limpiarAlerta(alertaCategorias);

    const fragmento = document.createDocumentFragment();

    categorias.forEach((categoria) => {
      const columna = document.createElement("div");
      columna.className = "col-sm-6 col-lg-3";

      const enlace = document.createElement("a");
      enlace.className = "categoria-card";
      enlace.href = `/productos.html?categoria=${categoria.categoria_id}`;

      const estilo = estiloCategoria(categoria.categoria_id);
      const icono = document.createElement("span");
      icono.className = "categoria-icon";
      icono.innerHTML = `<i class="bi ${estilo.icono}" aria-hidden="true"></i>`;

      const titulo = document.createElement("h3");
      titulo.className = "h6 mb-1";
      titulo.textContent = categoria.nombre;

      const detalle = document.createElement("p");
      detalle.className = "small text-secondary mb-2";
      detalle.textContent = categoria.descripcion;

      const conteo = document.createElement("span");
      conteo.className = "small fw-semibold text-primary";
      conteo.textContent = `${categoria.total_productos} producto${
        categoria.total_productos === 1 ? "" : "s"
      }`;

      enlace.append(icono, titulo, detalle, conteo);
      columna.append(enlace);
      fragmento.append(columna);
    });

    contenedorCategorias.append(fragmento);
  } catch (error) {
    mostrarAlerta(alertaCategorias, "danger", error.message);
  }
}

async function cargarDestacados() {
  mostrarEsqueletos(contenedorDestacados, 3);

  try {
    const datos = await solicitar("/productos?destacados=true&orden=precio_desc");
    contenedorDestacados.replaceChildren();
    limpiarAlerta(alertaDestacados);

    if (datos.productos.length === 0) {
      const vacio = document.createElement("div");
      vacio.className = "col-12";
      vacio.innerHTML =
        '<div class="empty-state"><i class="bi bi-box-seam fs-1 text-secondary" aria-hidden="true"></i>' +
        '<p class="mt-3 mb-0">Aún no hay productos destacados en el catálogo.</p></div>';
      contenedorDestacados.append(vacio);
      return;
    }

    const fragmento = document.createDocumentFragment();
    datos.productos.slice(0, 3).forEach((producto) => {
      fragmento.append(crearTarjetaProducto(producto));
    });
    contenedorDestacados.append(fragmento);
  } catch (error) {
    contenedorDestacados.replaceChildren();
    mostrarAlerta(alertaDestacados, "danger", error.message);
  }
}

cargarEstadisticas();
cargarCategorias();
cargarDestacados();
