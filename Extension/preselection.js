/**
 * Detector de Dark Pattern: PRESELECTION
 * Detecta elementos marcados por defecto (checkbox, radio, option)
 * o seleccionados automáticamente por scripts después de la carga.
 * Incluye soporte para sitios dinámicos (React, Vue, etc.)
 */

// Mapa para guardar el estado inicial de cada input/option
const initialStates = new WeakMap();

//Tomamos el estado inicial de todos los elementos que nos importan del DOM
function snapshotInitialStates() {
  const elems = document.querySelectorAll("input[type='checkbox'], input[type='radio'], select option");
  elems.forEach(elem => {
    const isSelected = (elem.tagName.toLowerCase() === "option") ? elem.selected : elem.checked;
    if (!initialStates.has(elem)) {
      initialStates.set(elem, isSelected);
    }
  });
}

/**
 * Determina si un elemento está o fue preseleccionado sin acción del usuario
 * @param {HTMLElement} element 
 * @returns {boolean}
 */
function isPreselected(element) {
  if (!element) return false;

  const tag = element.tagName.toLowerCase();

  if (tag === "input") {
    const type = element.getAttribute("type");
    if (type === "checkbox" || type === "radio") {
      // Opcion 1: marcado por defecto en el HTML
      if (element.defaultChecked) return true;

      // Opcoin 2: marcado después de la carga
      const initially = initialStates.get(element);
      if (initially === false && element.checked === true) return true;
    }
  }

  if (tag === "option") {
    // Opcion 1: seleccionado por defecto
    if (element.defaultSelected) return true;

    // Opcion 2: seleccionado luego de la carga
    const initially = initialStates.get(element);
    if (initially === false && element.selected === true) return true;
  }

  return false;
}


function getPreselectedElements() {
  const inputs = Array.from(document.querySelectorAll("input[type='checkbox'], input[type='radio']"));
  const options = Array.from(document.querySelectorAll("select option"));
  return inputs.concat(options).filter(isPreselected);
}

const Preselection = {
  tipo: DP_TYPES.PRESELECTION,

  init: function () {
    snapshotInitialStates();
  },

  check: function () {
    console.log("🔍 Ejecutando detección de PRESELECTION...");

    const preselectedElems = getPreselectedElements();

    preselectedElems.forEach(elem => {
      let target = elem;

      if (elem.tagName.toLowerCase() === "input" && elem.closest("label")) {
        target = elem.closest("label");
      }

      if (elem.tagName.toLowerCase() === "option" && elem.closest("select")) {
        target = elem.closest("select");
      }

      resaltarElementoConTexto(target, this.tipo);
    });
  },

  clear: function () {
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // Toma Snapshot del estado inicial de la pagina
  Preselection.init();

  // miramos inserciones dinamicas como react o js
  const observer = new MutationObserver(mutations => {
    let newElems = false;

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches && node.matches("input[type='checkbox'], input[type='radio'], select option")) {
            newElems = true;
          }
          if (node.querySelector && node.querySelector("input[type='checkbox'], input[type='radio'], select option")) {
            newElems = true;
          }
        }
      });
    });

    // Si aparecen nuevos elementos, actualizar el snapshot y volver a chequear
    if (newElems) {
      snapshotInitialStates();
      Preselection.check();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Esperar un poco tras la carga (por scripts que inyectan inputs tardíos)
  setTimeout(() => {
    Preselection.check();
  }, 2500);
});
