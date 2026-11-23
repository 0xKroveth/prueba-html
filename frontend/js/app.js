// app.js - logica del frontend de craftpedia
// se carga en las 3 paginas y cada parte revisa si esta en su pagina

// todas las rutas del backend empiezan con /api
const API = "/api";

// ============ FUNCIONES GENERALES ============

// hace una peticion a la api y devuelve el json
async function pedir(ruta, opciones) {
  // aqui sale la peticion al backend
  const respuesta = await fetch(API + ruta, opciones);
  // convierto la respuesta a objeto de javascript
  const datos = await respuesta.json();

  // si el backend responde con error uso su mensaje
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Ocurrió un error");
  }
  return datos;
}

// cambia los caracteres raros para que el texto no se lea como html (evita xss)
function escapar(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// devuelve la imagen de un icono de minecraft, ej: "apple" -> /assets/minecraft/apple.png
function icono(nombre) {
  return `<img class="icono-minecraft" src="/assets/minecraft/${escapar(nombre)}.png" alt="">`;
}

// clase css segun la rareza
function claseRareza(rareza) {
  if (rareza === "Poco común") return "rareza--poco-comun";
  if (rareza === "Raro") return "rareza--raro";
  if (rareza === "Épico") return "rareza--epico";
  if (rareza === "Legendario") return "rareza--legendario";
  return "rareza--comun";
}

// clase css segun la dificultad
function claseDificultad(dificultad) {
  if (dificultad === "Intermedio") return "dificultad--intermedio";
  if (dificultad === "Avanzado") return "dificultad--avanzado";
  return "dificultad--principiante";
}

// muestra una alerta de bootstrap
function mostrarAlerta(contenedor, tipo, mensaje) {
  contenedor.innerHTML = `<div class="alert alert-${tipo}" role="alert">${escapar(mensaje)}</div>`;
}

// html de la tarjeta de un item
// si conBoton es true muestra un boton para abrir la ficha, si no un link
function tarjetaItem(item, conBoton) {
  // en el inicio es un link a items.html, en items es un boton que abre el modal
  let boton = `<a class="btn btn-sm btn-cp-outline" href="/items.html">Ver ficha</a>`;
  if (conBoton) {
    boton = `<button type="button" class="btn btn-sm btn-cp-outline btn-ver" data-id="${item.item_id}">Ver ficha</button>`;
  }

  // la etiqueta "Destacado" solo sale si el item lo es
  let destacado = "";
  if (item.destacado) {
    destacado = `<span class="badge-destacado">Destacado</span>`;
  }

  // armo la tarjeta con los datos, siempre pasando el texto por escapar()
  return `
    <div class="col-sm-6 col-xl-4">
      <article class="cp-card item-card h-100">
        <div class="item-visual item-visual--${escapar(item.categoria_slug)}">
          ${icono(item.icono)}
          ${destacado}
          <span class="badge-categoria">${icono(item.categoria_icono)} ${escapar(item.categoria)}</span>
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="rareza ${claseRareza(item.rareza)}">${escapar(item.rareza)}</span>
            <span class="item-meta">Stack: ${item.stack_max}</span>
          </div>
          <h3 class="card-title mb-2">${escapar(item.nombre)}</h3>
          <p class="text-secondary small flex-grow-1 descripcion-corta mb-2">${escapar(item.descripcion)}</p>
          <div class="item-meta mb-3">Versión ${escapar(item.version)}</div>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <span class="badge text-bg-light border">v${escapar(item.version)}</span>
            ${boton}
          </div>
        </div>
      </article>
    </div>`;
}

// html de la tarjeta de una guia
function tarjetaGuia(guia, conBoton) {
  // igual que la tarjeta de item: link en el inicio, boton en guias
  let boton = `<a class="btn btn-sm btn-cp" href="/guias.html">Leer guía</a>`;
  if (conBoton) {
    boton = `<button type="button" class="btn btn-sm btn-cp btn-ver" data-id="${guia.guia_id}">Leer guía</button>`;
  }

  let destacada = "";
  if (guia.destacada) {
    destacada = `<span class="badge text-bg-warning">Destacada</span>`;
  }

  return `
    <div class="col-lg-6">
      <article class="cp-card guia-card h-100">
        <div class="guia-icon">${icono(guia.icono)}</div>
        <div class="flex-grow-1 d-flex flex-column">
          <div class="d-flex flex-wrap gap-2 mb-2">
            <span class="dificultad ${claseDificultad(guia.dificultad)}">${escapar(guia.dificultad)}</span>
            <span class="badge text-bg-light border">${escapar(guia.tema)}</span>
            ${destacada}
          </div>
          <h3 class="card-title mb-2">${escapar(guia.titulo)}</h3>
          <p class="text-secondary small flex-grow-1 mb-3">${escapar(guia.resumen)}</p>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-auto">
            <div class="guia-meta"><i class="bi bi-clock"></i> ${escapar(guia.duracion)} · v${escapar(guia.version)}</div>
            ${boton}
          </div>
        </div>
      </article>
    </div>`;
}

// llena un select con opciones [{ valor, texto }]
function llenarSelect(select, opciones, textoInicial) {
  // la primera opcion vacia es "todas"
  let html = `<option value="">${textoInicial}</option>`;
  for (const op of opciones) {
    html += `<option value="${escapar(op.valor)}">${escapar(op.texto)}</option>`;
  }
  select.innerHTML = html;
}

// ============ PAGINA: INICIO ============

// solo corre en index.html, que es la unica con contenedorCategorias
// aqui uso .then() y las 4 peticiones salen al mismo tiempo
if (document.getElementById("contenedorCategorias")) {
  // numeros del banner
  pedir("/estadisticas")
    .then((datos) => {
      document.getElementById("statItems").textContent = datos.total_items;
      document.getElementById("statGuias").textContent = datos.total_guias;
      document.getElementById("statCategorias").textContent = datos.total_categorias;
      document.getElementById("statVersiones").textContent = datos.total_versiones;
    })
    .catch((error) => console.log(error));

  // categorias: al hacer clic abre items.html filtrado por esa categoria
  pedir("/meta")
    .then((datos) => {
      let html = "";
      for (const cat of datos.categorias) {
        html += `
          <div class="col-sm-6 col-lg-4 col-xl-2">
            <a class="categoria-card" href="/items.html?categoria=${cat.categoria_id}">
              <span class="categoria-icon">${icono(cat.icono)}</span>
              <h3 class="h6 mb-1">${escapar(cat.nombre)}</h3>
              <p class="small text-secondary mb-2">${escapar(cat.descripcion)}</p>
              <span class="conteo">${cat.total_items} ítems</span>
            </a>
          </div>`;
      }
      document.getElementById("contenedorCategorias").innerHTML = html;
    })
    .catch((error) => mostrarAlerta(document.getElementById("alertaCategorias"), "danger", error.message));

  // 3 items destacados
  pedir("/items?destacados=true&orden=rareza")
    .then((datos) => {
      let html = "";
      for (const item of datos.items.slice(0, 3)) {
        html += tarjetaItem(item, false);
      }
      document.getElementById("itemsDestacados").innerHTML = html;
    })
    .catch((error) => mostrarAlerta(document.getElementById("alertaItems"), "danger", error.message));

  // 2 guias destacadas
  pedir("/guias?destacadas=true")
    .then((datos) => {
      let html = "";
      for (const guia of datos.guias.slice(0, 2)) {
        html += tarjetaGuia(guia, false);
      }
      document.getElementById("guiasDestacadas").innerHTML = html;
    })
    .catch((error) => mostrarAlerta(document.getElementById("alertaGuias"), "danger", error.message));
}

// ============ PAGINA: ITEMS ============

// solo corre en items.html
if (document.getElementById("formFiltros")) {
  // guardo los elementos que mas uso
  const inputBuscar = document.getElementById("buscar");
  const selectCategoria = document.getElementById("categoria");
  const selectRareza = document.getElementById("rareza");
  const selectVersion = document.getElementById("version");
  const selectOrden = document.getElementById("orden");
  const listaItems = document.getElementById("listaItems");
  const alertaItems = document.getElementById("alertaItems");
  const formItem = document.getElementById("formItem");
  // modales de bootstrap: uno para ver la ficha y otro para agregar
  const modalDetalle = new bootstrap.Modal(document.getElementById("modalDetalleItem"));
  const modalAgregar = new bootstrap.Modal(document.getElementById("modalAgregarItem"));
  // sirve para esperar a que el usuario deje de escribir
  let temporizador;

  // lleno los selects de filtros y del formulario
  async function cargarSelects() {
    const meta = await pedir("/meta");

    // paso los datos al formato { valor, texto } que usa llenarSelect
    const categorias = meta.categorias.map((c) => ({ valor: c.categoria_id, texto: c.nombre }));
    const rarezas = meta.rarezas.map((r) => ({ valor: r, texto: r }));
    const versiones = meta.versiones.map((v) => ({ valor: v, texto: "Versión " + v }));

    llenarSelect(selectCategoria, categorias, "Todas las categorías");
    llenarSelect(selectRareza, rarezas, "Todas las rarezas");
    llenarSelect(selectVersion, versiones, "Todas las versiones");
    llenarSelect(document.getElementById("categoriaItem"), categorias, "Selecciona una categoría");
    llenarSelect(document.getElementById("rarezaItem"), rarezas, "Selecciona una rareza");

    // sugerencias para el campo version del formulario
    let html = "";
    for (const v of meta.versiones) {
      html += `<option value="${escapar(v)}">`;
    }
    document.getElementById("listaVersiones").innerHTML = html;
  }

  // aqui se hace la busqueda de items
  async function cargarItems() {
    // armo la url, ej: /api/items?buscar=espada&rareza=Raro
    const params = new URLSearchParams();
    if (inputBuscar.value.trim()) params.set("buscar", inputBuscar.value.trim());
    if (selectCategoria.value) params.set("categoria", selectCategoria.value);
    if (selectRareza.value) params.set("rareza", selectRareza.value);
    if (selectVersion.value) params.set("version", selectVersion.value);
    params.set("orden", selectOrden.value);

    // mientras llega la respuesta muestro "Cargando..."
    document.getElementById("contadorResultados").textContent = "Cargando...";
    alertaItems.innerHTML = "";

    try {
      const datos = await pedir("/items?" + params.toString());
      document.getElementById("contadorResultados").textContent = datos.total + " ítems";

      // si no hay resultados muestro un mensaje
      if (datos.items.length === 0) {
        listaItems.innerHTML = `<p class="text-secondary text-center py-5">No se encontraron ítems con esos filtros.</p>`;
        return;
      }

      let html = "";
      // junto todas las tarjetas y las pongo de una vez en la pagina
      for (const item of datos.items) {
        html += tarjetaItem(item, true);
      }
      listaItems.innerHTML = html;
    } catch (error) {
      // si falla muestro el error en una alerta roja
      listaItems.innerHTML = "";
      document.getElementById("contadorResultados").textContent = "0 ítems";
      mostrarAlerta(alertaItems, "danger", error.message);
    }
  }

  // pido un item por su id y lo muestro en el modal
  async function verItem(id) {
    try {
      const item = await pedir("/items/" + id);
      // relleno cada parte del modal con los datos del item
      document.getElementById("detalleItemVisual").className = "item-visual item-visual--" + item.categoria_slug;
      document.getElementById("detalleItemIcono").innerHTML = icono(item.icono);
      document.getElementById("detalleItemCategoria").innerHTML = icono(item.categoria_icono) + " " + escapar(item.categoria);
      document.getElementById("detalleItemNombre").textContent = item.nombre;
      document.getElementById("detalleItemRareza").className = "rareza " + claseRareza(item.rareza);
      document.getElementById("detalleItemRareza").textContent = item.rareza;
      document.getElementById("detalleItemVersion").textContent = "v" + item.version;
      document.getElementById("detalleItemStack").textContent = "Stack máximo: " + item.stack_max;
      document.getElementById("detalleItemDescripcion").textContent = item.descripcion;
      document.getElementById("detalleItemObtencion").textContent = item.obtencion;
      document.getElementById("detalleItemDestacado").classList.toggle("d-none", !item.destacado);
      modalDetalle.show();
    } catch (error) {
      mostrarAlerta(alertaItems, "danger", error.message);
    }
  }

  // muestra el icono elegido y cuenta las letras de la descripcion
  function actualizarFormulario() {
    document.getElementById("vistaPreviaIcono").innerHTML = icono(document.getElementById("iconoItem").value);
    document.getElementById("contadorDescripcionItem").textContent = document.getElementById("descripcionItem").value.length;
  }

  // guardo el item nuevo
  async function guardarItem(e) {
    // para que el formulario no recargue la pagina
    e.preventDefault();

    // bootstrap marca en rojo los campos que faltan
    formItem.classList.add("was-validated");
    if (!formItem.checkValidity()) return;

    // junto los datos del formulario en un objeto
    const datos = {
      nombre: document.getElementById("nombreItem").value,
      descripcion: document.getElementById("descripcionItem").value,
      obtencion: document.getElementById("obtencionItem").value,
      categoria_id: Number(document.getElementById("categoriaItem").value),
      rareza: document.getElementById("rarezaItem").value,
      version: document.getElementById("versionItem").value,
      stack_max: Number(document.getElementById("stackItem").value),
      icono: document.getElementById("iconoItem").value,
      destacado: document.getElementById("destacadoItem").checked
    };

    // desactivo el boton para que no lo apreten dos veces
    const boton = document.getElementById("btnGuardarItem");
    boton.disabled = true;

    try {
      // envio el item como json con POST
      const respuesta = await pedir("/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      // si se guardo: cierro el modal, limpio el formulario y recargo la lista
      modalAgregar.hide();
      formItem.reset();
      formItem.classList.remove("was-validated");
      actualizarFormulario();
      await cargarSelects();
      await cargarItems();
      mostrarAlerta(alertaItems, "success", `Se agregó "${respuesta.item.nombre}" a la enciclopedia.`);
    } catch (error) {
      mostrarAlerta(document.getElementById("alertaFormularioItem"), "danger", error.message);
    }

    boton.disabled = false;
  }

  // busca cuando dejas de escribir por 350 ms, asi no hace una peticion por letra
  inputBuscar.addEventListener("input", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargarItems, 350);
  });

  // los selects filtran apenas cambian
  selectCategoria.addEventListener("change", cargarItems);
  selectRareza.addEventListener("change", cargarItems);
  selectVersion.addEventListener("change", cargarItems);
  selectOrden.addEventListener("change", cargarItems);

  // si aprieta enter en el buscador no recargo la pagina, solo busco
  document.getElementById("formFiltros").addEventListener("submit", (e) => {
    e.preventDefault();
    cargarItems();
  });

  // boton limpiar: vuelve los filtros a como estaban y busca de nuevo
  document.getElementById("btnLimpiar").addEventListener("click", () => {
    document.getElementById("formFiltros").reset();
    cargarItems();
  });

  // los botones "ver ficha" se crean despues, por eso escucho el clic en la lista
  listaItems.addEventListener("click", (e) => {
    const boton = e.target.closest(".btn-ver");
    if (boton) verItem(boton.dataset.id);
  });

  // eventos del formulario para agregar
  formItem.addEventListener("submit", guardarItem);
  document.getElementById("iconoItem").addEventListener("change", actualizarFormulario);
  document.getElementById("descripcionItem").addEventListener("input", actualizarFormulario);

  // al abrir la pagina: lleno los selects, reviso si viene ?categoria= en la url y busco
  cargarSelects()
    .then(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("categoria")) selectCategoria.value = params.get("categoria");
      if (params.get("buscar")) inputBuscar.value = params.get("buscar");
      cargarItems();
    })
    .catch((error) => mostrarAlerta(alertaItems, "danger", error.message));

  actualizarFormulario();
}

