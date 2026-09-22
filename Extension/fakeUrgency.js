// Objeto a usar en extension.js
const FakeUrgency = {
  tipo: DP_TYPES.URGENCY,
  detectados: new Set(),
  rechazados: new Set(),
  bloquesPendientes: [],
  esperandoRta: false,

  // Selectores mejorados para encontrar temporizadores/relojes
  getSelectoresTemporizadores: function () {
    return '[class*="timer"], [class*="countdown"], [class*="count"], [class*="clock"], ' +
           '[class*="time"], [class*="remaining"], [class*="expires"], ' +
           '[id*="timer"], [id*="countdown"], [data-timer], [data-countdown], ' +
           '[class*="deadline"], [class*="stopwatch"], [class*=tabular-nums]';
  },

  // Busca el contenedor de bloque más apropiado (offer, deal, product, etc)
  obtenerContenedorBloque: function (elemento) {
    const selectoresContenedor = '[class*="offer"], [class*="deal"], [class*="product"], ' +
                                '[class*="item"], [class*="card"], [class*="promotion"], ' +
                                '[class*="sale"], [class*="block"], [class*="container"]';

    let contenedor = elemento.closest(selectoresContenedor);

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

  // Trata de agarrar el texto alrededor del temporizador
  obtenerTextoAlrededor: function (elemento, bloque) {
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

  obtenerBloqueMasGrande: function (actual, candidato) {
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
  estaYaDetectado: function (bloque) {
    if (!bloque) return false;

    for (let elemento of this.detectados) {
      if (elemento === bloque) return true;
    }

    let actual = bloque.parentElement;
    while (actual && actual !== document.body) {
      for (let elemento of this.detectados) {
        if (elemento === actual) return true;
      }
      actual = actual.parentElement;
    }

    for (let elemento of this.detectados) {
      if (bloque.contains && bloque.contains(elemento)) return true;
    }

    return false;
  },

  check: function () {
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

      if (this.estaYaDetectado(bloque)) return;

      const texto = this.obtenerTextoAlrededor(temporizador, bloque);
      if (!texto) return;

      const path = XPATHINTERPRETER.getPath(bloque, document.body)?.[0];
      if (!path) return;

      if (pathsYaMarcados.has(path)) return;

      const indice = bloquesAgrupados.findIndex(entrada => {
        if (!entrada.elemento) return false;

        if (entrada.elemento.contains && entrada.elemento.contains(bloque)) return true;
        if (bloque.contains && bloque.contains(entrada.elemento)) return true;

        const unoAbarcaAlOtro = entrada.path.startsWith(path + "/") || path.startsWith(entrada.path + "/");
        return unoAbarcaAlOtro;
      });

      if (indice === -1) {
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

      if (bloqueFinal === bloque) {
        bloquesAgrupados[indice] = {
          elemento: bloque,
          text: texto,
          path,
          timerPath: XPATHINTERPRETER.getPath(temporizador, document.body)?.[0]
        };
      }
    });

    const elemenFormat = bloquesAgrupados
      .map(entrada => ({ text: entrada.text, path: entrada.path }))
      .filter(e => e && e.text && e.text.length > 0);

    if (elemenFormat.length === 0) return;

    // Filtrar bloques que no estén en detectados o rechazados
    const bloquesNuevos = elemenFormat.filter(item => {
      return !pathsYaMarcados.has(item.path) && !this.rechazados.has(item.path);
    });

    if (bloquesNuevos.length === 0) return;

    // Si ya estamos esperando respuesta, guardamos en la cola descartando duplicados
    if (this.esperandoRta) {
      console.log("FakeUrgency: Esperando respuesta del background service, encolando bloques nuevos");
      const nuevosSinRepetir = bloquesNuevos.filter(nuevo =>
        !this.bloquesPendientes.some(existente => existente.path === nuevo.path) &&
        !pathsYaMarcados.has(nuevo.path)
      );

      this.bloquesPendientes = [...this.bloquesPendientes, ...nuevosSinRepetir];
      return;
    }

    this.sendMessage(bloquesNuevos);
  },

  sendMessage: function (bloques) {
    this.esperandoRta = true;
    console.log(`FakeUrgency: Enviando ${bloques.length} bloques nuevos al background service`);

    chrome.runtime.sendMessage({ pattern: this.tipo, data: bloques }, (response) => {
      const { error, data: resData } = response || {};

      if (error) {
        if (error.code === "ERR_NETWORK") console.log("FakeUrgency: El servidor no responde.", error);
        else console.log("FakeUrgency: Error en mensaje", error);
      } else if (resData) {
        // Manejar tanto array directo como objeto .urgency_instances o .instances
        const instancias = resData.urgency_instances || resData.instances || (Array.isArray(resData) ? resData : []);

        instancias.forEach((item) => {
          if (item.has_urgency) {
            const elemento = XPATHINTERPRETER.getElementByXPath(item.path, document.body);
            if (elemento) {
              this.detectados.add(elemento);
              console.log("FakeUrgency: Elemento añadido a detectados:", item.path);
            }
          } else {
            this.rechazados.add(item.path);
            console.log("FakeUrgency: Elemento añadido a rechazados:", item.path);
          }
        });

        chrome.runtime.sendMessage({ tipo: "MODO_AVISO" });
      }

      // Vaciar y procesar pendientes independientemente de si hubo error para no bloquear el módulo
      if (this.bloquesPendientes.length > 0) {
        const siguientes = [...this.bloquesPendientes];
        this.bloquesPendientes = [];
        this.sendMessage(siguientes);
      } else {
        this.esperandoRta = false;
      }
    });
  },

  clear: function () {
    desresaltarElementoConTipo(this.tipo);
  }
};