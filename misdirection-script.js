// Obtengo la luminancia según el estándar de
//contraste de luminancia basado en la fórmula de luminosidad relativa del W3C (fue un dolor de cabeza :c)
// LINK: https://www.w3.org/WAI/GL/wiki/Relative_luminance

//TODO: SELECCIONAR BUTTONS Y PROBAR MISSDIRECTION

function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255; // v = v / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// calculo el contraste entre dos colores
function getContrast(color1, color2) {
  const luminance1 = getLuminance(color1[0], color1[1], color1[2]);
  const luminance2 = getLuminance(color2[0], color2[1], color2[2]);

  return (
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05)
  );
}

// obtengo el color de fondo y el color de texto
// fuente: https://www.w3schools.com/jsref/jsref_getcomputedstyle.asp
function getColor(element) {
  // getComputedStyle es un estilo computado, osea es una propiedad del obj. window que te devuelve todos
  // los estilos que tiene un elemento html
  const style = window.getComputedStyle(element);
  // extraigo con la exp regular todos los nums del string del color de fondo
  // haria algo como esto, si es (255, 255, 255) devuelve [255, 255]
  const backgroundColor = style.backgroundColor.match(/\d+/g).map(Number); // fondo
  const color = style.color.match(/\d+/g).map(Number); // texto

  return { backgroundColor, color };
}

const checkMisdirection = () => {
  const elements = document.querySelectorAll('.plan-card, button'); // Selecciona las plan-card como los botones

  const contrasts = []; // almacena constrastes y buttons

  elements.forEach((element) => {
    if (element instanceof HTMLElement && element.innerText !== 'Siguiente') {
      // chequea que sea un elemento HTML
      const { backgroundColor, color } = getColor(element);
      const contrast = getContrast(backgroundColor, color);
      contrasts.push({ element, contrast }); // guarda el elemento y su contraste

      console.log(`${element.tagName}:`, {
        'Color de Fondo': backgroundColor,
        'Color de Texto': color,
        Contraste: contrast.toFixed(2),
      });
    }
  });

  // Comparar contrastes de planes
  const freeElement = document.querySelector('.free');
  const proElement = document.querySelector('.pro');
  const premiumElement = document.querySelector('.premium');

  if (freeElement && proElement && premiumElement) {
    const freeContrast = getContrast(
      getColor(freeElement).backgroundColor,
      getColor(freeElement).color
    );
    const proContrast = getContrast(
      getColor(proElement).backgroundColor,
      getColor(proElement).color
    );
    const premiumContrast = getContrast(
      getColor(premiumElement).backgroundColor,
      getColor(premiumElement).color
    );

    if (proContrast > freeContrast || premiumContrast > freeContrast)
      console.log(
        'El plan Pro o el plan Premium son más llamativos que el plan Free.'
      );
    else console.log('El plan Free es más llamativo que Pro y Premium.');
  }

  // compara contrastes de botones
  const buttonContrasts = contrasts.filter(
    (item) => item.element.tagName === 'BUTTON'
  ); // filtro porque solo me interesan los botones

  if (buttonContrasts.length > 0) {
    // calculo el contraste maximo
    const mostAttractiveButton = buttonContrasts.reduce((max, current) =>
      current.contrast > max.contrast ? current : max
    );
    console.log(`El botón más llamativo es:`, {
      Elemento: mostAttractiveButton.element,
      Contraste: mostAttractiveButton.contrast.toFixed(2),
    });
  } else {
    console.warn('No se encontraron botones para evaluar el contraste.');
  }
};

const clickeables = ['a', 'button'];
/**
 * @param {ChildNode} element
 * @returns {boolean}
 */
