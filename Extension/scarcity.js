// Objeto a usar en extension.js
const FakeScarcity = {
  tipo: DP_TYPES.SCARCITY,
  detectados: new Set(),
  check: function() {
    let elements_scarcity = segments(document.body);
    let filtered_elements_scarcity = [];

    for (let i = 0; i < elements_scarcity.length; i++) {
      if (elements_scarcity[i].innerText === undefined) {
        continue;
      }
      let text = elements_scarcity[i].innerText.trim().replace(/\t/g, " ");
      if (text.length == 0) {
        continue;
      }
      let path = XPATHINTERPRETER.getPath(elements_scarcity[i], document.body);
      filtered_elements_scarcity.push({ text, path });
    }

    chrome.runtime.sendMessage({pattern: this.tipo, data: filtered_elements_scarcity}, (response) => {
      const { error, data } = response;
      if (error) {
        if (error.code === "ERR_NETWORK") console.log("Scarcity>check: El servidor no responde.");
        else console.log("Scarcity>check: ",error);
        }
      else {
        console.log("Scarcity>check: ",data);
        data.forEach((instancia) => {
          if (instancia.has_scarcity)
            this.detectados.add(XPATHINTERPRETER.getElementByXPath(instancia.path, document.body));
        });
      }
    });
  },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}
