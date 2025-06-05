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
   if (message.tipo === "ACTUALIZAR_DP") {
     ejecutarDPsSeleccionados(); // Ejecutar inmediatamente cuando se reciben
     sendResponse({ status: "ejecutando patrones activos" });
   }

 });


// Ejecutar solo los DP seleccionados por el usuario
function ejecutarDPsSeleccionados() {
  chrome.storage.sync.get("dpActivos", (result) => {
  const dpActivos = result.dpActivos || {};
  DARK_PATTERNS.forEach((dp) => {
    if (dpActivos[dp.tipo]) {
      try {
        dp.check();
      } catch (e) {
        console.error("Error detectando el DP: " + dp.tipo, e);
      }
    }
    else {
      dp.clear();
    }
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