function isSpecial(element) {
  try {
    if (
      element.nodeName !== '#text' &&
      (element.getAttribute('onclick') != null ||
        element.getAttribute('href') != null ||
        clickeables.includes(element.nodeName.toLowerCase()))
    ) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

/**
 *
 * @param {ChildNode} element
 * @returns {{arr: ChildNode[],isSpecial:boolean}}
 */
function getParentOfSpecialNodes(element) {
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
  if (isSpecial(element) || specialChildCounter == 1) special = true;

  return { arr: arrReturn, isSpecial: special }; // retorno padres especiales y mi flag de especialidad
}

/**
 *
 * @param {ChildNode} element
 * @returns {ChildNode[]}
 */
function getSpecialNodes(element) {
  // arreglo acumulador de especiales por debajo element
  let arrReturn = [];

  if (element.hasChildNodes()) {
    // si tengo hijos los analizo
    element.childNodes.forEach((hijo) => {
      // si es especial lo guardo y no sigo,
      // solo quiero los primeros hijos especiales
      if (isSpecial(hijo)) {
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
 *
 * @param {ChildNode[]} nodes
 * @param {string} color
 */
function pintar(nodes, color) {
  console.log('pinta: ', nodes);
  if (nodes.length > 0) {
    nodes.forEach((node) => {
      try {
        pintar(node.childNodes, color);
        Object.assign(node.style, { background: `${color}` });
      } catch (e) {
        console.log(node + ' falla: ' + e);
      }
    });
  }
}

function rgbToArray(rgbString) {
  // Usa una expresión regular para capturar los números dentro de "rgb(r, g, b)"
  const result = rgbString.match(/\d+/g);
  // Convierte los valores capturados de string a números enteros y retorna como array
  return result ? result.map(Number) : null;
}

/**
 *
 * @param {ChildNode} raiz
 * @param {ChildNode} hoja
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

const comprobarNodos = () => {
  // obtencion de padres especiales
  sp = getParentOfSpecialNodes(document.body).arr;

  // contrastes por padre y por rama
  contrastes = [];

  sp.forEach((parent) => {
    contraste_hijos = [];
    getSpecialNodes(parent).forEach((hijo) => {
      contraste_hijos.push(contrastarNiveles(parent, hijo));
    });
    contrastes.push(contraste_hijos);
  });

  // filtrado de elementos segun contrastes y umbral del 60%
  filtrados = [];

  contrastes.forEach((elems, idx) => {
    if (cantidadDestacados(elems) > elems.length * 0.66) {
      console.log(idx);
      filtrados.push(idx);
    }
  });

  // marcando las coincidencias
  filtrados.forEach((idx) => {
    //pintar([sp[idx]],'#FF0000');
    resaltarElementoConTexto(sp[idx], 'Cuidado con el MISDIRECTION!');
  });
};

function resaltarElementoConTexto(elemento, texto) {
  // Aplica el estilo al borde del elemento
  elemento.style.border = '6px dashed #fad482';
  elemento.style.position = 'relative'; // Para posicionar el globo correctamente

  // Crea el globo de texto
  const globoTexto = document.createElement('div');
  const p = document.createElement('p');
  p.textContent = texto;
  p.style.width = '100%';
  p.style.lineHeight = '1.5';
  globoTexto.appendChild(p);

  // Crea el botón de cerrar (la cruz)
  const botonCerrar = document.createElement('span');
  botonCerrar.innerHTML = '&times;'; // El símbolo de la cruz (×)
  Object.assign(botonCerrar.style, {
    cursor: 'pointer',
    color: 'black',
    fontWeight: 'bold',
    fontSize: '30px',
  });

  // Función para cerrar el globo
  botonCerrar.addEventListener('click', function () {
    elemento.removeChild(globoTexto);
  });

  const rect = elemento.getBoundingClientRect();

  Object.assign(globoTexto.style, {
    position: 'absolute',
    top: `${rect.height}px`, // Ajusta para que el globo aparezca arriba del elemento
    left: 0,
    //transform: 'translateX(-50%)',
    padding: '10px',
    backgroundColor: '#fad482',
    color: 'black',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
    fontSize: '14px',
    whiteSpace: 'normal',
    minWidth: '120px', // Para que haya espacio para el botón de cerrar
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  });

  // Añadir el botón de cerrar al globo
  globoTexto.appendChild(botonCerrar);

  // Agrega el globo como hijo del elemento
  elemento.appendChild(globoTexto);
}

/**
 *
 * @param {num[]} contrastes
 */
function cantidadDestacados(contrastes) {
  promedio = contrastes.reduce((acc, cont) => acc + cont) / contrastes.length;
  return contrastes.reduce((acc, actual) => {
    if (actual > promedio) return acc + 1;
    else return acc;
  }, 0);
}

// para que la extension corra el algoritmo
comprobarNodos();

//document.addEventListener("DOMContentLoaded",comprobarNodos);

//document.addEventListener("DOMContentLoaded", checkMisdirection);
