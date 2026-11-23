// app.js - toda la logica del frontend de craftpedia
// se carga en todas las paginas

// ============ API ============

// url base de la api
var BASE_URL = "/api";

// todas las peticiones a la api pasan por aqui
async function solicitar(ruta, opciones) {
  opciones = opciones || {};

  // si mando datos (POST) agrego el header de json
  var config = {
    ...opciones,
    headers: {
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(opciones.headers || {})
    }
  };

  var respuesta;

  try {
    // aqui sale la peticion al backend
    respuesta = await fetch(BASE_URL + ruta, config);
  } catch (e) {
    throw new Error("No fue posible comunicarse con el servidor. Verifica que el backend esté en ejecución.");
  }

  // reviso si es json
  var tipo = respuesta.headers.get("content-type") || "";
  var datos = tipo.includes("application/json") ? await respuesta.json() : null;

  // si el backend responde error (400, 404, 500...) uso su mensaje
  if (!respuesta.ok) {
    throw new Error(datos?.mensaje || "La solicitud falló con el código " + respuesta.status);
  }

  return datos;
}

// ============ COMPONENTES ============

// clases css para las rarezas
var CLASES_RAREZA = {
  "Común": "rareza--comun",
  "Poco común": "rareza--poco-comun",
  "Raro": "rareza--raro",
  "Épico": "rareza--epico",
  "Legendario": "rareza--legendario"
};

// clases css para las dificultades
var CLASES_DIFICULTAD = {
  "Principiante": "dificultad--principiante",
  "Intermedio": "dificultad--intermedio",
  "Avanzado": "dificultad--avanzado"
};

// devuelven la clase css segun la rareza o dificultad
function claseRareza(rareza) {
  return CLASES_RAREZA[rareza] || "rareza--comun";
}

function claseDificultad(dificultad) {
  return CLASES_DIFICULTAD[dificultad] || "dificultad--principiante";
}

// solo acepto nombres tipo "diamond_sword" para los iconos
var PATRON_ICONO = /^[a-z0-9_]+$/;

// crea el elemento img para un icono de minecraft
function crearIconoMinecraft(icono, className) {
  className = className || "";

  if (typeof icono === "string" && PATRON_ICONO.test(icono)) {
    var imagen = document.createElement("img");
    imagen.src = "/assets/minecraft/" + icono + ".png";
    imagen.alt = "";
    imagen.decoding = "async";
    imagen.className = "icono-minecraft" + (className ? " " + className : "");
    imagen.setAttribute("aria-hidden", "true");
    return imagen;
  }

  // si no es nombre valido muestro texto
  var span = document.createElement("span");
  span.className = className;
  span.textContent = icono || "";
  span.setAttribute("aria-hidden", "true");
  return span;
}

// crea tarjeta de item
function crearTarjetaItem(item, alVer) {
  var columna = document.createElement("div");
  columna.className = "col-sm-6 col-xl-4";

  var tarjeta = document.createElement("article");
  tarjeta.className = "cp-card item-card h-100";

  // parte visual con icono grande
  var visual = document.createElement("div");
  visual.className = "item-visual item-visual--" + (item.categoria_slug || "bloques");
  visual.append(crearIconoMinecraft(item.icono));

  if (item.destacado) {
    var dest = document.createElement("span");
    dest.className = "badge-destacado";
    dest.textContent = "Destacado";
    visual.append(dest);
  }

  // badge de categoria
  var cat = document.createElement("span");
  cat.className = "badge-categoria";
  cat.append(crearIconoMinecraft(item.categoria_icono), document.createTextNode(" " + item.categoria));
  visual.append(cat);

  // cuerpo de la tarjeta
  // textContent y no innerHTML, asi evito xss
  var cuerpo = document.createElement("div");
  cuerpo.className = "card-body d-flex flex-column";

  var filaSup = document.createElement("div");
  filaSup.className = "d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2";

  var rareza = document.createElement("span");
  rareza.className = "rareza " + claseRareza(item.rareza);
  rareza.textContent = item.rareza;

  var stack = document.createElement("span");
  stack.className = "item-meta";
  stack.textContent = "Stack: " + item.stack_max;
  filaSup.append(rareza, stack);

  var titulo = document.createElement("h3");
  titulo.className = "card-title mb-2";
  titulo.textContent = item.nombre;

  var desc = document.createElement("p");
  desc.className = "text-secondary small flex-grow-1 descripcion-corta mb-2";
  desc.textContent = item.descripcion;

  var meta = document.createElement("div");
  meta.className = "item-meta mb-3";
  meta.textContent = "Versión " + item.version;

  var pie = document.createElement("div");
  pie.className = "d-flex justify-content-between align-items-center gap-2 mt-auto";

  var ver = document.createElement("span");
  ver.className = "badge text-bg-light border";
  ver.textContent = "v" + item.version;
  pie.append(ver);

  // en items abre el modal, en el inicio es un link
  if (typeof alVer === "function") {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-cp-outline";
    btn.textContent = "Ver ficha";
    btn.addEventListener("click", function () { alVer(item); });
    pie.append(btn);
  } else {
    var link = document.createElement("a");
    link.className = "btn btn-sm btn-cp-outline";
    link.href = "/items.html";
    link.textContent = "Ver ficha";
    pie.append(link);
  }

  cuerpo.append(filaSup, titulo, desc, meta, pie);
  tarjeta.append(visual, cuerpo);
  columna.append(tarjeta);
  return columna;
}

