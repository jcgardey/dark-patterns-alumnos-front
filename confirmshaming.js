const confirmShamingScript = function() {
  let elements_shaming = segments(document.body);
  let filtered_elements_shaming = [];

  for (let i = 0; i < elements_shaming.length; i++) {
    if (elements_shaming[i].innerText === undefined) {
      continue;
    }
    let text = elements_shaming[i].innerText.trim().replace(/\t/g, " ");
    if (text.length == 0) {
      continue;
    }
    let path = XPATHINTERPRETER.getPath(elements_shaming[i], document.body);
    filtered_elements_shaming.push({ text, path });
  }

  chrome.runtime.sendMessage({pattern: "SHAMING", data: filtered_elements_shaming}, (response) => {
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
      nodes.forEach((node) => resaltarElementoConTexto(node, "Confirm Shaming"));
    }
  });
}
