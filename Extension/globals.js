/**
 * Este archivo tiene la finalidad de definir todas las estructuras y variables globales necesarias a ejecutarse
 * antes que cualquier script para evitar "not defined"
 */
const DP_TYPES = {
    SHAMING: 'SHAMING',
    URGENCY: 'URGENCY',
    MISDIRECTION: 'MISDIRECTION',
    HIDDENCOST: 'HIDDENCOST',
    PRESELECTION: 'PRESELECTION',
    SCARCITY: 'SCARCITY'
}

const DP_TEXT = {
  SHAMING: 'Posible forma de persuasión',
  URGENCY: 'Podría ser falso',
  MISDIRECTION: 'Posible acción oculta',
  HIDDENCOST: 'Posible precio oculto',
  PRESELECTION: 'Cuidado, opción preseleccionada',
  SCARCITY: 'Podria no ser cierto'
};

const DP_DESCRIPTION = {
  SHAMING: 'Posible forma de persuasión',
  URGENCY: 'Podría ser falso',
  MISDIRECTION: 'Posible acción oculta',
  HIDDENCOST: 'Este precio podría ser más alto de lo que se indica',
  PRESELECTION: 'Cuidado, opción preseleccionada',
  SCARCITY: 'Podria no ser cierto'
}

let elementosResaltados = [];
let cartelInfoDarkPattern = crearCartelInfoDarkPattern();
alApuntarHaciaAlgúnResaltadoMostrarCartel(elementosResaltados, cartelInfoDarkPattern);

/**
 * 
 * @param {Element} elemento 
 * @param {string} tipo - Usar DP_TYPES para no tener errores
 * @returns 
 */
async function resaltarBorde(elemento, tipo) {
  // Chequeo simple para saber si ya fue resaltado
  if (elemento == undefined || elemento.dataset.tipoDeDarkPattern === tipo) return;
  
  // console.log("Resaltando borde:", elemento, "Tipo:", tipo);
  
  // Aplica el estilo al borde del elemento
  elemento.style.border = `3px dashed ${(await chrome.storage.sync.get('dpColores')).dpColores[tipo]}`;
  elemento.dataset.tipoDeDarkPattern = tipo;
}

/**
 * 
 * @param {Element} elemento 
 * @param {string} tipo Usar DP_TYPES para no tener errores
 * @returns 
 */

// Función para obtener un selector único para un elemento
function getUniqueSelector(elemento) {
  if (elemento.id) return `#${elemento.id}`;
  let path = '';
  let el = elemento;
  while (el && el.nodeType === 1 && el !== document.body) {
    let index = 1;
    let sibling = el.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === el.tagName) index++;
      sibling = sibling.previousElementSibling;
    }
    path = `/${el.tagName.toLowerCase()}[${index}]` + path;
    el = el.parentElement;
  }
  return '/html/body' + path;
}

function resaltarElementoConTexto(elemento, tipo) {
  let ignoreList = [];
  try {
    ignoreList = JSON.parse(localStorage.getItem('ignoreDP')) || [];
  } catch (e) {
    ignoreList = [];
  }
  const selector = getUniqueSelector(elemento);
  if (ignoreList.includes(selector)) {
    console.info("Elemento ignorado: ", elemento, "Tipo: " + tipo);
    return;
  }
  if (elemento == undefined || elemento.dataset.tipoDeDarkPattern === tipo) return;

  // console.info("Resaltando elemento: ", elemento, "Tipo: " + tipo);
  
  resaltarBorde(elemento, tipo);
  elemento.style.position = 'relative'; // Para posicionar el globo correctamente

  elementosResaltados.push(elemento);
}

/**
 *
 * @param {string} tipo Patrón a desresaltar
 */
function desresaltarElementoConTipo(tipo) {
  // console.log("Desresaltando elementos del tipo:", tipo);
  
  // Buscar todos los elementos que fueron resaltados con este tipo
  const elementos = document.querySelectorAll(`.${tipo}`);
  
  elementos.forEach((elemento) => {
    // Quitar borde y clase
    elemento.style.border = '';
    elemento.dataset.tipoDeDarkPattern = '';

    //// Buscar y eliminar el globo de texto relacionado
    //const hijos = Array.from(elemento.children);
    //hijos.forEach((hijo) => {
    //  if (hijo.classList && hijo.classList.contains('resaltado-dark-pattern')) {
    //    elemento.removeChild(hijo);
    //  }
    //});
  });
}

