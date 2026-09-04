const FakeUrgency = {
  tipo: DP_TYPES.URGENCY,
  detectados: new Set(),
  
  // Selectores mejorados para encontrar temporizadores/relojes
  getSelectoresTemporizadores: function() {
    return '[class*="timer"], [class*="countdown"], [class*="count"], [class*="clock"], ' +
           '[class*="time"], [class*="remaining"], [class*="expires"], ' +
           '[id*="timer"], [id*="countdown"], [data-timer], [data-countdown], ' +
           '[class*="deadline"], [class*="stopwatch"]';
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
  
  check: function() {
    const selectores = this.getSelectoresTemporizadores();
    const elementos = document.querySelectorAll(selectores);
    
    console.log(`FakeUrgency: Se encontraron ${elementos.length} supuestos temporizadores`);
    
    const elemenFormat = Array.from(elementos)
      .map(temporizador => {
        // Obtener el bloque contenedor del temporizador
        const bloque = this.obtenerContenedorBloque(temporizador);
        
        if (!bloque) return null;
        
        return {
          text: this.obtenerTextoAlrededor(temporizador, bloque),
          path: XPATHINTERPRETER.getPath(bloque, document.body)?.[0],
          timerPath: XPATHINTERPRETER.getPath(temporizador, document.body)?.[0]
        };
      })
      .filter(e => e !== null && e.text && e.text.length > 0);
    
    console.log("FakeUrgency-Check", elemenFormat);
    
    if (elemenFormat.length === 0) {
      console.log("FakeUrgency: No se encontraron bloques de texto alrededor de los supuestos temporizadores");
      return;
    }

    chrome.runtime.sendMessage({ pattern: this.tipo, data: elemenFormat }, (response) => {
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
            }
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
