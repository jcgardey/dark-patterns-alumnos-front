//Esta deteccion es temporal para realizar la deteccion en la muestra


const fakeUrgency = {
  tipo: DP_TYPES.URGENCY,
  detectados: new Set(),
  check: function() {
    const elementos = document.getElementsByClassName("tabular-nums");// es la clase de los elementos con timmers
    const padres= elementos.map(e => { padres.push(e.parentElement);  
    });
    const elemenFormat = padres.flatMap( p => { p.children.map(c=>{ // Obtiene una coleccion de los textos
        if (c.innerText === undefined) return;
        return {text : c.innerText.trim().replace(/\t/g, " "), path: XPATHINTERPRETER.getPath(c, document.body) };
        }).filter(e => {e => e.text && e.text.length > 0});
    })

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
        nodes.forEach((node) => this.detectados.add(node));
      }
    });
    },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}
