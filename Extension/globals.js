/**
 * Variables y constantes globales compatibles con Chromium y Firefox.
 */
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const DP_TYPES = {
  SHAMING: 'SHAMING',
  URGENCY: 'URGENCY',
  MISDIRECTION: 'MISDIRECTION',
  HIDDENCOST: 'HIDDENCOST',
  PRESELECTION: 'PRESELECTION',
  SCARCITY: 'SCARCITY'
};

const DP_TEXT = {
  SHAMING: 'Posible forma de persuasión',
  URGENCY: 'Podría ser falso',
  MISDIRECTION: 'Posible acción oculta',
  HIDDENCOST: 'Posible precio oculto',
  PRESELECTION: 'Cuidado, opción preseleccionada',
  SCARCITY: 'Podría no ser cierto'
};

const DP_DESCRIPTION = {
  SHAMING: 'Usa frases que te hacen sentir culpable por no aceptar una oferta',
  URGENCY: 'Te apura con límites de tiempo para que decidas rápido',
  MISDIRECTION: 'Destaca lo que les conviene y oculta la opción que buscás',
  HIDDENCOST: 'Te muestra precios parciales y revela cargos extra al final',
  PRESELECTION: 'Opciones preseleccionadas que no elegiste para que las aceptes sin darte cuenta',
  SCARCITY: 'Te hace creer que quedan pocas unidades para presionar tu decisión'
};

// Caché en memoria de configuración para eliminar lecturas asíncronas en eventos como mousemove
let modoSeleccionadoLocal = "TODO";
let dpColoresLocal = {
  SHAMING: '#FF9500',
  URGENCY: '#FF0000',
  MISDIRECTION: '#0400FF',
  HIDDENCOST: '#1AFF00',
  PRESELECTION: '#EE82EE',
  SCARCITY: '#FFFF00'
};

browserAPI.storage.sync.get(["modoSeleccionado", "dpColores"], (res) => {
  if (res) {
    if (res.modoSeleccionado) modoSeleccionadoLocal = res.modoSeleccionado;
    if (res.dpColores) dpColoresLocal = { ...dpColoresLocal, ...res.dpColores };
  }
});

browserAPI.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.modoSeleccionado) modoSeleccionadoLocal = changes.modoSeleccionado.newValue;
    if (changes.dpColores) dpColoresLocal = { ...dpColoresLocal, ...changes.dpColores.newValue };
  }
});

let elementosResaltados = [];
let cartelInfoDarkPattern = crearCartelInfoDarkPattern();
let mouseEstáAdentroDeElemento = false; // Bandera para simular mouseenter y mouseleave
alApuntarHaciaAlgúnResaltadoMostrarCartel(elementosResaltados, cartelInfoDarkPattern);

/**
 * Resalta el borde de un elemento con el color configurado para su tipo
 * @param {Element} elemento 
 * @param {string} tipo - Usar DP_TYPES
 */
function resaltarBorde(elemento, tipo) {
  if (!elemento) return;
  const color = dpColoresLocal[tipo] || '#FF0000';
  elemento.style.border = `3px dashed ${color}`;
  elemento.dataset.darkPattern = tipo;
}

/**
 * Función para obtener un selector único para un elemento
 * @param {Element} elemento 
 * @returns {string}
 */
function getUniqueSelector(elemento) {
  if (!elemento) return '';
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
  if (!elemento) return;

  let ignoreList = [];
  try {
    ignoreList = JSON.parse(localStorage.getItem('ignoreDP')) || [];
  } catch (e) {
    ignoreList = [];
  }
  const selector = getUniqueSelector(elemento);
  if (ignoreList.includes(selector)) {
    return;
  }

  resaltarBorde(elemento, tipo);
  if (!elementosResaltados.includes(elemento)) {
    elementosResaltados.push(elemento);
  }
}

/**
 * @param {string} tipo Patrón a desresaltar
 */
