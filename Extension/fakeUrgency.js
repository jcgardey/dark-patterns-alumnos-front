//Esta deteccion es temporal para realizar la deteccion en la muestra
const FakeUrgency = {
  tipo: DP_TYPES.URGENCY,
  detectados: new Set(),
  check: function() {
    const elementos = document.getElementsByClassName("tabular-nums");// es la clase de los elementos con timmers
    const padres= Array.from(elementos).map(e => e.parentElement);
    console.log(padres);
    const elemenFormat = padres.flatMap(p => {
      return Array.from(p.children)
          .map(c => {
              if (c.innerText === undefined) return null;
              return {
                  text: c.innerText.trim().replace(/\t/g, " "), 
                  path: XPATHINTERPRETER.getPath(c, document.body)?.[0]
              };
          })
          .filter(e => e !== null && e.text && e.text.length > 0);
    });
    console.log("FakeUrgency-Check" ,elemenFormat);

    chrome.runtime.sendMessage({ pattern: this.tipo, data: elemenFormat }, (response) => {
      const { error, data } = response;
      if (error) {
        if (error.code === "ERR_NETWORK") console.log("El servidor no responde.");
        else console.log(error);
      }
      else {
        data.urgency_instances.forEach((item) => {
          if(item.has_urgency)
            this.detectados.add(XPATHINTERPRETER.getElementByXPath(item.path, document.body));
        });
        console.log(this.detectados);
      }
    });
    },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}
