// Objeto detector de Fake Urgency optimizado
const browserAPIUrgency = typeof browser !== 'undefined' ? browser : chrome;

const FakeUrgency = {
  tipo: DP_TYPES.URGENCY,
  detectados: new Set(),
  rechazados: new Set(),
  cacheTextos: new Map(), // text -> bool (has_urgency)
  elementosEvaluados: new WeakSet(),
  bloquesPendientes: [],
  esperandoRta: false,

  // Selectores para encontrar temporizadores / cuentas regresivas
  getSelectoresTemporizadores: function () {
    return '[class*="timer"], [class*="countdown"], [class*="count"], [class*="clock"], ' +
           '[class*="time"], [class*="remaining"], [class*="expires"], ' +
           '[id*="timer"], [id*="countdown"], [data-timer], [data-countdown], ' +
           '[class*="deadline"], [class*="stopwatch"], [class*="tabular-nums"]';
  },

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
    if (!elementos || elementos.length === 0) return;

    const bloquesAgrupados = [];
    const pathsYaMarcados = new Set(
      Array.from(this.detectados)
        .filter(Boolean)
        .map(el => XPATHINTERPRETER.getPath(el, document.body)?.[0])
        .filter(Boolean)
    );

    let huboCambiosLocales = false;

    Array.from(elementos).forEach(temporizador => {
      const bloque = this.obtenerContenedorBloque(temporizador);
      if (!bloque) return;

      if (this.estaYaDetectado(bloque)) return;

      const texto = this.obtenerTextoAlrededor(temporizador, bloque);
      if (!texto || texto.length > 300) return;

      // Consultar caché de texto evaluado
      if (this.cacheTextos.has(texto)) {
        this.elementosEvaluados.add(bloque);
        if (this.cacheTextos.get(texto)) {
          if (!this.detectados.has(bloque)) {
            this.detectados.add(bloque);
            console.log("%c[DP Detector] URGENCY detectado (caché):", "color: #FF0000; font-weight: bold; font-size: 11px;", bloque, { texto });
            huboCambiosLocales = true;
          }
        }
        return;
      }

      const path = XPATHINTERPRETER.getPath(bloque, document.body)?.[0];
      if (!path || pathsYaMarcados.has(path) || this.rechazados.has(path)) return;

      const indice = bloquesAgrupados.findIndex(entrada => {
        if (!entrada.elemento) return false;
        if (entrada.elemento.contains && entrada.elemento.contains(bloque)) return true;
        if (bloque.contains && bloque.contains(entrada.elemento)) return true;
        return entrada.path.startsWith(path + "/") || path.startsWith(entrada.path + "/");
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

    if (huboCambiosLocales) {
      browserAPIUrgency.runtime.sendMessage({ tipo: "MODO_AVISO" }).catch(() => {});
    }

    const elemenFormat = bloquesAgrupados
      .map(entrada => ({ text: entrada.text, path: entrada.path, el: entrada.elemento }))
      .filter(e => e && e.text && e.text.length > 0);

    if (elemenFormat.length === 0) return;

    const bloquesNuevos = elemenFormat.filter(item => {
      return !pathsYaMarcados.has(item.path) && !this.rechazados.has(item.path);
    });

    if (bloquesNuevos.length === 0) return;

    if (this.esperandoRta) {
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
    const payload = bloques.map(b => ({ text: b.text, path: b.path }));

    browserAPIUrgency.runtime.sendMessage({ pattern: this.tipo, data: payload }, (response) => {
      const { error, data: resData } = response || {};

      if (error) {
        console.warn("FakeUrgency: Error o servidor no disponible", error.code || error);
      } else if (resData) {
        const instancias = resData.urgency_instances || resData.instances || (Array.isArray(resData) ? resData : []);
        let nuevosDetectados = false;

        instancias.forEach((item) => {
          if (item.text) {
            this.cacheTextos.set(item.text, !!item.has_urgency);
          }

          if (item.has_urgency) {
            const elemento = XPATHINTERPRETER.getElementByXPath(item.path, document.body);
            if (elemento) {
              if (!this.detectados.has(elemento)) {
                console.log("%c[DP Detector] URGENCY detectado:", "color: #FF0000; font-weight: bold; font-size: 11px;", elemento, { texto: item.text });
              }
              this.detectados.add(elemento);
              this.elementosEvaluados.add(elemento);
              nuevosDetectados = true;
            }
          } else {
            this.rechazados.add(item.path);
          }
        });

        bloques.forEach(b => {
          if (b.el) this.elementosEvaluados.add(b.el);
        });

        if (nuevosDetectados) {
          browserAPIUrgency.runtime.sendMessage({ tipo: "MODO_AVISO" }).catch(() => {});
        }
      }

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
    this.detectados.clear();
    desresaltarElementoConTipo(this.tipo);
  }
};