// crea tarjeta de guia
function crearTarjetaGuia(guia, alVer) {
  var columna = document.createElement("div");
  columna.className = "col-lg-6";

  var tarjeta = document.createElement("article");
  tarjeta.className = "cp-card guia-card h-100";

  var icono = document.createElement("div");
  icono.className = "guia-icon";
  icono.setAttribute("aria-hidden", "true");
  icono.append(crearIconoMinecraft(guia.icono));

  var contenido = document.createElement("div");
  contenido.className = "flex-grow-1 d-flex flex-column";

  // badges
  var filaBadges = document.createElement("div");
  filaBadges.className = "d-flex flex-wrap align-items-center gap-2 mb-2";

  var dif = document.createElement("span");
  dif.className = "dificultad " + claseDificultad(guia.dificultad);
  dif.textContent = guia.dificultad;
  filaBadges.append(dif);

  var tema = document.createElement("span");
  tema.className = "badge text-bg-light border";
  tema.textContent = guia.tema;
  filaBadges.append(tema);

  if (guia.destacada) {
    var dest = document.createElement("span");
    dest.className = "badge text-bg-warning";
    dest.textContent = "Destacada";
    filaBadges.append(dest);
  }

  var titulo = document.createElement("h3");
  titulo.className = "card-title mb-2";
  titulo.textContent = guia.titulo;

  var resumen = document.createElement("p");
  resumen.className = "text-secondary small flex-grow-1 mb-3";
  resumen.textContent = guia.resumen;

  var pie = document.createElement("div");
  pie.className = "d-flex flex-wrap justify-content-between align-items-center gap-2 mt-auto";

  var metaDiv = document.createElement("div");
  metaDiv.className = "guia-meta";

  var reloj = document.createElement("i");
  reloj.className = "bi bi-clock";
  reloj.setAttribute("aria-hidden", "true");

  var textoMeta = document.createElement("span");
  textoMeta.textContent = guia.duracion + " · v" + guia.version;
  metaDiv.append(reloj, textoMeta);

  // en la pagina de guias el boton abre el modal, en el inicio es un link
  if (typeof alVer === "function") {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-cp";
    btn.textContent = "Leer guía";
    btn.addEventListener("click", function () { alVer(guia); });
    pie.append(metaDiv, btn);
  } else {
    var link = document.createElement("a");
    link.className = "btn btn-sm btn-cp";
    link.href = "/guias.html";
    link.textContent = "Leer guía";
    pie.append(metaDiv, link);
  }

  contenido.append(filaBadges, titulo, resumen, pie);
  tarjeta.append(icono, contenido);
  columna.append(tarjeta);
  return columna;
}

// muestra esqueletos de carga (bloques grises mientras llegan los datos)
function mostrarEsqueletos(contenedor, cantidad, altura, claseCol) {
  cantidad = cantidad || 6;
  altura = altura || "320px";
  claseCol = claseCol || "col-sm-6 col-xl-4";
  contenedor.replaceChildren();

  for (var i = 0; i < cantidad; i++) {
    var col = document.createElement("div");
    col.className = claseCol;
    var bloque = document.createElement("div");
    bloque.className = "skeleton";
    bloque.style.minHeight = altura;
    bloque.setAttribute("aria-hidden", "true");
    col.append(bloque);
    contenedor.append(col);
  }
}

