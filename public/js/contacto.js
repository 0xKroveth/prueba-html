import { solicitar } from "./api.js";
import { limpiarAlerta, mostrarAlerta } from "./componentes.js";

const formContacto = document.getElementById("formContacto");
const nombreContacto = document.getElementById("nombreContacto");
const emailContacto = document.getElementById("emailContacto");
const asuntoContacto = document.getElementById("asuntoContacto");
const mensajeContacto = document.getElementById("mensajeContacto");
const contadorMensaje = document.getElementById("contadorMensaje");
const alertaContacto = document.getElementById("alertaContacto");
const btnEnviarContacto = document.getElementById("btnEnviarContacto");
const spinnerContacto = document.getElementById("spinnerContacto");
const textoEnviar = document.getElementById("textoEnviar");

function actualizarContador() {
  contadorMensaje.textContent = String(mensajeContacto.value.length);
}

function bloquearFormulario(bloqueado) {
  btnEnviarContacto.disabled = bloqueado;
  spinnerContacto.classList.toggle("d-none", !bloqueado);
  textoEnviar.textContent = bloqueado ? "Enviando…" : "Enviar mensaje";
}

function aplicarItemDesdeUrl() {
  const item = new URLSearchParams(window.location.search).get("item");

  if (!item) return;

  asuntoContacto.value = `Sugerencia sobre ${item}`.slice(0, 120);
  mensajeContacto.value =
    `Hola, quiero aportar información o corregir la ficha del ítem "${item}". ` +
    "Detalles: ";
  actualizarContador();
}

mensajeContacto.addEventListener("input", actualizarContador);

formContacto.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  evento.stopPropagation();
  formContacto.classList.add("was-validated");

  if (!formContacto.checkValidity()) {
    return;
  }

  const datos = {
    nombre: nombreContacto.value.trim(),
    email: emailContacto.value.trim(),
    asunto: asuntoContacto.value.trim(),
    mensaje: mensajeContacto.value.trim()
  };

  bloquearFormulario(true);
  limpiarAlerta(alertaContacto);

  try {
    const respuesta = await solicitar("/contacto", {
      method: "POST",
      body: JSON.stringify(datos)
    });

    mostrarAlerta(alertaContacto, "success", respuesta.mensaje);
    formContacto.reset();
    formContacto.classList.remove("was-validated");
    actualizarContador();
    alertaContacto.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    mostrarAlerta(alertaContacto, "danger", error.message);
  } finally {
    bloquearFormulario(false);
  }
});

aplicarItemDesdeUrl();
actualizarContador();
