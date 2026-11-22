import { solicitar } from "./api.js";

document.querySelectorAll("[data-anio]").forEach((elemento) => {
  elemento.textContent = String(new Date().getFullYear());
});

const estadoApi = document.getElementById("estadoApi");

if (estadoApi) {
  solicitar("/salud")
    .then(() => {
      estadoApi.className = "badge text-bg-success";
      estadoApi.textContent = "Base de datos conectada";
    })
    .catch(() => {
      estadoApi.className = "badge text-bg-danger";
      estadoApi.textContent = "Base de datos sin conexión";
    });
}

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((elemento) => {
  new bootstrap.Tooltip(elemento);
});
