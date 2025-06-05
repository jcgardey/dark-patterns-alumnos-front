// Objeto a usar en extension.js
const ConfirmShaming = {
  tipo: DP_TYPES.SHAMING,
  check: function () {
    const invalidTags = ["INPUT"];
    let elements_shaming = segments(document.body);
    let filtered_elements_shaming = [];

    for (let i = 0; i < elements_shaming.length; i++) {
      const element = elements_shaming[i];
      let invalidElement = false;

      if (invalidTags.includes(element.nodeName)) invalidElement = true;
      for (const child of element.children) {
        if (invalidTags.includes(child.nodeName)) invalidElement = true;
      }
      if (invalidElement) continue;

      if (element.innerText === undefined) continue;
      let text = element.innerText.trim().replace(/\t/g, " ");
      if (text.length == 0) {
        continue;
      }
      let path = XPATHINTERPRETER.getPath(element, document.body);
      filtered_elements_shaming.push({ text, path });
    }
    
    chrome.runtime.sendMessage({ pattern: this.tipo, data: filtered_elements_shaming }, (response) => {
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
