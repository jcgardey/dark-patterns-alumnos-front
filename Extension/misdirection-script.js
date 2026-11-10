/**
 * Luminancia según W3C
 */
function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Contraste entre dos colores
 */
function getContrast(color1, color2) {
  const luminance1 = getLuminance(color1[0], color1[1], color1[2]);
  const luminance2 = getLuminance(color2[0], color2[1], color2[2]);
  return (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);
}

/**
 * Convierte "rgb(r,g,b)" a [r,g,b]
 */
function rgbToArray(rgbString) {
  const result = rgbString.match(/\d+/g);
  return result ? result.map(Number) : null;
}

/**
 * Comprueba si un elemento está oculto
 */
function isHidden(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
  if (typeof element.checkVisibility === 'function') {
    return !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  }
  if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') return true;
  if (element.classList && element.classList.contains('hidden')) return true;
  const styles = window.getComputedStyle(element);
  if (styles.display === 'none' || styles.visibility === 'hidden' || parseFloat(styles.opacity) === 0) return true;
  return element.offsetParent === null && styles.position !== 'fixed';
}

/**
 * Comprueba si un elemento es clickeable y visible
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
    ) return true;
  } catch (e) { }
  return false;
}

/**
 * Devuelve los padres con 2 o más hijos especiales
 */
function getParentOfSpecialNodes(element, especiales) {
  let arrReturn = [];
  let specialChildCounter = 0;
  let special = false;

  // Si este contenedor debe ignorarse, no seguimos recorriendo su árbol
  if (isIgnoredContainer(element)) {
    return {
      arr: [],
      isSpecial: false
    };
  }

  if (element.hasChildNodes()) {
    element.childNodes.forEach((hijo) => {
      const rta = getParentOfSpecialNodes(hijo, especiales);

      if (rta.isSpecial) {
        specialChildCounter++;
      }

      arrReturn = arrReturn.concat(rta.arr);
    });

    if (specialChildCounter >= 2) {
      arrReturn.push(element);
    }
  }

  if (
    isSpecial(element, especiales) ||
    specialChildCounter === 1
  ) {
    special = true;
  }

  return {
    arr: arrReturn,
    isSpecial: special
  };
}

/**
 * Obtiene los primeros hijos especiales de un elemento
 */
function getSpecialNodes(element, especiales) {
  // No buscar elementos especiales dentro
  // de contenedores ignorados.
  if (isIgnoredContainer(element)) {
    return [];
  }

  let arrReturn = [];
  if (element.hasChildNodes()) {
    element.childNodes.forEach((hijo) => {
      if (isSpecial(hijo, especiales)) arrReturn.push(hijo);
      else arrReturn = getSpecialNodes(hijo, especiales).concat(arrReturn);
    });
  }
  return arrReturn;
}

/**
 * Contraste acumulado de hoja a raíz
 */
function contrastarNiveles(raiz, hoja) {
  let actual = hoja;
  const contrastes = [];
  while (actual && actual !== raiz) {
    const styles = window.getComputedStyle(actual);
    const fg = rgbToArray(styles.color);
    const bg = rgbToArray(styles.backgroundColor);
    if (fg && bg) contrastes.push(getContrast(fg, bg));
    actual = actual.parentNode;
  }
  return contrastes.reduce((acc, num) => acc + num, 0);
}

/**
 * Calcula cuántos valores están por encima del promedio + porcentaje
 */
function cantidadDestacados(contrastes, porcentaje) {
  const promedio = contrastes.reduce((a, b) => a + b, 0) / contrastes.length;
  return contrastes.reduce((acc, actual) => {
    if (actual > promedio + promedio * porcentaje) return acc + 1;
    return acc;
  }, 0);
}

function obtenerColorFondoEfectivo(elemento, parent) {
  let actual = elemento;
  while (actual && actual !== document.body) {
    const bg = window.getComputedStyle(actual).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      const arr = rgbToArray(bg);
      if (arr) return arr;
    }
    actual = actual.parentElement;
  }
  return [255, 255, 255];
}

/**
 * Calcula propiedades visuales de un elemento (peso visual)
 */
