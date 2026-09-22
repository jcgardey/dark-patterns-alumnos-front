// Objeto a usar en extension.js
const FakeScarcity = {
  tipo: DP_TYPES.SCARCITY,
  detectados: new Set(),
  bloquesPendientes: [],
  esperandoRta: false,

  check: function () {
    let elements_scarcity = segments(document.body);
    let filtered_elements_scarcity = [];

    // 1. Recopilar todos los elementos válidos del DOM
    for (let i = 0; i < elements_scarcity.length; i++) {
      if (elements_scarcity[i].innerText === undefined) continue;

      let text = elements_scarcity[i].innerText.trim().replace(/\t/g, " ");
      if (text.length === 0) continue;

      let path = XPATHINTERPRETER.getPath(elements_scarcity[i], document.body)?.[0];
      if (path) {
        filtered_elements_scarcity.push({ text, path });
      }
    }

    // Si no hay elementos relevantes en la página, no hacemos nada
    if (filtered_elements_scarcity.length === 0) return;

    // 2. Descartar elementos que ya están detectados o que ya están en la cola de pendientes
    const nuevosSinRepetir = filtered_elements_scarcity.filter(nuevo =>
      !this.bloquesPendientes.some(existente => existente.path === nuevo.path) &&
      ![...this.detectados].some(existente => XPATHINTERPRETER.getPath(existente, document.body)?.[0] === nuevo.path)
    );

    if (nuevosSinRepetir.length === 0) return;

    if (this.esperandoRta) {
      console.log("FakeScarcity: Esperando respuesta del background service, encolando bloques");
      this.bloquesPendientes = [...this.bloquesPendientes, ...nuevosSinRepetir];
      return;
    }

    this.sendMessage(nuevosSinRepetir);
  },

  sendMessage: function (data) {
    this.esperandoRta = true;
    console.log(`FakeScarcity: Enviando ${data.length} bloques nuevos al background service`);

    chrome.runtime.sendMessage({ pattern: this.tipo, data: data }, (response) => {
      const { error, data: resData } = response || {};

      if (error) {
        if (error.code === "ERR_NETWORK") console.log("FakeScarcity>check: El servidor no responde.", error);
        else console.log("FakeScarcity>check: ", error);
      } else if (resData && resData.instances) {
        console.log("FakeScarcity>check: ", resData);

        // Guardar solo los que den positivos (has_scarcity === true)
        resData.instances.forEach((instancia) => {
          if (instancia.has_scarcity) {
            const el = XPATHINTERPRETER.getElementByXPath(instancia.path, document.body);
            if (el) this.detectados.add(el);
          }
        });

        chrome.runtime.sendMessage({ tipo: "MODO_AVISO" });
      }

      // Procesar la cola si llegaron nuevos bloques mientras se esperaba la respuesta
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