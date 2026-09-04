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
  let actual = element;
  while (actual && actual !== document.body) {
    if (
      (actual.classList && actual.classList.contains('hidden')) ||
      actual.getAttribute('hidden') === 'true' ||
      window.getComputedStyle(actual).display === 'none' ||
      window.getComputedStyle(actual).visibility === 'hidden'
    ) return true;
    actual = actual.parentNode;
  }
  return false;
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
  } catch (e) {}
  return false;
}

/**
 * Devuelve los padres con 2 o más hijos especiales
 */
function getParentOfSpecialNodes(element, especiales) {
  let arrReturn = [];
  let specialChildCounter = 0;
  let special = false;

  if (element.hasChildNodes()) {
    element.childNodes.forEach((hijo) => {
      const rta = getParentOfSpecialNodes(hijo, especiales);
      if (rta.isSpecial) specialChildCounter++;
      arrReturn = arrReturn.concat(rta.arr);
    });
    if (specialChildCounter >= 2) arrReturn.push(element);
  }

  if (isSpecial(element, especiales) || specialChildCounter === 1) special = true;

  return { arr: arrReturn, isSpecial: special };
}

/**
 * Obtiene los primeros hijos especiales de un elemento
 */
function getSpecialNodes(element, especiales) {
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

/**
 * Calcula propiedades visuales de un elemento (peso visual)
 */
function calcularPesoVisual(elemento) {
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

  // Contraste de color: colores más contrastantes son más visibles
  const fgColor = rgbToArray(styles.color);
  const bgColor = rgbToArray(styles.backgroundColor);
  if (fgColor && bgColor) {
    const contraste = getContrast(fgColor, bgColor);
    pesoVisual += contraste * 5; // Mayor contraste = más peso visual
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
function detectarFalseHierarchy(hijos) {
  if (hijos.length < 2) return 0;

  const pesosVisuales = hijos.map(h => ({
    elemento: h,
    peso: calcularPesoVisual(h)
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

/**
 * Detector de Misdirection
 */
const Misdirection = {
  destacadosEncimaPromedio: 0.2,
  umbralCantidadDestacados: 0.5,
  umbralDiferenciaVisual: 15, // Diferencia mínima de peso visual (más sensible a sutilezas)
  umbralRatioVisual: 1.2, // Ratio mínimo entre elemento más y menos destacado
  clickeables: ['a', 'button'],
  tipo: DP_TYPES.MISDIRECTION,
  detectados: new Set(),
  check: function() {
    // console.log("Analizando misdirection...");
    const specialParents = getParentOfSpecialNodes(document.body, this.clickeables).arr;

    specialParents.forEach(parent => {
      const hijos = getSpecialNodes(parent, this.clickeables);
      if (hijos.length < 2) return;

      // Analisis de contraste visual que estaba en el código original
      const contrastes = hijos.map(h => contrastarNiveles(parent, h));
      const destacados = cantidadDestacados(contrastes, this.destacadosEncimaPromedio);

      // Analisis de false hierarchy comparando el peso visual de los hijos con cosas como el tamaño de letra y cosas asi
      const falseHierarchy = detectarFalseHierarchy(hijos);
      
      // Con los dos analisis ahora usamos la heuristica mejorada
      // 1. Hay suficientes elementos con alto contraste por encima del promedio (destaque visual)
      const hayAltoContraste = destacados >= hijos.length * this.umbralCantidadDestacados;
      
      // 2. Hay diferencia visual significativa entre elementos teniendo en cuenta el peso entre el más y menos destacado (false hierarchy)
      const hayFalseHierarchy = falseHierarchy.diferencia >= this.umbralDiferenciaVisual &&
                                falseHierarchy.ratio >= this.umbralRatioVisual;

      // Imprimir info si hay algo interesante que reportar
      if (hijos.length === 2 || hayFalseHierarchy) {
        console.log(`Misdirection Check - ${hijos.length} elementos:`, {
          hayAltoContraste,
          hayFalseHierarchy,
          diferencia: falseHierarchy.diferencia.toFixed(2),
          ratio: falseHierarchy.ratio.toFixed(2),
          destacados,
          textos: hijos.map(h => h.textContent.trim().substring(0, 30)),
          pesos: falseHierarchy.pesosVisuales.map(p => p.peso.toFixed(2))
        });
      }

      // Se detecta misdirection si cumple ambas condiciones
      if (hayFalseHierarchy && hayAltoContraste) {
        // resaltarElementoConTexto(parent, this.tipo);
        this.detectados.add(parent);
      }
    });
  },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
};