function calcularPesoVisual(elemento, parent) {
  const styles = window.getComputedStyle(elemento);
  let pesoVisual = 0;

  // Font-size: elementos más grandes son más destacados
  const fontSize = parseFloat(styles.fontSize);
  pesoVisual += fontSize * 0.5;

  // Font-weight: texto más grueso es más prominente
  const fontWeight = parseFloat(styles.fontWeight) || 400;
  pesoVisual += (fontWeight / 700) * 20;

  // Box-shadow: efectos visuales indican énfasis
  const boxShadow = styles.boxShadow;
  if (boxShadow && boxShadow !== 'none') {
    pesoVisual += 15;
  }

  // Z-index: capas superiores son más destacadas
  const zIndex = parseInt(styles.zIndex) || 0;
  if (zIndex > 0) pesoVisual += Math.min(zIndex, 50);

  // Área del elemento: botones grandes son más destacados
  const rect = elemento.getBoundingClientRect();
  const area = rect.width * rect.height;
  pesoVisual += Math.min(area / 1000, 30);

  // Padding/espaciado: más padding indica más importancia
  const paddingTop = parseFloat(styles.paddingTop) || 0;
  const paddingBottom = parseFloat(styles.paddingBottom) || 0;
  const paddingTotal = paddingTop + paddingBottom;
  pesoVisual += paddingTotal * 0.3;

  // Contraste de color efectivo: resuelve fondos transparentes contra el contenedor
  const fgColor = rgbToArray(styles.color);
  let bgArr = rgbToArray(styles.backgroundColor);
  if (!bgArr || styles.backgroundColor === 'rgba(0, 0, 0, 0)' || styles.backgroundColor === 'transparent') {
    bgArr = obtenerColorFondoEfectivo(elemento, parent);
  }
  if (fgColor && bgArr) {
    const contraste = getContrast(fgColor, bgArr);
    pesoVisual += contraste * 6; // Mayor contraste sobre el fondo real = más peso visual
  }

  // Opacidad: elementos más opacos son más visibles
  const opacity = parseFloat(styles.opacity) || 1;
  pesoVisual *= opacity;

  // Background color diferente del fondo: indica más énfasis
  const bg = styles.backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    pesoVisual += 20;
  }

  return pesoVisual;
}

/**
 * Detecta false hierarchy: compara pesos visuales entre elementos
 */
function detectarFalseHierarchy(hijos, parent) {
  if (hijos.length < 2) return 0;

  const pesosVisuales = hijos.map(h => ({
    elemento: h,
    peso: calcularPesoVisual(h, parent)
  }));

  // Ordenar por peso visual
  pesosVisuales.sort((a, b) => b.peso - a.peso);

  // El elemento más destacado vs el segundo más destacado
  const maxPeso = pesosVisuales[0].peso;
  const minPeso = pesosVisuales[pesosVisuales.length - 1].peso;

  // Si hay gran diferencia, hay false hierarchy
  const diferencia = maxPeso - minPeso;
  const ratioMaxMin = maxPeso > 0 ? maxPeso / (minPeso > 0 ? minPeso : 1) : 0;

  return {
    diferencia: diferencia,
    ratio: ratioMaxMin,
    maxPeso: maxPeso,
    minPeso: minPeso,
    pesosVisuales: pesosVisuales
  };
}

