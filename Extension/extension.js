const DARK_PATTERNS = [
  Misdirection,
  HiddenCost,
  ConfirmShaming,
  FakeUrgency
]


// Al cargar la página, ejecutar los patrones activos
document.addEventListener("DOMContentLoaded", () => {
  ejecutarDPsSeleccionados();
});

// Recibir patrones activos desde el popup a través del service worker
 chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   if (message.tipo === "ACTUALIZAR_DP" || message.tipo === "MODO_AVISO") {
     ejecutarDPsSeleccionados(); // Ejecutar inmediatamente cuando se reciben
     sendResponse({ status: "ejecutando patrones activos" });
   }
 });


// Ejecutar solo los DP seleccionados por el usuario
function ejecutarDPsSeleccionados() {
  let elementos = {    
    SHAMING: [],
    URGENCY: [],
    MISDIRECTION: [],
    HIDDENCOST: []
  };

  chrome.storage.sync.get("dpActivos", (result) => {
    const dpActivos = result.dpActivos || {};
    DARK_PATTERNS.forEach((dp) => {
      if (dpActivos[dp.tipo]) {
        try {
          elementos[dp.tipo] = dp.check();
        } catch (e) {
          console.error("Error detectando el DP: " + dp.tipo, e);
        }
      }
      else {
        dp.clear();
      }
  });

  chrome.storage.sync.get("modoSeleccionado", (res) => {
    DARK_PATTERNS.forEach((dp) => {
      dp.clear();
      switch (res.modoSeleccionado) {
        case "TODO":
          console.log("PINTANDO TODO", elementos[dp.tipo]);
          for (elem in elementos[dp.tipo]){
            resaltarElementoConTexto(elementos[dp.tipo][elem], dp.tipo);
          }
          break;
        case "MARCA":
          console.log("PINTANDO BORDE");
          for (elem in elementos[dp.tipo]) {
            resaltarBorde(elementos[dp.tipo][elem], dp.tipo);
          }
          break;
        default:
          console.log("Modo selec: ", res.modoSeleccionado);
          break;
      }
    })
  });
});

}

// Observer solo ejecuta el callback 1 segundos después de la ultima mutación
// En páginas que cambian constantemente no sirve
let previousURL = '';
let timer;
const observer = new MutationObserver(function (mutation) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    ejecutarDPsSeleccionados();
  }, 100);
});

observer.observe(document, { childList: true, subtree: true });

//chrome.runtime.sendMessage({ tipo: "CONSTANTES", DP_TYPES: DP_TYPES });



