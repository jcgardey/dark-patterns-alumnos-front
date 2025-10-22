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

const DP_COLORS = {
  SHAMING: 'FF9500', // #FF9500
  URGENCY: 'FF0000', // #FF0000
  MISDIRECTION: '0400FF', // #0400FF
  HIDDENCOST: '1AFF00', // #1AFF00
  PRESELECTION: 'EE82EE', // #EE82EE
  SCARCITY: 'FFFF00' // #FFFF00
}

/**
 * 
 * @param {Element} elemento 
 * @param {string} tipo - Usar DP_TYPES para no tener errores
 * @returns 
 */
function resaltarBorde(elemento, tipo) {
  // Chequeo simple para saber si ya fue resaltado
  if (elemento == undefined || elemento.classList.contains(tipo)) return;
  
  // console.log("Resaltando borde:", elemento, "Tipo:", tipo);
  
  // Aplica el estilo al borde del elemento
  elemento.style.border = `3px dashed #${DP_COLORS[tipo]}`;
  elemento.classList.add(tipo);
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
  if (elemento == undefined || elemento.classList.contains(tipo)) return;

  // console.info("Resaltando elemento: ", elemento, "Tipo: " + tipo);
  
  resaltarBorde(elemento, tipo);
  elemento.style.position = 'relative'; // Para posicionar el globo correctamente

  // Chequea si ya existe un globo de texto para el elemento
  // Si no existe, lo crea.
  let globoTexto = null;
  Array.from(elemento.childNodes).forEach((child) => {
    if (child.classList && child.classList.contains('resaltado-dark-pattern')) {
      globoTexto = child;
    }
  });
  
  if (!globoTexto) {
    globoTexto = document.createElement('span');
    globoTexto.classList.add('resaltado-dark-pattern');
  }

  // Agrega texto al globo
  const p = document.createElement('p');
  p.textContent = DP_TEXT[tipo];
  p.style.width = '100%';
  p.style.lineHeight = '1.5';
  p.style.margin = '0'; // Agregar para evitar márgenes por defecto
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
    
    const respuesta = confirm("¿Queres que este caso no se detecte más?");
    // Si el usuario confirma, se elimina el resaltado y se guarda en localStorage para no detectarlo más
    if (respuesta) {
      // Quitar borde y clase solo de este tipo
      elemento.style.border = '';
      elemento.classList.remove(tipo);
      // Eliminar el globo de texto
      if (globoTexto.parentNode === elemento) {
        elemento.removeChild(globoTexto);
      }

      // Traigo la lista de ignorados del localStorage
      let ignoreList = [];
      try {
        ignoreList = JSON.parse(localStorage.getItem('ignoreDP')) || [];
      } catch (e) {
        ignoreList = [];
      }
      const selector = getUniqueSelector(elemento);
      ignoreList.push(selector);
      // Guardar la lista de ignorados en localStorage
      localStorage.setItem('ignoreDP', JSON.stringify(ignoreList));
    } else {
      // Solo cierra el globo, pero deja el resaltado
      globoTexto.removeChild(p);
      globoTexto.removeChild(botonCerrar);
      if (!globoTexto.hasChildNodes()) elemento.removeChild(globoTexto);
    }
  })
  

  const rect = elemento.getBoundingClientRect();

  Object.assign(globoTexto.style, {
    position: 'absolute',
    top: `${rect.height}px`, // Ajusta para que el globo aparezca arriba del elemento
    left: '0',
    zIndex: '10000', // Asegurar que esté por encima de otros elementos
    padding: '10px',
    backgroundColor: `#${DP_COLORS[tipo]}`,
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
 * @param {string} tipo Patrón a desresaltar
 */
function desresaltarElementoConTipo(tipo) {
  // console.log("Desresaltando elementos del tipo:", tipo);
  
  // Buscar todos los elementos que fueron resaltados con este tipo
  const elementos = document.querySelectorAll(`.${tipo}`);
  
  elementos.forEach((elemento) => {
    // Quitar borde y clase
    elemento.style.border = '';
    elemento.classList.remove(tipo);

    // Buscar y eliminar el globo de texto relacionado
    const hijos = Array.from(elemento.children);
    hijos.forEach((hijo) => {
      if (hijo.classList && hijo.classList.contains('resaltado-dark-pattern')) {
        elemento.removeChild(hijo);
      }
    });
  });
}