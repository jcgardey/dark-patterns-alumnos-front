// Objeto a usar en extension.js
const ConfirmShaming = {
  tipo: DP_TYPES.SHAMING,
  detectados: new Set(),
  bloquesPendientes: [],
  esperandoRta: false,

  check: function () {
    const invalidTags = ["INPUT"];
    const buttonTags = ["BUTTON", "A"];
    let elements_shaming = segments(document.body);
    let filtered_elements_shaming = [];

    // 1. Recopilar TODOS los elementos válidos de la página primero
    for (let i = 0; i < elements_shaming.length; i++) {
      const element = elements_shaming[i];

      if (!buttonTags.includes(element.nodeName)) continue;

      let invalidElement = false;
      if (invalidTags.includes(element.nodeName)) invalidElement = true;
      for (const child of element.children) {
        if (invalidTags.includes(child.nodeName)) invalidElement = true;
      }
      if (invalidElement) continue;

      if (element.innerText === undefined) continue;
      let text = element.innerText.trim().replace(/\t/g, " ");
      if (text.length === 0) continue;

      let path = XPATHINTERPRETER.getPath(element, document.body)?.[0];
      if (path) {
        filtered_elements_shaming.push({ text: text, path: path });
      }
    }

    // Si no encontramos elementos válidos, no hacemos nada
    if (filtered_elements_shaming.length === 0) return;

    // 2. Filtrar descartando los que ya están detectados o en la cola de pendientes
    const nuevosSinRepetir = filtered_elements_shaming.filter(nuevo =>
      !this.bloquesPendientes.some(existente => existente.path === nuevo.path) &&
      ![...this.detectados].some(existente => XPATHINTERPRETER.getPath(existente, document.body)?.[0] === nuevo.path)
    );

    if (nuevosSinRepetir.length === 0) return;

    if (this.esperandoRta) {
      console.log("ConfirmShaming: Esperando respuesta del background service, encolando bloques");
      this.bloquesPendientes = [...this.bloquesPendientes, ...nuevosSinRepetir];
      return;
    }

    this.sendMessage(nuevosSinRepetir);
  },

  sendMessage: function (data) {
    this.esperandoRta = true;
    console.log(`ConfirmShaming: Enviando ${data.length} bloques nuevos al background service`);

    chrome.runtime.sendMessage({ pattern: this.tipo, data: data }, (response) => {
      const { error, data: resData } = response || {};

      if (error) {
        if (error.code === "ERR_NETWORK") console.log("ConfirmShaming>check: El servidor no responde.", error);
        else console.log("ConfirmShaming>check: ", error);
      } else if (resData) {
        console.log("ConfirmShaming>check: ", resData);

        // Si el backend devuelve un array directo de elementos confirmados
        const detectadosList = Array.isArray(resData) ? resData : (resData.instances || []);

        detectadosList.forEach((res) => {
          if (res.has_shaming !== false) {
            const el = XPATHINTERPRETER.getElementByXPath(res.path || res, document.body);
            if (el) this.detectados.add(el);
          }
        });

        chrome.runtime.sendMessage({ tipo: "MODO_AVISO" });
      }

      // Procesa la cola acumulada durante la espera
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