const FakeUrgency = {
  tipo: DP_TYPES.URGENCY,
  detectados: new Set(),
  rechazados: new Set(),
  // Selectores mejorados para encontrar temporizadores/relojes
  getSelectoresTemporizadores: function() {
    return '[class*="timer"], [class*="countdown"], [class*="count"], [class*="clock"], ' +
           '[class*="time"], [class*="remaining"], [class*="expires"], ' +
           '[id*="timer"], [id*="countdown"], [data-timer], [data-countdown], ' +
           '[class*="deadline"], [class*="stopwatch"], [class*=tabular-nums]';
  },
  
  // Busca el contenedor de bloque más apropiado (offer, deal, product, etc)
  obtenerContenedorBloque: function(elemento) {
    // Intentar encontrar un contenedor semántico, se asume que la gente documenta en ingles aun en paginas en español
    const selectoresContenedor = '[class*="offer"], [class*="deal"], [class*="product"], ' +
                                '[class*="item"], [class*="card"], [class*="promotion"], ' +
                                '[class*="sale"], [class*="block"], [class*="container"]';
    
    let contenedor = elemento.closest(selectoresContenedor);
    
    // Si no encuentra contenedor, subir hasta 5 niveles de padres
    if (!contenedor) {
      let actual = elemento;
      for (let i = 0; i < 5 && actual; i++) {
        actual = actual.parentElement;
        if (actual && actual.innerText && actual.innerText.length > 8) {
          contenedor = actual;
          break;
        }
      }
    }
    
    return contenedor || elemento.parentElement;
  },

  // Trata de agarrar el texto alrededor del temporizador para enviar al backend y que lo analice
  // la forma puede llegar a ser algo como <p>Oferta <span class="countdown">00:10</span> Relampago</p>
  // o el clasico <p>Oferta Relampago</p> y ahora deberia de poder detectar ambos
  obtenerTextoAlrededor: function(elemento, bloque) {
    const partes = [];
    const agregarTexto = (nodo) => {
      if (nodo && nodo.textContent) partes.push(nodo.textContent);
    };

    agregarTexto(bloque);
    agregarTexto(elemento.parentElement);

    let hermanoAnterior = elemento.previousSibling;
    let hermanosPosteriores = elemento.nextSibling;
    for (let i = 0; i < 2 && hermanoAnterior; i++, hermanoAnterior = hermanoAnterior.previousSibling) {
      agregarTexto(hermanoAnterior);
    }
    for (let i = 0; i < 2 && hermanosPosteriores; i++, hermanosPosteriores = hermanosPosteriores.nextSibling) {
      agregarTexto(hermanosPosteriores);
    }

    return partes.join(" ").replace(/\s+/g, " ").trim();
  },

  obtenerBloqueMasGrande: function(actual, candidato) {
    if (!actual) return candidato;
    if (!candidato) return actual;

    if (actual.contains && actual.contains(candidato)) return actual;
    if (candidato.contains && candidato.contains(actual)) return candidato;

    const pathActual = XPATHINTERPRETER.getPath(actual, document.body)?.[0] || "";
    const pathCandidato = XPATHINTERPRETER.getPath(candidato, document.body)?.[0] || "";

    if (pathActual && pathCandidato) {
      if (pathActual.startsWith(pathCandidato + "/") || pathCandidato.startsWith(pathActual + "/")) {
        return pathActual.length <= pathCandidato.length ? actual : candidato;
      }
    }

    return actual;
  },

  // Verificar si el contenedor o alguno de sus ancestros ya está en detectados
  estaYaDetectado: function(bloque) {
    if (!bloque) return false;

    // Verificar si el bloque mismo está en detectados
    for (let elemento of this.detectados) {
      if (elemento === bloque) {
        console.log("FakeUrgency: Bloque ya detectado (mismo elemento)");
        return true;
      }
    }

    // Verificar si algún ancestro del bloque ya está en detectados
    let actual = bloque.parentElement;
    while (actual && actual !== document.body) {
      for (let elemento of this.detectados) {
        if (elemento === actual) {
          console.log("FakeUrgency: Bloque ya detectado (ancestro en detectados)");
          return true;
        }
      }
      actual = actual.parentElement;
    }

    // Verificar si algún elemento en detectados es hijo/descendiente de este bloque
    for (let elemento of this.detectados) {
      if (bloque.contains && bloque.contains(elemento)) {
        console.log("FakeUrgency: Bloque ya contiene un elemento detectado");
        return true;
      }
    }

    return false;
  },
  
  check: function() {
    const selectores = this.getSelectoresTemporizadores();
    const elementos = document.querySelectorAll(selectores);
    
    console.log(`FakeUrgency: Se encontraron ${elementos.length} supuestos temporizadores`);

    const bloquesAgrupados = [];
    const pathsYaMarcados = new Set(
      Array.from(this.detectados)
        .filter(Boolean)
        .map(el => XPATHINTERPRETER.getPath(el, document.body)?.[0])
        .filter(Boolean)
    );

    Array.from(elementos).forEach(temporizador => {
      const bloque = this.obtenerContenedorBloque(temporizador);
      if (!bloque) return;

      // Verificar si el bloque ya está detectado antes de procesarlo
      if (this.estaYaDetectado(bloque)) {
        console.log("FakeUrgency: Saltando bloque que ya está en detectados");
        return;
      }

      const texto = this.obtenerTextoAlrededor(temporizador, bloque);
      if (!texto) return;

      const path = XPATHINTERPRETER.getPath(bloque, document.body)?.[0];
      if (!path) return;

      if (pathsYaMarcados.has(path)) return;

      // Buscar si ya existe un bloque que CONTIENE este
      const indice = bloquesAgrupados.findIndex(entrada => {
        if (!entrada.elemento) return false;

        // Si el elemento existente CONTIENE el nuevo, es el más grande
        if (entrada.elemento.contains && entrada.elemento.contains(bloque)) {
          return true;
        }

        // Si el nuevo CONTIENE el existente, necesitamos reemplazar
        if (bloque.contains && bloque.contains(entrada.elemento)) {
          return true;
        }

        // Comparar por paths si uno es ancestro del otro
        const unoAbarcaAlOtro = entrada.path.startsWith(path + "/") || path.startsWith(entrada.path + "/");
        return unoAbarcaAlOtro;
      });

      if (indice === -1) {
        // No encontramos relación, agregar como nuevo
        bloquesAgrupados.push({
          elemento: bloque,
          text: texto,
          path,
          timerPath: XPATHINTERPRETER.getPath(temporizador, document.body)?.[0]
        });
        return;
      }

      const entrada = bloquesAgrupados[indice];
      const bloqueFinal = this.obtenerBloqueMasGrande(entrada.elemento, bloque);

      // Si el nuevo bloque es más grande, reemplaza completamente
      if (bloqueFinal === bloque) {
        bloquesAgrupados[indice] = {
          elemento: bloque,
          text: texto,
          path,
          timerPath: XPATHINTERPRETER.getPath(temporizador, document.body)?.[0]
        };
      }
      // Si el existente es más grande, simplemente no hacer nada (mantener entrada actual)
    });

    // Usar SIEMPRE entrada.path (ruta del contenedor), nunca timerPath
    const elemenFormat = bloquesAgrupados
      .map(entrada => ({
        text: entrada.text,
        path: entrada.path
      }))
      .filter(e => e && e.text && e.text.length > 0);
    
      
      if (elemenFormat.length === 0) {
        console.log("FakeUrgency: No se encontraron bloques de texto alrededor de los supuestos temporizadores");
        return;
      }
      
      // Filtrar solo bloques que NO están ya en detectados o rechazados
      const bloquesNuevos = elemenFormat.filter(item => {
        return !pathsYaMarcados.has(item.path) && !this.rechazados.has(item.path);
      });
      
    // Si no hay nada nuevo, no llamar al background service
    if (bloquesNuevos.length === 0) {
      console.log("FakeUrgency: No hay bloques nuevos para procesar");
      return;
    }

    console.log(`FakeUrgency: Enviando ${bloquesNuevos.length} bloques nuevos al background service`);

    chrome.runtime.sendMessage({ pattern: this.tipo, data: bloquesNuevos }, (response) => {
      const { error, data } = response;
      if (error) {
        if (error.code === "ERR_NETWORK") console.log("El servidor no responde.");
        else console.log(error);
      }
      else {
        data.urgency_instances.forEach((item) => {
          if(item.has_urgency) {
            const elemento = XPATHINTERPRETER.getElementByXPath(item.path, document.body);
            if (elemento) {
              this.detectados.add(elemento);

              console.log("FakeUrgency: Elemento añadido a detectados:", item.path);
            }
          }else{
            this.rechazados.add(item.path);
            console.log("FakeUrgency: Elemento añadido a rechazados:", item.path);
          }
        });
        console.log("Elementos con urgencia detectados:", this.detectados);
        chrome.runtime.sendMessage({tipo: "MODO_AVISO"})
      }
    });
  },
  
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}