// ============ PAGINA: GUIAS ============

// solo corre en guias.html, funciona igual que items pero sin formulario
if (document.getElementById("formFiltrosGuias")) {
  const inputBuscar = document.getElementById("buscarGuia");
  const selectDificultad = document.getElementById("dificultadGuia");
  const selectTema = document.getElementById("temaGuia");
  const selectOrden = document.getElementById("ordenGuia");
  const listaGuias = document.getElementById("listaGuias");
  const alertaGuias = document.getElementById("alertaGuias");
  const modalDetalle = new bootstrap.Modal(document.getElementById("modalDetalleGuia"));
  let temporizador;

  // aqui se hace la busqueda de guias, igual que en items
  async function cargarGuias() {
    const params = new URLSearchParams();
    if (inputBuscar.value.trim()) params.set("buscar", inputBuscar.value.trim());
    if (selectDificultad.value) params.set("dificultad", selectDificultad.value);
    if (selectTema.value) params.set("tema", selectTema.value);
    params.set("orden", selectOrden.value);

    // mientras llega la respuesta muestro "Cargando..."
    document.getElementById("contadorGuias").textContent = "Cargando...";
    alertaGuias.innerHTML = "";

    try {
      const datos = await pedir("/guias?" + params.toString());
      document.getElementById("contadorGuias").textContent = datos.total + " guías";

      // si no hay resultados muestro un mensaje
      if (datos.guias.length === 0) {
        listaGuias.innerHTML = `<p class="text-secondary text-center py-5">No se encontraron guías con esos filtros.</p>`;
        return;
      }

      let html = "";
      for (const guia of datos.guias) {
        html += tarjetaGuia(guia, true);
      }
      listaGuias.innerHTML = html;
    } catch (error) {
      listaGuias.innerHTML = "";
      document.getElementById("contadorGuias").textContent = "0 guías";
      mostrarAlerta(alertaGuias, "danger", error.message);
    }
  }

  // pido una guia por su id y la muestro en el modal
  async function verGuia(id) {
    try {
      const guia = await pedir("/guias/" + id);
      // relleno cada parte del modal con los datos de la guia
      document.getElementById("detalleGuiaIcono").innerHTML = icono(guia.icono);
      document.getElementById("detalleGuiaTitulo").textContent = guia.titulo;
      document.getElementById("detalleGuiaResumen").textContent = guia.resumen;
      document.getElementById("detalleGuiaTema").textContent = guia.tema;
      document.getElementById("detalleGuiaMeta").innerHTML = `<i class="bi bi-clock"></i> ${escapar(guia.duracion)} · Versión ${escapar(guia.version)}`;
      document.getElementById("detalleGuiaDificultad").className = "dificultad " + claseDificultad(guia.dificultad);
      document.getElementById("detalleGuiaDificultad").textContent = guia.dificultad;

      // cada linea del contenido es un parrafo
      let html = "";
      for (const linea of guia.contenido.split("\n")) {
        if (linea.trim() !== "") html += `<p class="mb-2">${escapar(linea.trim())}</p>`;
      }
      document.getElementById("detalleGuiaContenido").innerHTML = html;
      modalDetalle.show();
    } catch (error) {
      mostrarAlerta(alertaGuias, "danger", error.message);
    }
  }

  // busca cuando dejas de escribir por 350 ms
  inputBuscar.addEventListener("input", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargarGuias, 350);
  });

  // los selects filtran apenas cambian
  selectDificultad.addEventListener("change", cargarGuias);
  selectTema.addEventListener("change", cargarGuias);
  selectOrden.addEventListener("change", cargarGuias);

  // enter en el buscador: busco sin recargar
  document.getElementById("formFiltrosGuias").addEventListener("submit", (e) => {
    e.preventDefault();
    cargarGuias();
  });

  // boton limpiar
  document.getElementById("btnLimpiarGuias").addEventListener("click", () => {
    document.getElementById("formFiltrosGuias").reset();
    cargarGuias();
  });

  // clic en "leer guía" (los botones se crean despues, por eso escucho en la lista)
  listaGuias.addEventListener("click", (e) => {
    const boton = e.target.closest(".btn-ver");
    if (boton) verGuia(boton.dataset.id);
  });

  // al abrir la pagina lleno los selects y cargo las guias
  pedir("/meta")
    .then((meta) => {
      llenarSelect(selectDificultad, meta.dificultades.map((d) => ({ valor: d, texto: d })), "Todas las dificultades");
      llenarSelect(selectTema, meta.temas.map((t) => ({ valor: t, texto: t })), "Todos los temas");
      cargarGuias();
    })
    .catch((error) => mostrarAlerta(alertaGuias, "danger", error.message));
}
