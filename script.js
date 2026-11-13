/**
 * PixelZone - Lógica de interfaz, validación y envío a Google Sheets
 * Archivo 100% JavaScript nativo (sin librerías ni servidores requeridos).
 */

// URL oficial de tu aplicación web en Google Apps Script
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbyUJILOLvJLRr5azHXAO5w8K6hqGHbsClEhvoZbxTDhDT1jAKdgyl9B1vySYo2u-uzoJg/exec";

document.addEventListener("DOMContentLoaded", () => {
  // ================= 1. MENÚ RESPONSIVE EN MÓVILES =================
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(".nav-link");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = mainNav.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", String(isExpanded));
    });

    // Cerrar menú automáticamente al hacer clic en un enlace
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ================= 2. BOTONES "CONSULTAR" DEL CATÁLOGO =================
  const botonesConsultar = document.querySelectorAll(".btn-consultar");
  const seccionSoporte = document.getElementById("soporte");
  const campoDescripcion = document.getElementById("descripcionProblema");

  botonesConsultar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const nombreProducto = boton.getAttribute("data-producto");

      // Desplazar suavemente al formulario y autocompletar el motivo de consulta
      if (seccionSoporte && campoDescripcion) {
        campoDescripcion.value = `Hola, me gustaría consultar disponibilidad y especificaciones del producto: ${nombreProducto}.`;
        seccionSoporte.scrollIntoView({ behavior: "smooth" });
        campoDescripcion.focus();
      }
    });
  });

  // ================= 3. VALIDACIÓN Y ENVÍO DEL FORMULARIO =================
  const soporteForm = document.getElementById("soporteForm");

  if (soporteForm) {
    soporteForm.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      // Capturar valores limpios de los campos
      const datosSolicitud = {
        nombre_completo: document.getElementById("nombreCompleto").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        tipo_equipo: document.getElementById("tipoEquipo").value,
        descripcion_problema: document.getElementById("descripcionProblema").value.trim(),
        fecha_cliente: new Date().toISOString()
      };

      // Ejecutar validación básica en el navegador
      const esValido = validarFormulario(datosSolicitud);
      if (!esValido) {
        mostrarMensajeFeedback(
          "Por favor corrige los campos marcados antes de continuar.",
          "error"
        );
        return;
      }

      // Enviar solicitud a Google Sheets
      await enviarSolicitud(datosSolicitud);
    });
  }
});

/**
 * Valida los 4 campos obligatorios en el navegador y muestra mensajes claros.
 * @param {Object} datos - Objeto con los valores ingresados por el usuario.
 * @returns {boolean} - true si todos los campos son válidos.
 */
function validarFormulario(datos) {
  let valido = true;

  const inputNombre = document.getElementById("nombreCompleto");
  const inputTelefono = document.getElementById("telefono");
  const selectEquipo = document.getElementById("tipoEquipo");
  const textDescripcion = document.getElementById("descripcionProblema");

  const errorNombre = document.getElementById("errorNombre");
  const errorTelefono = document.getElementById("errorTelefono");
  const errorEquipo = document.getElementById("errorEquipo");
  const errorDescripcion = document.getElementById("errorDescripcion");

  // Limpiar errores previos
  [inputNombre, inputTelefono, selectEquipo, textDescripcion].forEach((el) =>
    el.classList.remove("invalid")
  );
  [errorNombre, errorTelefono, errorEquipo, errorDescripcion].forEach(
    (el) => (el.textContent = "")
  );

  // 1. Validar Nombre completo (mínimo 3 caracteres)
  if (datos.nombre_completo.length < 3) {
    inputNombre.classList.add("invalid");
    errorNombre.textContent = "Ingresa tu nombre completo (mínimo 3 caracteres).";
    valido = false;
  }

  // 2. Validar Teléfono (permite dígitos, espacios, + y guiones; mínimo 7 dígitos)
  const soloDigitos = datos.telefono.replace(/\D/g, "");
  if (soloDigitos.length < 7 || soloDigitos.length > 15) {
    inputTelefono.classList.add("invalid");
    errorTelefono.textContent = "Ingresa un número de teléfono válido (entre 7 y 15 dígitos).";
    valido = false;
  }

  // 3. Validar Tipo de equipo seleccionado
  if (!datos.tipo_equipo) {
    selectEquipo.classList.add("invalid");
    errorEquipo.textContent = "Selecciona el tipo de equipo.";
    valido = false;
  }

  // 4. Validar Descripción del problema (mínimo 10 caracteres)
  if (datos.descripcion_problema.length < 10) {
    textDescripcion.classList.add("invalid");
    errorDescripcion.textContent = "Describe el problema con al menos 10 caracteres.";
    valido = false;
  }

  return valido;
}

/**
 * Muestra alertas visuales debajo del formulario.
 * @param {string} mensaje - Texto a mostrar.
 * @param {"exito" | "error"} tipo - Estilo de alerta.
 */
function mostrarMensajeFeedback(mensaje, tipo) {
  const feedbackEl = document.getElementById("formFeedback");
  if (!feedbackEl) return;

  feedbackEl.textContent = mensaje;
  feedbackEl.className = `form-feedback ${tipo}`;
  feedbackEl.hidden = false;
}

/**
 * Envía los datos validados del formulario directamente a Google Sheets.
 * @param {Object} datos - Objeto con la información del soporte técnico.
 */
async function enviarSolicitud(datos) {
  const btnSubmit = document.querySelector(".btn-submit");
  const textoOriginal = btnSubmit.textContent;

  try {
    // Deshabilitar botón temporalmente para evitar envíos duplicados
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando solicitud...";

    // Enviar datos mediante POST a Google Apps Script
    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      mode: "no-cors", // Evita restricciones CORS del navegador con Google Scripts
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(datos),
    });

    // Limpiar el formulario y mostrar mensaje de éxito en verde
    document.getElementById("soporteForm").reset();
    mostrarMensajeFeedback(
      `¡Gracias, ${datos.nombre_completo}! Tu solicitud de soporte para "${datos.tipo_equipo}" se ha registrado correctamente en nuestra base de datos.`,
      "exito"
    );

  } catch (error) {
    console.error("Error al enviar los datos:", error);
    mostrarMensajeFeedback(
      "Ocurrió un error de red al intentar registrar tu solicitud. Por favor, inténtalo de nuevo.",
      "error"
    );
  } finally {
    // Restaurar el botón original
    btnSubmit.disabled = false;
    btnSubmit.textContent = textoOriginal;
  }
}
