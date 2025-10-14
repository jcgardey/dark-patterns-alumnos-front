/**
 * Luminancia según el estándar de contraste de luminancia basado en la fórmula de luminosidad relativa del W3C.
 * LINK: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns {number}
 */
function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255; // v = v / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculo del contraste entre dos colores.
 * @param {number[]} color1 
 * @param {number[]} color2 
 * @returns {number}
 */
function getContrast(color1, color2) {
  const luminance1 = getLuminance(color1[0], color1[1], color1[2]);
  const luminance2 = getLuminance(color2[0], color2[1], color2[2]);

  return (
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05)
  );
}

/**
 * Comprueba si un elemento está oculto subiendo por él hasta la raiz.
 * @param {ChildNode} element 
 * @returns {boolean}
 */
function isHidden(element) {
  let actual = element;
  let raiz = document.body;
  let isHidden = false;

  while (actual !== raiz && actual != null && !isHidden) {
    if (
      (actual.classList && actual.classList.contains('hidden')) ||
      actual.getAttribute('hidden') === 'true' // Verificar si 'hidden' es exactamente 'true'
    ) {
      isHidden = true;
    }
    actual = actual.parentNode; // Subir al elemento padre
  }

  return isHidden;
}
 
/**
 * Comprueba si un elemento es clickeable y no está oculto.
 * @param {ChildNode} element
 * @param {string[]} especiales Arreglo de strings con las etiquetas que se consideran especiales
 * @returns {boolean}
 */
function isSpecial(element, especiales) {
  try {
    if (
      element.nodeName !== '#text' &&
      !isHidden(element) && (
        element.getAttribute('onclick') != null ||
        element.getAttribute('href') != null ||
        especiales.includes(element.nodeName.toLowerCase())
      )
    ) {
      return true;
    }
  } catch (e) {
    //console.log(e);
  }
  return false;
}
 
/**
 * Dado un elemento recupera todos los nodos raiz de subarboles con 2 o más hijos especiales.
 * @param {ChildNode} element
 * @param {string[]} especiales Arreglo de strings con las etiquetas que se consideran especiales
 * @returns {{arr: ChildNode[],isSpecial:boolean}}
 */
function getParentOfSpecialNodes(element, especiales) {
  let arrReturn = []; // nodos con hijos especiales
  let special = false; // flag de especialidad del nodo actual

  let specialChildCounter = 0; // contador de hijos especiales

  if (element.hasChildNodes()) {
    // si mi nodo tiene hijos los analizo
    element.childNodes.forEach((hijo) => {
      rta = getParentOfSpecialNodes(hijo);
      if (rta.isSpecial) {
        specialChildCounter++;
      }
      arrReturn = arrReturn.concat(rta.arr);
    });

    // si tengo 2 o más hijos especiales, soy un nodo padre de especiales
    if (specialChildCounter >= 2) arrReturn.push(element);
  }

  // solo si soy especial o tengo un hijo especial, "soy especial"
  if (isSpecial(element, especiales) || specialChildCounter == 1) special = true;

  return { 
    arr: arrReturn, 
    isSpecial: special 
  }; // retorno padres especiales y flag de especialidad actual
}

 
/**
 * Dado un elemento, se identifican los primeros hijos que se consideran especiales.
 * @param {ChildNode} element
 * @param {string[]} especiales Arreglo de strings con las etiquetas que se consideran especiales
 * @returns {ChildNode[]}
 */
function getSpecialNodes(element, especiales) {
  // arreglo acumulador de especiales por debajo element
  let arrReturn = [];

  if (element.hasChildNodes()) {
    // si tengo hijos los analizo
    element.childNodes.forEach((hijo) => {
      // si es especial lo guardo y no sigo,
      // solo quiero los primeros hijos especiales
      if (isSpecial(hijo, especiales)) {
        arrReturn.push(hijo);
      } else {
        // si no es especial, arrastro el arreglo de especiales
        arrReturn = getSpecialNodes(hijo).concat(arrReturn);
      }
    });
  }
  // retorno especiales acumulados
  return arrReturn;
}

/**
 * Convierte un string del tipo **"rgb(r,g,b)"** a un arreglo numérico **[r, g, b]**.
 * @param {string} rgbString 
 * @returns {number[] | null}
 */
function rgbToArray(rgbString) {
  const result = rgbString.match(/\d+/g);
  return result ? result.map(Number) : null;
}

 
/**
 * Dada la raiz de un árbol o subarbol y una hoja, se recorre la rama desde abajo hacia arriba
 * obteniendo los contrastes en cada nodo para luego obtener un acumulado de la totalidad de
 * contrastes de la rama.
 * @param {ChildNode} raiz
 * @param {ChildNode} hoja
 * @returns {number}
 */
function contrastarNiveles(raiz, hoja) {
  let actual = hoja;
  let contrastes = [];
  while (actual !== raiz) {
    const computedStyles = window.getComputedStyle(actual);
    contrastes.push(
      getContrast(
        rgbToArray(computedStyles.color),
        rgbToArray(computedStyles.backgroundColor)
      )
    );
    actual = actual.parentNode;
  }
  return contrastes.reduce((acumulador, num) => acumulador + num, 0);
}
 
/**
 * Dado un arreglo numérico y un porcentaje entre 1.0 y 0.0,
 * se comprueba cuantos números del arreglo están por encima del
 * promedio + promedio * porcentaje
 * @param {number[]} contrastes
 * @param {number} porcentaje 
 * @returns {number}
 */
function cantidadDestacados(contrastes, porcentaje) {
  promedio = contrastes.reduce((acc, cont) => acc + cont) / contrastes.length;
  return contrastes.reduce((acc, actual) => {
    if (actual > promedio + promedio * porcentaje) return acc + 1;
    else return acc;
  }, 0);
}

// Objeto a usar en extension.js
const Misdirection = {
  destacadosEncimaPromedio: 0.2,
  umbralCantidadDestacados: 0.5,
  clickeables: ['a', 'button'],
  tipo: DP_TYPES.MISDIRECTION,
  detectados: [],
  check: function() {
    console.log("ENTRA A MISDIRECTION")
    // obtencion de padres especiales
    specialParents = getParentOfSpecialNodes(document.body, this.clickeables).arr;

    // contrastes por rama de hijo a padre
    contrastesXRama = [];

    specialParents.forEach((parent) => {
      contraste_hijos = [];
      getSpecialNodes(parent, this.clickeables).forEach((hijo) => {
        contraste_hijos.push(contrastarNiveles(parent, hijo));
      });
      contrastesXRama.push(contraste_hijos);
    });

    // filtrado de elementos segun si la cantidad de elementos destacados encima de cierto umbral
    contrastesFiltrados = [];

    contrastesXRama.forEach((elems, idx) => {
      if (cantidadDestacados(elems, this.destacadosEncimaPromedio) >= elems.length * this.umbralCantidadDestacados) {
        contrastesFiltrados.push(idx);
      }
    });

    // marcando las coincidencias
    contrastesFiltrados.forEach((idx) => {
      //TO-DO: eliminar este if
      if (specialParents[idx].id !== 'root') {
        this.detectados.push(specialParents[idx]);
      }
    });
  },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}