function inyectarFuenteEnCSS() {
  const fontUrlRegular = chrome.runtime.getURL('fonts/SpaceMono-Regular.ttf');
  const fontUrlBold = chrome.runtime.getURL('fonts/SpaceMono-Bold.ttf');
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Space Mono';
      font-weight: 400;
      src: url('${fontUrlRegular}') format('woff2');
    }
    @font-face {
      font-family: 'Space Mono';
      font-weight: 700;
      src: url('${fontUrlBold}') format('woff2');
    }
  `;
  document.head.appendChild(style);
}

function crearCartelInfoDarkPattern() {
  cartelNuevo = document.createElement('span');
  //cartelNuevo.classList.add('resaltado-dark-pattern');
  // Agrega texto al globo
  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('menu/imagenes/icono.png');
  Object.assign(logo.style, {
    width: '3em',
    marginTop: '-2em',
    padding: '0.2em',
    borderRadius: '1.5em'
  });
  cartelNuevo.appendChild(logo);
  const texto = document.createElement('div');
  Object.assign(texto.style, {
    width: '100%',
    lineHeight: '1.5',
    margin: '0',
    fontFamily: '"Space Mono", monospace'
  });
  const titulo = document.createElement('p');
  titulo.id = 'TituloDP';
  Object.assign(titulo.style, {
    fontSize: '1.25em',
    fontFamily: 'inherit',
    margin: '0'
  });
  const descripcion = document.createElement('p');
  descripcion.id = 'DescripcionDP';
  Object.assign(descripcion.style, {
    fontSize: '1em',
    fontFamily: 'inherit',
    margin: '0'
  });
  texto.appendChild(titulo);
  texto.appendChild(descripcion);
  cartelNuevo.appendChild(texto);

  // Crea el botón de cerrar (la cruz)
  const botonCerrar = document.createElement('button');
  botonCerrar.innerHTML = 'Dejar de marcar este caso';
  Object.assign(botonCerrar.style, {
    cursor: 'pointer',
    color: '#a00000',
    fontWeight: 'bold',
    fontSize: '14px',
    border: '1px solid #702020',
    borderRadius: '0.5em',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: '0 0.5em'
  });

  // Función para cerrar el globo
  botonCerrar.addEventListener('click', function () {
    if (cartelNuevo.elementoApuntado) {
      const elementoApuntado = cartelNuevo.elementoApuntado;
      const respuesta = confirm("¿Queres que este caso no se detecte más?");
      // Si el usuario confirma, se elimina el resaltado y se guarda en localStorage para no detectarlo más
      if (respuesta) {
        // Quitar borde y clase solo de este tipo
        elementoApuntado.style.border = '';
        elementoApuntado.dataset.tipoDeDarkPattern = '';
        // Eliminar el globo de texto
        if (cartelNuevo.parentNode === elementoApuntado) {
          elementoApuntado.removeChild(cartelNuevo);
        }

        // Traigo la lista de ignorados del localStorage
        let ignoreList = [];
        try {
          ignoreList = JSON.parse(localStorage.getItem('ignoreDP')) || [];
        } catch (e) {
          ignoreList = [];
        }
        const selector = getUniqueSelector(elementoApuntado);
        ignoreList.push(selector);
        // Guardar la lista de ignorados en localStorage
        localStorage.setItem('ignoreDP', JSON.stringify(ignoreList));
      } else {
        // Solo cierra el globo, pero deja el resaltado
        cartelNuevo.removeChild(descripcion);
        cartelNuevo.removeChild(botonCerrar);
        if (!cartelNuevo.hasChildNodes()) cartelNuevo.remove();
      }
    }
  })

  Object.assign(cartelNuevo.style, {
    position: 'absolute',
    zIndex: '10000', // Asegurar que esté por encima de otros elementos
    padding: '10px',
    color: 'black',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
    fontSize: '16px',
    whiteSpace: 'normal',
    minWidth: '120px', // Para que haya espacio para el botón de cerrar
    textAlign: 'center',
    opacity: '0',
    visibility: 'hidden',
    transition: 'opacity .2s ease, visibility .2s ease'
  });

  // Añadir el botón de cerrar al globo
  cartelNuevo.appendChild(botonCerrar);

  // Agrega el globo como hijo del elemento
  document.body.appendChild(cartelNuevo);
  return cartelNuevo;
}

function alApuntarHaciaAlgúnResaltadoMostrarCartel(elementosResaltados, cartelInfoDarkPattern) {
  let mouseInside = false; // Bandera para simular mouseenter y mouseleave

  window.addEventListener('mousemove', (event) => {
    // Coordenadas del cursor
    const x = event.clientX;
    const y = event.clientY;

    const resaltadoApuntadoPorMouse = elementosResaltados.find(elementoResaltado => coordenadasCoincidenConElemento(x, y, elementoResaltado));
    const cartelApuntadoPorMouse = coordenadasCoincidenConElemento(x, y, cartelInfoDarkPattern);

    // Simula el evento 'mouseenter'
    if (resaltadoApuntadoPorMouse && !mouseInside) {
      mouseInside = true;
      console.log('¡Simulación de mouseenter activa!');
      actualizarTipoYPosiciónDeCartel(cartelInfoDarkPattern, resaltadoApuntadoPorMouse);
    }

    // Simula el evento 'mouseleave'
    if (!resaltadoApuntadoPorMouse && !cartelApuntadoPorMouse && mouseInside) {
      mouseInside = false;
      console.log('¡Simulación de mouseleave activa!');
      ocultarCartel(cartelInfoDarkPattern);
    }

    // Simula el evento 'mouseover'
    if (resaltadoApuntadoPorMouse && mouseInside) {

    }
  });
  function coordenadasCoincidenConElemento(x, y, elemento) {
      // Obtiene la posición exacta del elemento en la pantalla actual
      const rect = elemento.getBoundingClientRect();

      // Verifica si el cursor está dentro de los límites del elemento
      return (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      );
    }
}

async function actualizarTipoYPosiciónDeCartel(cartel, elemento) {
  const tipo = elemento.dataset.tipoDeDarkPattern;
  let titulo = cartel.querySelector('#TituloDP');
  titulo.textContent = DP_TEXT[tipo];
  let descripcion = cartel.querySelector('#DescripcionDP');
  descripcion.textContent = DP_DESCRIPTION[tipo];
  const cartelRect = cartel.getBoundingClientRect();
  const rect = elemento.getBoundingClientRect();
  const centroElemento = rect.left + (rect.width) / 2;
  const posiciónFinalX = Math.max(centroElemento - (cartelRect.width / 2) + window.scrollX, window.scrollX);
  const posiciónFinalY = Math.max(rect.top - cartelRect.height + window.scrollY, window.scrollY);
  const backgroundColor = `${ajustarBrilloDeColor((await chrome.storage.sync.get('dpColores')).dpColores[tipo], 180)}`;
  const border = `2px solid ${ajustarBrilloDeColor((await chrome.storage.sync.get('dpColores')).dpColores[tipo], -100)}`;
  Object.assign(cartel.style, {
    left: `${posiciónFinalX}px`, // Para que no se salga del borde izquierdo de la pantalla
    top: `${posiciónFinalY}px`, // Para que no se salga del borde superior de la pantalla
    color: `${ajustarBrilloDeColor((await chrome.storage.sync.get('dpColores')).dpColores[tipo], -100)}`,
    backgroundColor: backgroundColor,
    border: border
  });
  let img = cartel.querySelector('img');
  Object.assign(img.style, {
    backgroundColor: backgroundColor,
    border: border,
  });
  cartel.elementoApuntado = elemento;

  setTimeout(() => {
    Object.assign(cartel.style, {
      opacity: 1,
      visibility: 'visible'
    });
  }, 1);
}

function ocultarCartel(cartel) {
  cartel.style.opacity = 0;
  cartel.style.visibility = 'hidden';
}

// Source - https://stackoverflow.com/a/57401891
// Posted by supersan
// Retrieved 2026-09-03, License - CC BY-SA 4.0

function ajustarBrilloDeColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}