// Objeto a usar en extension.js
const FakeUrgency = {
  tipo: DP_TYPES.URGENCY,
  check: function() {
    let elements_urgency = segments(document.body);
    let filtered_elements_urgency = [];

    for (let i = 0; i < elements_urgency.length; i++) {
      if (elements_urgency[i].innerText === undefined) {
        continue;
      }
      let text = elements_urgency[i].innerText.trim().replace(/\t/g, " ");
      if (text.length == 0) {
        continue;
      }
      let path = XPATHINTERPRETER.getPath(elements_urgency[i], document.body);
      filtered_elements_urgency.push({ text, path });
    }

    chrome.runtime.sendMessage({pattern: this.tipo, data: filtered_elements_urgency}, (response) => {
      const { error, data } = response;
      if (error) {
        if (error.code === "ERR_NETWORK") console.log("El servidor no responde.");
        else console.log(error);
        }
      else {
        let nodes = [];
        data.forEach((item) => {
          nodes.push(XPATHINTERPRETER.getElementByXPath(item.path[0], document.body));
        });
        nodes.forEach((node) => resaltarElementoConTexto(node, this.tipo));
      }
    });
  },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}