// muestra alerta de bootstrap
function mostrarAlerta(contenedor, tipo, mensaje) {
  contenedor.replaceChildren();
  var alerta = document.createElement("div");
  alerta.className = "alert alert-" + tipo + " d-flex align-items-start gap-2";
  alerta.setAttribute("role", tipo === "danger" ? "alert" : "status");

  var ic = document.createElement("i");
  ic.className = "bi " + (tipo === "danger" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill");
  ic.setAttribute("aria-hidden", "true");

  var txt = document.createElement("span");
  txt.textContent = mensaje;

  alerta.append(ic, txt);
  contenedor.append(alerta);
}

// borra la alerta que haya en el contenedor
function limpiarAlerta(contenedor) {
  contenedor.replaceChildren();
}

// ============ PAGINA: INICIO ============

// solo corre en index.html
if (document.getElementById("contenedorCategorias")) {
  (function () {
    // formato de numeros chileno (1.234)
    var numero = new Intl.NumberFormat("es-CL");

    var contenedorCategorias = document.getElementById("contenedorCategorias");
    var contenedorItems = document.getElementById("itemsDestacados");
    var contenedorGuias = document.getElementById("guiasDestacadas");
    var alertaCategorias = document.getElementById("alertaCategorias");
    var alertaItems = document.getElementById("alertaItems");
    var alertaGuias = document.getElementById("alertaGuias");

    // cargo las estadisticas del banner
    async function cargarEstadisticas() {
      try {
        var datos = await solicitar("/estadisticas");
        document.getElementById("statItems").textContent = numero.format(datos.total_items);
        document.getElementById("statGuias").textContent = numero.format(datos.total_guias);
        document.getElementById("statCategorias").textContent = numero.format(datos.total_categorias);
        document.getElementById("statVersiones").textContent = numero.format(datos.total_versiones);
      } catch (e) {
        ["statItems", "statGuias", "statCategorias", "statVersiones"].forEach(function (id) {
          document.getElementById(id).textContent = "—";
        });
      }
    }

    // cargo las categorias
    async function cargarCategorias() {
      try {
        var resp = await solicitar("/meta");
        contenedorCategorias.replaceChildren();
        limpiarAlerta(alertaCategorias);

        // armo todo en un fragmento y lo agrego de una vez al dom
        var frag = document.createDocumentFragment();

        resp.categorias.forEach(function (cat) {
          var col = document.createElement("div");
          col.className = "col-sm-6 col-lg-4 col-xl-2";

          var enlace = document.createElement("a");
          enlace.className = "categoria-card";
          // al hacer clic abre items.html ya filtrado por esta categoria
          enlace.href = "/items.html?categoria=" + cat.categoria_id;

          var icono = document.createElement("span");
          icono.className = "categoria-icon";
          icono.setAttribute("aria-hidden", "true");
          icono.append(crearIconoMinecraft(cat.icono));

          var titulo = document.createElement("h3");
          titulo.className = "h6 mb-1";
          titulo.textContent = cat.nombre;

          var desc = document.createElement("p");
          desc.className = "small text-secondary mb-2";
          desc.textContent = cat.descripcion;

          var conteo = document.createElement("span");
          conteo.className = "conteo";
          conteo.textContent = cat.total_items + " ítem" + (cat.total_items === 1 ? "" : "s");

          enlace.append(icono, titulo, desc, conteo);
          col.append(enlace);
          frag.append(col);
        });

        contenedorCategorias.append(frag);
      } catch (error) {
        mostrarAlerta(alertaCategorias, "danger", error.message);
      }
    }

    // cargo items destacados
    async function cargarItemsDestacados() {
      mostrarEsqueletos(contenedorItems, 3, "330px");
      try {
        var datos = await solicitar("/items?destacados=true&orden=rareza");
        contenedorItems.replaceChildren();
        limpiarAlerta(alertaItems);

        var frag = document.createDocumentFragment();
        datos.items.slice(0, 3).forEach(function (item) {
          frag.append(crearTarjetaItem(item));
        });
        contenedorItems.append(frag);
      } catch (error) {
        contenedorItems.replaceChildren();
        mostrarAlerta(alertaItems, "danger", error.message);
      }
    }

    // cargo guias destacadas
    async function cargarGuiasDestacadas() {
      mostrarEsqueletos(contenedorGuias, 2, "240px", "col-lg-6");
      try {
        var datos = await solicitar("/guias?destacadas=true&orden=titulo");
        contenedorGuias.replaceChildren();
        limpiarAlerta(alertaGuias);

        var frag = document.createDocumentFragment();
        datos.guias.slice(0, 2).forEach(function (guia) {
          frag.append(crearTarjetaGuia(guia));
        });
        contenedorGuias.append(frag);
      } catch (error) {
        contenedorGuias.replaceChildren();
        mostrarAlerta(alertaGuias, "danger", error.message);
      }
    }

    // ejecuto todo (las 4 peticiones van en paralelo)
    cargarEstadisticas();
    cargarCategorias();
    cargarItemsDestacados();
    cargarGuiasDestacadas();
  })();
}

// ============ PAGINA: ITEMS ============

// este bloque solo corre si estoy en items.html
if (document.getElementById("formFiltros")) {
  (function () {
    var formFiltros = document.getElementById("formFiltros");
    var inputBuscar = document.getElementById("buscar");
    var selectCategoria = document.getElementById("categoria");
    var selectRareza = document.getElementById("rareza");
    var selectVersion = document.getElementById("version");
    var selectOrden = document.getElementById("orden");
    var btnLimpiar = document.getElementById("btnLimpiar");
    var contenedorItems = document.getElementById("listaItems");
    var contadorResultados = document.getElementById("contadorResultados");
    var resumenFiltros = document.getElementById("resumenFiltros");
    var alertaItems = document.getElementById("alertaItems");

    var modalDetalleItem = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("modalDetalleItem")
    );

    // formulario para agregar
    var formItem = document.getElementById("formItem");
    var iconoItem = document.getElementById("iconoItem");
    var descripcionItem = document.getElementById("descripcionItem");
    var alertaFormularioItem = document.getElementById("alertaFormularioItem");
    var btnGuardarItem = document.getElementById("btnGuardarItem");
    var elementoModalAgregar = document.getElementById("modalAgregarItem");
    var modalAgregarItem = bootstrap.Modal.getOrCreateInstance(elementoModalAgregar);

    // filtros que vienen en la url al abrir la pagina (ej: ?categoria=2)
    var parametrosIniciales = new URLSearchParams(window.location.search);
    var meta = { categorias: [], versiones: [], rarezas: [] };
    // numero de la ultima peticion, sirve para ignorar respuestas viejas
    var peticionActual = 0;
    // temporizador para esperar a que el usuario deje de escribir
    var temporizadorBusqueda;

    // leo el valor actual de cada filtro del formulario
    function leerFiltros() {
      return {
        buscar: inputBuscar.value.trim(),
        categoria: selectCategoria.value,
        rareza: selectRareza.value,
        version: selectVersion.value,
        orden: selectOrden.value || "nombre"
      };
    }

    // guardo los filtros en la url para no perderlos al recargar
    function actualizarUrl(filtros) {
      var params = new URLSearchParams();
      if (filtros.buscar) params.set("buscar", filtros.buscar);
      if (filtros.categoria) params.set("categoria", filtros.categoria);
      if (filtros.rareza) params.set("rareza", filtros.rareza);
      if (filtros.version) params.set("version", filtros.version);
      if (filtros.orden && filtros.orden !== "nombre") params.set("orden", filtros.orden);

      var q = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (q ? "?" + q : ""));
    }

    // llena un select con opciones
    function llenarSelect(select, opciones, textoInicial) {
      var val = select.value;
      select.replaceChildren();
      select.add(new Option(textoInicial, ""));
      opciones.forEach(function (op) {
        select.add(new Option(op.texto, String(op.valor)));
      });
      // si ya habia algo elegido lo mantengo
      if (val && [...select.options].some(function (o) { return o.value === val; })) {
        select.value = val;
      }
    }

    // cargo los datos de los selects
    async function cargarMeta() {
      meta = await solicitar("/meta");

      llenarSelect(selectCategoria,
        meta.categorias.map(function (c) { return { valor: c.categoria_id, texto: c.nombre + " (" + c.total_items + ")" }; }),
        "Todas las categorías"
      );
      llenarSelect(selectRareza,
        meta.rarezas.map(function (r) { return { valor: r, texto: r }; }),
        "Todas las rarezas"
      );
      llenarSelect(selectVersion,
        meta.versiones.map(function (v) { return { valor: v, texto: "Versión " + v }; }),
        "Todas las versiones"
      );

      // selects del formulario para agregar
      llenarSelect(document.getElementById("categoriaItem"),
        meta.categorias.map(function (c) { return { valor: c.categoria_id, texto: c.nombre }; }),
        "Selecciona una categoría"
      );
      llenarSelect(document.getElementById("rarezaItem"),
        meta.rarezas.map(function (r) { return { valor: r, texto: r }; }),
        "Selecciona una rareza"
      );
      document.getElementById("listaVersiones").replaceChildren(
        ...meta.versiones.map(function (v) { return new Option(v, v); })
      );
    }

    // aplico filtros de la url
    function aplicarParametrosIniciales() {
      inputBuscar.value = parametrosIniciales.get("buscar") || "";
      ["categoria", "rareza", "version", "orden"].forEach(function (nombre) {
        var el = document.getElementById(nombre);
        var val = parametrosIniciales.get(nombre);
        if (val && [...el.options].some(function (o) { return o.value === val; })) {
          el.value = val;
        }
      });
    }

    // texto que dice que filtros estan activos
    function actualizarResumen(filtros) {
      var partes = [];
      if (filtros.buscar) partes.push('texto "' + filtros.buscar + '"');
      if (filtros.categoria) {
        var c = meta.categorias.find(function (el) { return String(el.categoria_id) === filtros.categoria; });
        if (c) partes.push("categoría " + c.nombre);
      }
      if (filtros.rareza) partes.push("rareza " + filtros.rareza);
      if (filtros.version) partes.push("versión " + filtros.version);
      if (filtros.orden !== "nombre") {
        partes.push("orden: " + (selectOrden.selectedOptions[0]?.textContent || filtros.orden));
      }
      resumenFiltros.textContent = partes.length
        ? "Filtros activos: " + partes.join(" · ")
        : "Mostrando toda la enciclopedia.";
    }

    // dibujo las tarjetas de los items que llegaron
    function renderizarItems(items) {
      contenedorItems.replaceChildren();

      // si no hay resultados
      if (items.length === 0) {
        var col = document.createElement("div");
        col.className = "col-12";
        var vacio = document.createElement("div");
        vacio.className = "empty-state";

        var ic = document.createElement("div");
        ic.className = "empty-icon";
        ic.setAttribute("aria-hidden", "true");
        ic.append(crearIconoMinecraft("crafting_table"));

        var t = document.createElement("h3");
        t.className = "h5 mt-3";
        t.textContent = "No encontramos ítems con esos filtros";

        var p = document.createElement("p");
        p.className = "text-secondary mb-0";
        p.textContent = "Prueba con otra categoría, rareza o versión, o limpia los filtros.";

        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn btn-cp mt-3";
        b.textContent = "Limpiar filtros";
        b.addEventListener("click", limpiarFiltros);

        vacio.append(ic, t, p, b);
        col.append(vacio);
        contenedorItems.append(col);
        return;
      }

      var frag = document.createDocumentFragment();
      items.forEach(function (item) {
        frag.append(crearTarjetaItem(item, abrirDetalle));
      });
      contenedorItems.append(frag);
    }

    // aqui se hace la busqueda de items
    async function cargarItems() {
      var filtros = leerFiltros();
      // le doy un numero a esta peticion
      var num = ++peticionActual;

      actualizarUrl(filtros);
      actualizarResumen(filtros);
      contenedorItems.setAttribute("aria-busy", "true");
      contadorResultados.textContent = "Cargando…";
      mostrarEsqueletos(contenedorItems, 6, "330px");
      limpiarAlerta(alertaItems);

      // armo la url, ej: /api/items?buscar=espada
      var params = new URLSearchParams();
      if (filtros.buscar) params.set("buscar", filtros.buscar);
      if (filtros.categoria) params.set("categoria", filtros.categoria);
      if (filtros.rareza) params.set("rareza", filtros.rareza);
      if (filtros.version) params.set("version", filtros.version);
      params.set("orden", filtros.orden);

      try {
        var datos = await solicitar("/items?" + params.toString());
        // si ya hay una busqueda mas nueva, ignoro esta
        if (num !== peticionActual) return;
        renderizarItems(datos.items);
        contadorResultados.textContent = datos.total + " ítem" + (datos.total === 1 ? "" : "s");
      } catch (error) {
        if (num !== peticionActual) return;
        contenedorItems.replaceChildren();
        contadorResultados.textContent = "0 ítems";
        mostrarAlerta(alertaItems, "danger", error.message);
      } finally {
        if (num === peticionActual) contenedorItems.removeAttribute("aria-busy");
      }
    }

    // vuelvo los filtros a su valor inicial y recargo
    function limpiarFiltros() {
      formFiltros.reset();
      selectOrden.value = "nombre";
      return cargarItems();
    }

    // lleno el modal con datos del item
    function llenarDetalle(item) {
      var visual = document.getElementById("detalleItemVisual");
      visual.className = "item-visual item-visual--" + (item.categoria_slug || "bloques");
      document.getElementById("detalleItemIcono").replaceChildren(crearIconoMinecraft(item.icono));
      document.getElementById("detalleItemCategoria").replaceChildren(
        crearIconoMinecraft(item.categoria_icono),
        document.createTextNode(" " + item.categoria)
      );
      document.getElementById("detalleItemNombre").textContent = item.nombre;

      var r = document.getElementById("detalleItemRareza");
      r.className = "rareza " + claseRareza(item.rareza);
      r.textContent = item.rareza;

      document.getElementById("detalleItemVersion").textContent = "v" + item.version;
      document.getElementById("detalleItemStack").textContent = "Stack máximo: " + item.stack_max;
      document.getElementById("detalleItemDescripcion").textContent = item.descripcion;
      document.getElementById("detalleItemObtencion").textContent = item.obtencion;
      document.getElementById("detalleItemDestacado").classList.toggle("d-none", !item.destacado);
    }

    // pido el item completo por su id y abro el modal de bootstrap
    async function abrirDetalle(itemRes) {
      try {
        var item = await solicitar("/items/" + itemRes.item_id);
        llenarDetalle(item);
        modalDetalleItem.show();
      } catch (error) {
        mostrarAlerta(alertaItems, "danger", error.message);
      }
    }

    // muestra el icono elegido y cuenta los caracteres
    function actualizarFormulario() {
      document.getElementById("vistaPreviaIcono").replaceChildren(crearIconoMinecraft(iconoItem.value));
      document.getElementById("contadorDescripcionItem").textContent = descripcionItem.value.length;
    }

    // bloquea el boton mientras se guarda
    function bloquearFormulario(bloqueado) {
      btnGuardarItem.disabled = bloqueado;
      document.getElementById("spinnerGuardarItem").classList.toggle("d-none", !bloqueado);
      document.getElementById("textoGuardarItem").textContent = bloqueado ? "Guardando…" : "Guardar ítem";
    }

    // envio el item nuevo al backend
    async function guardarItem(e) {
      // evito que el formulario recargue la pagina
      e.preventDefault();
      // was-validated muestra los errores de bootstrap en los campos
      formItem.classList.add("was-validated");
      // si falta algun campo requerido no envio nada
      if (!formItem.checkValidity()) return;

      // junto los datos del formulario en un objeto
      var campos = new FormData(formItem);
      var datos = {
        nombre: campos.get("nombre").trim(),
        descripcion: campos.get("descripcion").trim(),
        obtencion: campos.get("obtencion").trim(),
        categoria_id: Number(campos.get("categoria_id")),
        rareza: campos.get("rareza"),
        version: campos.get("version").trim(),
        stack_max: Number(campos.get("stack_max")),
        icono: campos.get("icono"),
        destacado: campos.has("destacado")
      };

      bloquearFormulario(true);
      limpiarAlerta(alertaFormularioItem);

      var respuesta;
      try {
        // envio el item como json al endpoint POST /api/items
        respuesta = await solicitar("/items", { method: "POST", body: JSON.stringify(datos) });
      } catch (error) {
        mostrarAlerta(alertaFormularioItem, "danger", error.message);
        return;
      } finally {
        bloquearFormulario(false);
      }

      // si se guardo bien cierro el modal y limpio el formulario
      modalAgregarItem.hide();
      formItem.reset();
      formItem.classList.remove("was-validated");
      actualizarFormulario();

      // recargo todo para que se vea el item nuevo
      try { await cargarMeta(); } catch (error) { mostrarAlerta(alertaItems, "danger", error.message); }
      await limpiarFiltros();
      mostrarAlerta(alertaItems, "success", 'Se agregó "' + respuesta.item.nombre + '" a la enciclopedia.');
    }

    // eventos
    formItem.addEventListener("submit", guardarItem);
    iconoItem.addEventListener("change", actualizarFormulario);
    descripcionItem.addEventListener("input", actualizarFormulario);
    elementoModalAgregar.addEventListener("hidden.bs.modal", function () { limpiarAlerta(alertaFormularioItem); });
    formFiltros.addEventListener("submit", function (e) { e.preventDefault(); cargarItems(); });
    // busca cuando dejas de escribir por 350 ms
    inputBuscar.addEventListener("input", function () {
      clearTimeout(temporizadorBusqueda);
      temporizadorBusqueda = setTimeout(cargarItems, 350);
    });
    // los selects filtran apenas cambian
    selectCategoria.addEventListener("change", cargarItems);
    selectRareza.addEventListener("change", cargarItems);
    selectVersion.addEventListener("change", cargarItems);
    selectOrden.addEventListener("change", cargarItems);
    btnLimpiar.addEventListener("click", limpiarFiltros);

    // al abrir: selects, filtros de la url y despues los items
    (async function () {
      actualizarFormulario();
      mostrarEsqueletos(contenedorItems, 6, "330px");
      try { await cargarMeta(); } catch (e) { mostrarAlerta(alertaItems, "danger", e.message); }
      aplicarParametrosIniciales();
      await cargarItems();
    })();
  })();
}

