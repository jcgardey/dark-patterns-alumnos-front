// Objeto detector de Fake Scarcity optimizado
const browserAPIScarcity = typeof browser !== 'undefined' ? browser : chrome;

const FakeScarcity = {
  tipo: DP_TYPES.SCARCITY,
  detectados: new Set(),
  cacheTextos: new Map(), // Caché global de texto normalizado -> bool (has_scarcity)
  elementosEvaluados: new WeakSet(), // Referencias a elementos del DOM ya procesados
  bloquesPendientes: [],
  esperandoRta: false,

  check: function () {
    const rawElements = segments(document.body);
    if (!rawElements || rawElements.length === 0) return;

    const bloquesParaEnviar = [];
    let huboCambiosLocales = false;

    for (let i = 0; i < rawElements.length; i++) {
      const el = rawElements[i];
      if (!el || !el.isConnected) continue;

      // Si el elemento ya fue procesado y no dio positivo, no lo volvemos a evaluar
      if (this.elementosEvaluados.has(el) && !this.detectados.has(el)) continue;

      if (el.innerText === undefined) continue;
      const text = el.innerText.trim().replace(/\s+/g, " ");
      if (text.length === 0 || text.length > 300) continue; // Descartar bloques vacíos o masivos

      // Comprobar si ya conocemos el veredicto para este texto exacto
      if (this.cacheTextos.has(text)) {
        this.elementosEvaluados.add(el);
        if (this.cacheTextos.get(text)) {
          if (!this.detectados.has(el)) {
            this.detectados.add(el);
            console.log("%c[DP Detector] SCARCITY detectado (caché):", "color: #D97706; font-weight: bold; font-size: 11px;", el, { texto: text });
            huboCambiosLocales = true;
          }
        }
        continue;
      }

      // Elemento con texto nuevo no evaluado
      const path = XPATHINTERPRETER.getPath(el, document.body)?.[0];
      if (!path) continue;

      // Verificar que no esté ya en cola
      if (!this.bloquesPendientes.some(p => p.path === path) &&
          !bloquesParaEnviar.some(b => b.path === path)) {
        bloquesParaEnviar.push({ text, path, el });
      }
    }

    if (huboCambiosLocales) {
      browserAPIScarcity.runtime.sendMessage({ tipo: "MODO_AVISO" }).catch(() => {});
    }

    if (bloquesParaEnviar.length === 0) return;

    if (this.esperandoRta) {
      this.bloquesPendientes = [...this.bloquesPendientes, ...bloquesParaEnviar];
      return;
    }

    this.sendMessage(bloquesParaEnviar);
  },

  sendMessage: function (bloques) {
    this.esperandoRta = true;
    const payload = bloques.map(b => ({ text: b.text, path: b.path }));

    browserAPIScarcity.runtime.sendMessage({ pattern: this.tipo, data: payload }, (response) => {
      const { error, data: resData } = response || {};

      if (error) {
        console.warn("FakeScarcity: Error o servidor no disponible", error.code || error);
      } else if (resData && resData.instances) {
        let nuevosDetectados = false;

        resData.instances.forEach((instancia) => {
          // Guardar en la caché por texto
          if (instancia.text) {
            this.cacheTextos.set(instancia.text, !!instancia.has_scarcity);
          }

          if (instancia.has_scarcity) {
            const el = XPATHINTERPRETER.getElementByXPath(instancia.path, document.body);
            if (el) {
              if (!this.detectados.has(el)) {
                console.log("%c[DP Detector] SCARCITY detectado:", "color: #D97706; font-weight: bold; font-size: 11px;", el, { texto: instancia.text });
              }
              this.detectados.add(el);
              this.elementosEvaluados.add(el);
              nuevosDetectados = true;
            }
          }
        });

        // Marcar todos los elementos enviados como evaluados
        bloques.forEach(b => {
          if (b.el) this.elementosEvaluados.add(b.el);
        });

        if (nuevosDetectados) {
          browserAPIScarcity.runtime.sendMessage({ tipo: "MODO_AVISO" }).catch(() => {});
        }
      }

      // Procesar cola acumulada de manera controlada
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