function desresaltarElementoConTipo(tipo) {
  const elementos = document.querySelectorAll(`[data-dark-pattern="${tipo}"]`);
  elementos.forEach((elemento) => {
    elemento.style.border = '';
    elemento.dataset.darkPattern = '';
  });
  elementosResaltados = elementosResaltados.filter(el => el.dataset.darkPattern && el.dataset.darkPattern !== '');
  if (modoSeleccionadoLocal !== 'TODO') {
    ocultarCartel(cartelInfoDarkPattern);
  }
}

function inyectarFuenteEnCSS() {
  const fontUrlRegular = browserAPI.runtime.getURL('fuentes/SpaceMono-Regular.ttf');
  const fontUrlBold = browserAPI.runtime.getURL('fuentes/SpaceMono-Bold.ttf');
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Space Mono';
      font-weight: 400;
      src: url('${fontUrlRegular}') format('truetype');
    }
    @font-face {
      font-family: 'Space Mono';
      font-weight: 700;
      src: url('${fontUrlBold}') format('truetype');
    }
  `;
  document.head.appendChild(style);
}

function crearCartelInfoDarkPattern() {
  const cartelNuevo = document.createElement('span');
  cartelNuevo.id = 'cartelInfoDarkPattern_ext';

  const logo = document.createElement('img');
  logo.src = browserAPI.runtime.getURL('menu/imagenes/icono.png');
  Object.assign(logo.style, {
    display: 'inline',
    boxSizing: 'border-box',
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

  const botonCerrar = document.createElement('button');
  botonCerrar.textContent = 'Dejar de marcar este caso';
  Object.assign(botonCerrar.style, {
    cursor: 'pointer',
    color: '#a00000',
    fontWeight: 'bold',
    fontSize: '14px',
    border: '1px solid #702020',
    borderRadius: '0.5em',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: '0 0.5em',
    marginTop: '0.5em'
  });

  botonCerrar.addEventListener('click', function () {
    if (cartelNuevo.elementoApuntado) {
      const elementoApuntado = cartelNuevo.elementoApuntado;
      const respuesta = confirm("¿Querés que este caso no se detecte más?");
      if (respuesta) {
        elementoApuntado.style.border = '';
        elementoApuntado.dataset.darkPattern = '';

        let ignoreList = [];
        try {
          ignoreList = JSON.parse(localStorage.getItem('ignoreDP')) || [];
        } catch (e) {
          ignoreList = [];
        }
        const selector = getUniqueSelector(elementoApuntado);
        ignoreList.push(selector);
        localStorage.setItem('ignoreDP', JSON.stringify(ignoreList));
        ocultarCartel(cartelNuevo);
      } else {
        ocultarCartel(cartelNuevo);
      }
    }
  });

  Object.assign(cartelNuevo.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    zIndex: '2147483647',
    padding: '10px',
    color: 'black',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
    fontSize: '16px',
    whiteSpace: 'normal',
    minWidth: '120px',
    textAlign: 'center',
    opacity: '0',
    visibility: 'hidden',
    pointerEvents: 'auto',
    transition: 'opacity .2s ease, visibility .2s ease'
  });

  cartelNuevo.appendChild(botonCerrar);
  document.body.appendChild(cartelNuevo);
  return cartelNuevo;
}

function alApuntarHaciaAlgúnResaltadoMostrarCartel(elementosResaltados, cartelInfoDarkPattern) {
  function encontrarElementoResaltado(x, y, target) {
    // 1. Prioridad: el elemento bajo el cursor o su ancestro más cercano con data-dark-pattern
    if (target && target.closest) {
      const directo = target.closest('[data-dark-pattern]');
      if (directo && directo.dataset.darkPattern && directo !== cartelInfoDarkPattern && !cartelInfoDarkPattern.contains(directo)) {
        return directo;
      }
    }

    // 2. Elementos registrados en la lista de resaltados por coordenadas
    const encontradoEnLista = elementosResaltados.find(el => el && el.isConnected && coordenadasCoincidenConElemento(x, y, el));
    if (encontradoEnLista) return encontradoEnLista;

    // 3. Fallback: cualquier elemento con data-dark-pattern activo en el DOM
    const all = document.querySelectorAll('[data-dark-pattern]');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      if (el.dataset.darkPattern && el !== cartelInfoDarkPattern && !cartelInfoDarkPattern.contains(el)) {
        if (coordenadasCoincidenConElemento(x, y, el)) {
          return el;
        }
      }
    }
    return null;
  }

  window.addEventListener('mousemove', (event) => {
    // Si el modo no es "TODO", no interactúa el globo
    if (modoSeleccionadoLocal !== "TODO") return;

    const x = event.clientX;
    const y = event.clientY;

    const cartelApuntadoPorMouse = coordenadasCoincidenConElemento(x, y, cartelInfoDarkPattern);
    const resaltadoApuntadoPorMouse = encontrarElementoResaltado(x, y, event.target);

    if ((!cartelApuntadoPorMouse || cartelInfoDarkPattern.style.visibility === 'hidden') &&
      resaltadoApuntadoPorMouse &&
      (resaltadoApuntadoPorMouse !== mouseEstáAdentroDeElemento)) {
      mouseEstáAdentroDeElemento = resaltadoApuntadoPorMouse;
      actualizarTipoYPosiciónDeCartel(cartelInfoDarkPattern, resaltadoApuntadoPorMouse);
    }

    if (!resaltadoApuntadoPorMouse && !cartelApuntadoPorMouse && mouseEstáAdentroDeElemento) {
      mouseEstáAdentroDeElemento = false;
      ocultarCartel(cartelInfoDarkPattern);
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    mouseEstáAdentroDeElemento = false;
    ocultarCartel(cartelInfoDarkPattern);
  });

  function coordenadasCoincidenConElemento(x, y, elemento) {
    if (!elemento) return false;
    const rect = elemento.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }
}

function actualizarTipoYPosiciónDeCartel(cartel, elemento) {
  if (!elemento) return;
  const tipo = elemento.dataset.darkPattern;
  if (!tipo) return;

  let titulo = cartel.querySelector('#TituloDP');
  if (titulo) titulo.textContent = DP_TEXT[tipo] || tipo;

  let descripcion = cartel.querySelector('#DescripcionDP');
  if (descripcion) descripcion.textContent = DP_DESCRIPTION[tipo] || '';

  // Habilitar display para medir dimensiones reales
  cartel.style.display = 'block';

  const rect = elemento.getBoundingClientRect();
  const cartelRect = cartel.getBoundingClientRect();
  const centroElemento = rect.left + (rect.width) / 2;
  const posiciónFinalX = Math.max(centroElemento - (cartelRect.width / 2) + window.scrollX, window.scrollX + 5);

  // Posicionar arriba si entra en pantalla, sino abajo del elemento
  let posiciónFinalY = rect.top - cartelRect.height + window.scrollY;
  if (rect.top < cartelRect.height + 15) {
    posiciónFinalY = rect.bottom + window.scrollY + 8;
  }

  const colorBase = dpColoresLocal[tipo] || '#FF0000';
  const backgroundColor = `${ajustarBrilloDeColor(colorBase, 180)}`;
  const border = `2px solid ${ajustarBrilloDeColor(colorBase, -100)}`;

  Object.assign(cartel.style, {
    left: `${posiciónFinalX}px`,
    top: `${posiciónFinalY}px`,
    color: `${ajustarBrilloDeColor(colorBase, -100)}`,
    backgroundColor: backgroundColor,
    border: border,
    visibility: 'visible',
    opacity: '1'
  });

  let img = cartel.querySelector('img');
  if (img) {
    Object.assign(img.style, {
      backgroundColor: backgroundColor,
      border: border,
    });
  }

  cartel.elementoApuntado = elemento;
}

function ocultarCartel(cartel) {
  if (cartel) {
    cartel.style.opacity = '0';
    cartel.style.visibility = 'hidden';
  }
}

function ajustarBrilloDeColor(color, amount) {
  try {
    return '#' + color.replace(/^#/, '').replace(/../g, c => ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2));
  } catch (e) {
    return color;
  }
}