// ============ PAGINA: GUIAS ============

// solo corre en guias.html, igual que items
if (document.getElementById("formFiltrosGuias")) {
  (function () {
    var formFiltros = document.getElementById("formFiltrosGuias");
    var inputBuscar = document.getElementById("buscarGuia");
    var selectDificultad = document.getElementById("dificultadGuia");
    var selectTema = document.getElementById("temaGuia");
    var selectOrden = document.getElementById("ordenGuia");
    var btnLimpiar = document.getElementById("btnLimpiarGuias");
    var contenedorGuias = document.getElementById("listaGuias");
    var contadorGuias = document.getElementById("contadorGuias");
    var resumenFiltros = document.getElementById("resumenFiltrosGuias");
    var alertaGuias = document.getElementById("alertaGuias");

    var modalDetalle = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("modalDetalleGuia")
    );

    // filtros que vienen en la url al abrir la pagina
    var parametrosIniciales = new URLSearchParams(window.location.search);
    var meta = { dificultades: [], temas: [] };
    // numero de la ultima peticion, sirve para ignorar respuestas viejas
    var peticionActual = 0;
    // temporizador para esperar a que el usuario deje de escribir
    var temporizadorBusqueda;

    // llena un select con opciones (manteniendo lo elegido)
    function llenarSelect(select, opciones, textoInicial) {
      var val = select.value;
      select.replaceChildren();
      select.add(new Option(textoInicial, ""));
      opciones.forEach(function (op) { select.add(new Option(op, op)); });
      if (val && [...select.options].some(function (o) { return o.value === val; })) {
        select.value = val;
      }
    }

    // cargo las dificultades y temas para los selects
    async function cargarMeta() {
      meta = await solicitar("/meta");
      llenarSelect(selectDificultad, meta.dificultades, "Todas las dificultades");
      llenarSelect(selectTema, meta.temas, "Todos los temas");
    }

    // aplico los filtros que venian en la url
    function aplicarParametrosIniciales() {
      inputBuscar.value = parametrosIniciales.get("buscar") || "";
      var d = parametrosIniciales.get("dificultad");
      if (d && [...selectDificultad.options].some(function (o) { return o.value === d; })) selectDificultad.value = d;
      var t = parametrosIniciales.get("tema");
      if (t && [...selectTema.options].some(function (o) { return o.value === t; })) selectTema.value = t;
      var o = parametrosIniciales.get("orden");
      if (o && [...selectOrden.options].some(function (op) { return op.value === o; })) selectOrden.value = o;
    }

    // leo el valor actual de cada filtro
    function leerFiltros() {
      return {
        buscar: inputBuscar.value.trim(),
        dificultad: selectDificultad.value,
        tema: selectTema.value,
        orden: selectOrden.value || "titulo"
      };
    }

    // guardo los filtros en la url sin recargar la pagina
    function actualizarUrl(filtros) {
      var params = new URLSearchParams();
      if (filtros.buscar) params.set("buscar", filtros.buscar);
      if (filtros.dificultad) params.set("dificultad", filtros.dificultad);
      if (filtros.tema) params.set("tema", filtros.tema);
      if (filtros.orden && filtros.orden !== "titulo") params.set("orden", filtros.orden);
      var q = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (q ? "?" + q : ""));
    }

    // texto que dice que filtros estan activos
    function actualizarResumen(filtros) {
      var partes = [];
      if (filtros.buscar) partes.push('texto "' + filtros.buscar + '"');
      if (filtros.dificultad) partes.push("dificultad " + filtros.dificultad);
      if (filtros.tema) partes.push("tema " + filtros.tema);
      if (filtros.orden !== "titulo") {
        partes.push("orden: " + (selectOrden.selectedOptions[0]?.textContent || filtros.orden));
      }
      resumenFiltros.textContent = partes.length
        ? "Filtros activos: " + partes.join(" · ")
        : "Mostrando todas las guías.";
    }

    // dibujo las tarjetas de las guias que llegaron
    function renderizarGuias(guias) {
      contenedorGuias.replaceChildren();

      // si no hay resultados muestro un mensaje
      if (guias.length === 0) {
        var col = document.createElement("div");
        col.className = "col-12";
        var vacio = document.createElement("div");
        vacio.className = "empty-state";

        var ic = document.createElement("div");
        ic.className = "empty-icon";
        ic.setAttribute("aria-hidden", "true");
        ic.append(crearIconoMinecraft("book"));

        var t = document.createElement("h2");
        t.className = "h5 mt-3";
        t.textContent = "No encontramos guías con esos filtros";

        var p = document.createElement("p");
        p.className = "text-secondary mb-0";
        p.textContent = "Prueba con otra dificultad o tema, o limpia los filtros.";

        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn btn-cp mt-3";
        b.textContent = "Limpiar filtros";
        b.addEventListener("click", limpiarFiltrosGuias);

        vacio.append(ic, t, p, b);
        col.append(vacio);
        contenedorGuias.append(col);
        return;
      }

      var frag = document.createDocumentFragment();
      guias.forEach(function (guia) {
        frag.append(crearTarjetaGuia(guia, abrirDetalle));
      });
      contenedorGuias.append(frag);
    }

    // aqui se hace la busqueda de guias
    async function cargarGuias() {
      var filtros = leerFiltros();
      // le doy un numero a esta peticion
      var num = ++peticionActual;

      actualizarUrl(filtros);
      actualizarResumen(filtros);
      contenedorGuias.setAttribute("aria-busy", "true");
      contadorGuias.textContent = "Cargando…";
      mostrarEsqueletos(contenedorGuias, 4, "240px", "col-lg-6");
      limpiarAlerta(alertaGuias);

      // armo la url, ej: /api/guias?buscar=redstone
      var params = new URLSearchParams();
      if (filtros.buscar) params.set("buscar", filtros.buscar);
      if (filtros.dificultad) params.set("dificultad", filtros.dificultad);
      if (filtros.tema) params.set("tema", filtros.tema);
      params.set("orden", filtros.orden);

      try {
        var datos = await solicitar("/guias?" + params.toString());
        // si ya hay una busqueda mas nueva, ignoro esta
        if (num !== peticionActual) return;
        renderizarGuias(datos.guias);
        contadorGuias.textContent = datos.total + " guía" + (datos.total === 1 ? "" : "s");
      } catch (error) {
        if (num !== peticionActual) return;
        contenedorGuias.replaceChildren();
        contadorGuias.textContent = "0 guías";
        mostrarAlerta(alertaGuias, "danger", error.message);
      } finally {
        if (num === peticionActual) contenedorGuias.removeAttribute("aria-busy");
      }
    }

    // vuelvo los filtros a su valor inicial y recargo
    function limpiarFiltrosGuias() {
      formFiltros.reset();
      selectOrden.value = "titulo";
      cargarGuias();
    }

    // lleno el modal de guia
    function llenarDetalle(guia) {
      document.getElementById("detalleGuiaIcono").replaceChildren(crearIconoMinecraft(guia.icono));
      document.getElementById("detalleGuiaTitulo").textContent = guia.titulo;
      document.getElementById("detalleGuiaResumen").textContent = guia.resumen;
      document.getElementById("detalleGuiaTema").textContent = guia.tema;

      var metaEl = document.getElementById("detalleGuiaMeta");
      metaEl.replaceChildren();
      var reloj = document.createElement("i");
      reloj.className = "bi bi-clock";
      reloj.setAttribute("aria-hidden", "true");
      var textoM = document.createElement("span");
      textoM.textContent = guia.duracion + " · Versión " + guia.version;
      metaEl.append(reloj, textoM);

      var dif = document.getElementById("detalleGuiaDificultad");
      dif.className = "dificultad " + claseDificultad(guia.dificultad);
      dif.textContent = guia.dificultad;

      // muestro el contenido separado por parrafos
      var cont = document.getElementById("detalleGuiaContenido");
      cont.replaceChildren();
      guia.contenido.split("\n").map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (linea) {
        var par = document.createElement("p");
        par.className = "mb-2";
        par.textContent = linea;
        cont.append(par);
      });
    }

    // pido la guia completa por su id y abro el modal de bootstrap
    async function abrirDetalle(guiaRes) {
      try {
        var guia = await solicitar("/guias/" + guiaRes.guia_id);
        llenarDetalle(guia);
        modalDetalle.show();
      } catch (error) {
        mostrarAlerta(alertaGuias, "danger", error.message);
      }
    }

    // eventos
    formFiltros.addEventListener("submit", function (e) { e.preventDefault(); cargarGuias(); });
    // busca cuando dejas de escribir por 350 ms
    inputBuscar.addEventListener("input", function () {
      clearTimeout(temporizadorBusqueda);
      temporizadorBusqueda = setTimeout(cargarGuias, 350);
    });
    // los selects filtran apenas cambian
    selectDificultad.addEventListener("change", cargarGuias);
    selectTema.addEventListener("change", cargarGuias);
    selectOrden.addEventListener("change", cargarGuias);
    btnLimpiar.addEventListener("click", limpiarFiltrosGuias);

    // inicio: lleno los selects, aplico los filtros de la url y cargo las guias
    (async function () {
      mostrarEsqueletos(contenedorGuias, 4, "240px", "col-lg-6");
      try { await cargarMeta(); } catch (e) { mostrarAlerta(alertaGuias, "danger", e.message); }
      aplicarParametrosIniciales();
      await cargarGuias();
    })();
  })();
}
