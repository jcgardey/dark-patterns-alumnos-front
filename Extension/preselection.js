/** 
 * Verifica si un elemento está preseleccionado (dark pattern: preselection).
 * Casos: <input type="checkbox" checked>, <input type="radio" checked>, <option selected>
 * @param {HTMLElement} element 
 * @returns {boolean}
 */
function isPreselected(element) {
  if (!element) return false;

  if (element.tagName.toLowerCase() === "input") {
    const type = element.getAttribute("type");
    if ((type === "checkbox" || type === "radio") && element.checked) {
      return true;
    }
  }

  if (element.tagName.toLowerCase() === "option" && element.selected) {
    return true;
  }

  return false;
}

/**
 * Devuelve todos los elementos preseleccionados en el documento.
 * @returns {HTMLElement[]}
 */
function getPreselectedElements() {
  const inputs = Array.from(document.querySelectorAll("input[type='checkbox'], input[type='radio']"));
  const options = Array.from(document.querySelectorAll("select option"));
  return inputs.concat(options).filter(isPreselected);
}

// Objeto detector de PRESELECTION
const Preselection = {
  tipo: DP_TYPES.PRESELECTION,
  check: function () {
  console.log("ENTRA A PRESELECTION");

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
clear: function () {},

};