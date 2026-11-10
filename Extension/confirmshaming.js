// Objeto detector de Confirm Shaming optimizado
const browserAPIShaming = typeof browser !== 'undefined' ? browser : chrome;

const ConfirmShaming = {
  tipo: DP_TYPES.SHAMING,
  detectados: new Set(),
  cacheTextos: new Map(), // Caché de texto -> bool (has_shaming)
  elementosEvaluados: new WeakSet(),
  bloquesPendientes: [],
  esperandoRta: false,

  check: function () {
    const invalidTags = ["INPUT"];
    const buttonTags = ["BUTTON", "A"];
    const rawElements = segments(document.body);
    if (!rawElements || rawElements.length === 0) return;

    const bloquesParaEnviar = [];
    let huboCambiosLocales = false;

    for (let i = 0; i < rawElements.length; i++) {
      const element = rawElements[i];
      if (!element || !element.isConnected) continue;

      if (!buttonTags.includes(element.nodeName)) continue;

      let invalidElement = false;
      if (invalidTags.includes(element.nodeName)) invalidElement = true;
      for (const child of element.children) {
        if (invalidTags.includes(child.nodeName)) invalidElement = true;
      }
      if (invalidElement) continue;

      if (this.elementosEvaluados.has(element) && !this.detectados.has(element)) continue;

      if (element.innerText === undefined) continue;
      const text = element.innerText.trim().replace(/\s+/g, " ");
      if (text.length === 0 || text.length > 250) continue;

      // Consultar caché local
      if (this.cacheTextos.has(text)) {
        this.elementosEvaluados.add(element);
        if (this.cacheTextos.get(text)) {
          if (!this.detectados.has(element)) {
            this.detectados.add(element);
            console.log("%c[DP Detector] SHAMING detectado (caché):", "color: #FF9500; font-weight: bold; font-size: 11px;", element, { texto: text });
            huboCambiosLocales = true;
          }
        }
        continue;
      }

      const path = XPATHINTERPRETER.getPath(element, document.body)?.[0];
      if (!path) continue;

      if (!this.bloquesPendientes.some(p => p.path === path) &&
          !bloquesParaEnviar.some(b => b.path === path)) {
        bloquesParaEnviar.push({ text, path, el: element });
      }
    }

    if (huboCambiosLocales) {
      browserAPIShaming.runtime.sendMessage({ tipo: "MODO_AVISO" }).catch(() => {});
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

    browserAPIShaming.runtime.sendMessage({ pattern: this.tipo, data: payload }, (response) => {
      const { error, data: resData } = response || {};

      if (error) {
        console.warn("ConfirmShaming: Error o servidor no disponible", error.code || error);
      } else if (resData) {
        const detectadosList = Array.isArray(resData) ? resData : (resData.instances || []);
        const positivePaths = new Set();
        let nuevosDetectados = false;

        detectadosList.forEach((res) => {
          if (res.has_shaming !== false) {
            const detectedPath = res.path || res;
            positivePaths.add(detectedPath);
            if (res.text) this.cacheTextos.set(res.text, true);

            const el = XPATHINTERPRETER.getElementByXPath(detectedPath, document.body);
            if (el) {
              if (!this.detectados.has(el)) {
                console.log("%c[DP Detector] SHAMING detectado:", "color: #FF9500; font-weight: bold; font-size: 11px;", el, { texto: res.text || el.innerText });
              }
              this.detectados.add(el);
              this.elementosEvaluados.add(el);
              nuevosDetectados = true;
            }
          }
        });

        // Todos los bloques enviados que no aparecieron en la lista positiva son negativos
        bloques.forEach(b => {
          if (!positivePaths.has(b.path)) {
            if (!this.cacheTextos.has(b.text)) {
              this.cacheTextos.set(b.text, false);
            }
          }
          if (b.el) this.elementosEvaluados.add(b.el);
        });

        if (nuevosDetectados) {
          browserAPIShaming.runtime.sendMessage({ tipo: "MODO_AVISO" }).catch(() => {});
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