function isIgnoredContainer(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const tag = element.nodeName.toLowerCase();

  // Tags que no queremos analizar
  const ignoredTags = [
    'nav',
    'header',
    'footer'
  ];

  if (ignoredTags.includes(tag)) {
    return true;
  }

  // Revisamos atributos relevantes
  const id = (element.id || '').toLowerCase();

  const className =
    typeof element.className === 'string'
      ? element.className.toLowerCase()
      : '';

  const role = (
    element.getAttribute('role') || ''
  ).toLowerCase();

  const ariaLabel = (
    element.getAttribute('aria-label') || ''
  ).toLowerCase();

  const testId = (
    element.getAttribute('data-testid') || ''
  ).toLowerCase();

  const dataTest = (
    element.getAttribute('data-test') || ''
  ).toLowerCase();

  const dataCy = (
    element.getAttribute('data-cy') || ''
  ).toLowerCase();

  const attributes = [
    id,
    className,
    role,
    ariaLabel,
    testId,
    dataTest,
    dataCy
  ].join(' ');

  // Usamos palabras/segmentos relacionados con contenedores
  const ignoredPatterns = [
    // Menús y Navegación
    /\bnav\b/i, /\bnavbar\b/i, /\bnav-bar\b/i, /\bnavigation\b/i,
    /\bmenu\b/i, /\btoolbar\b/i, /\bsidebar\b/i, /\bside-bar\b/i,
    /\bheader\b/i, /\bfooter\b/i, /\bfootnote\b/i, /\bfootnotes\b/i,
    /\bfoot-bar\b/i, /\bfootbar\b/i, /\bfootnav\b/i, /\bfoot-nav\b/i,
    /\bfoot-menu\b/i, /\bfootmenu\b/i, /\bbreadcrumb\b/i, /\bbreadcrumbs\b/i,

    // Filtros y Búsqueda
    /\bfilter\b/i, /\bfilters\b/i, /\bfiltro\b/i, /\bfiltros\b/i,
    /\bsort\b/i, /\bsorting\b/i, /\bordered\b/i, /\bsearch\b/i,

    // Paginación y Controles genéricos
    /\bpaginat(ion|ed|ing|or)\b/i, /\bpaginac(ion|ion|es)\b/i,
    /\bpager\b/i, /\bpage-list\b/i, /\bpage-numbers?\b/i,
    /\bprev(ious)?\b/i, /\bnext\b/i, /\bsiguiente\b/i, /\banterior\b/i,
    /\bload-more\b/i, /\bcargar-mas\b/i, /\bver-mas\b/i
  ];

  return ignoredPatterns.some(pattern =>
    pattern.test(attributes)
  );
}

/**
 * Detector de Misdirection
 */
const Misdirection = {
  destacadosEncimaPromedio: 0,
  umbralCantidadDestacados: 0.5,
  umbralDiferenciaVisual: 15, // Diferencia mínima de peso visual (más sensible a sutilezas)
  umbralRatioVisual: 1.2, // Ratio mínimo entre elemento más y menos destacado
  clickeables: ['a', 'button'],
  tipo: DP_TYPES.MISDIRECTION,
  detectados: new Set(),
  check: function () {
    // console.log("Analizando misdirection...");
    const specialParents = [
      ...new Set(
        getParentOfSpecialNodes(
          document.body,
          this.clickeables
        ).arr
      )
    ];

    const index = specialParents.findIndex(elem => elem === document.body);
    if (index > -1) { // only splice array when item is found
      specialParents.splice(index, 1); // 2nd parameter means remove one item only
    }

    specialParents.forEach(parent => {
      const hijosRaw = getSpecialNodes(parent, this.clickeables);
      if (hijosRaw.length < 2) return;

      const seenHrefs = new Set();
      const hijos = hijosRaw.filter(el => {
        const href = el.getAttribute('href') || el.href;

        if (!href) {
          return true;
        }

        if (seenHrefs.has(href)) {
          return false;
        }

        seenHrefs.add(href);
        return true;
      });

      if (hijos.length < 2) return;

      // Analisis de false hierarchy con contraste efectivo integrado en los pesos visuales
      const falseHierarchy = detectarFalseHierarchy(hijos, parent);

      const hayFalseHierarchy = falseHierarchy.diferencia >= this.umbralDiferenciaVisual &&
        falseHierarchy.ratio >= this.umbralRatioVisual;

      // Se detecta misdirection si existe falsa jerarquía significativa (potenciada por el contraste)
      if (hayFalseHierarchy) {
        if (!this.detectados.has(parent)) {
          this.detectados.add(parent);
          console.log("%c[DP Detector] MISDIRECTION detectado:", "color: #0400FF; font-weight: bold; font-size: 11px;", parent, {
            hijos: hijos.length,
            diferencia: falseHierarchy.diferencia.toFixed(2),
            ratio: falseHierarchy.ratio.toFixed(2),
            textos: hijos.map(h => h.textContent.trim().substring(0, 30))
          });
        }
      }
    });
  },
  clear: function () {
    this.detectados.clear();
    desresaltarElementoConTipo(this.tipo);
  }
};
