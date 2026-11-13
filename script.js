/**
 * PixelZone - Lógica de interfaz, validación y preparación para Supabase
 * Archivo 100% JavaScript nativo (sin librerías ni servidores requeridos).
 */

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

      // Llamar a la función preparada para futura integración con Supabase
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
 * @param {"demo" | "error"} tipo - Estilo de alerta.
 */
function mostrarMensajeFeedback(mensaje, tipo) {
  const feedbackEl = document.getElementById("formFeedback");
  if (!feedbackEl) return;

  feedbackEl.textContent = mensaje;
  feedbackEl.className = `form-feedback ${tipo}`;
  feedbackEl.hidden = false;
}

/**
 * ============================================================================
 * FUNCIÓN PREPARADA PARA CONEXIÓN FUTURA CON SUPABASE
 * ============================================================================
 * Actualmente opera en modo demostración local sin base de datos conectada.
 * Cuando integres Supabase, podrás importar el cliente e insertar `datos` en
 * tu tabla (por ejemplo: `supabase.from('solicitudes_soporte').insert([datos])`).
 *
 * @param {Object} datos - Payload validado listo para enviarse a Supabase.
 */
async function enviarSolicitud(datos) {
  // Inspección en consola para verificar la estructura lista para Supabase
  console.info("[PixelZone - Modo Demostración] Payload validado para Supabase:", datos);

  // Mensaje explícito de demostración sin afirmar que los datos fueron guardados
  mostrarMensajeFeedback(
    `Modo demostración activo: los datos de "${datos.nombre_completo}" (${datos.tipo_equipo}) pasaron la validación correctamente. Aún no hay conexión con Supabase, por lo que esta solicitud no se ha guardado en ninguna base de datos.`,
    "demo"
  );
}
