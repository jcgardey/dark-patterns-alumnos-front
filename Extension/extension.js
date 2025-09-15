// Al cargar la página, ejecutar los patrones activos
document.addEventListener("DOMContentLoaded", () => {
  ejecutarDPsSeleccionados();
});

// Recibir patrones activos desde el popup a través del service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tipo === "ACTUALIZAR_DP") {
    chrome.storage.sync.get(["dpActivos"], (result) => {
      const dpActivos = result.dpActivos || {};
      // console.log("dpActivos recibidos:", dpActivos);
      
      for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
        if (!boolActivo) {
          desresaltarElementoConTipo(dpNombre);
        }else{
          PintarAnalizados();
        }
      }
    });

    sendResponse({ status: "ejecutando patrones activos" });
  }else if (message.tipo === "MODO_AVISO"){
    chrome.storage.sync.get(["dpActivos"], (result) => {
      const dpActivos = result.dpActivos || {};
      // console.log("dpActivos recibidos:", dpActivos);
      
      for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
        if (boolActivo) {
          desresaltarElementoConTipo(dpNombre);
          PintarAnalizados();
        }
      }
    });
  }
});

const ignoreElements = ['script', 'style', 'noscript', 'br', 'hr', 'input'];

let analizadores = {
  [DP_TYPES_ENUM.HIDDENCOST]: new AnalizadorHiddenCost(DP_TYPES_ENUM.HIDDENCOST, DP_COLORS.HIDDENCOST, 40),
  [DP_TYPES_ENUM.MISDIRECTION]: new AnalizadorMisdirection(DP_TYPES_ENUM.MISDIRECTION, DP_COLORS.MISDIRECTION, 0.2, 0.5),
  [DP_TYPES_ENUM.URGENCY]: new AnalizadorNLP(DP_TYPES_ENUM.URGENCY, DP_COLORS.URGENCY, ignoreElements),
  [DP_TYPES_ENUM.SHAMING]: new AnalizadorNLP(DP_TYPES_ENUM.SHAMING, DP_COLORS.SHAMING, ignoreElements),
}

function PintarAnalizados() {
  chrome.storage.sync.get(["dpActivos", "modoSeleccionado"], (result) => {
    const dpActivos = result.dpActivos || {};
    const modoSeleccionado = result.modoSeleccionado || "TODO";
    
    // console.log("Pintando elementos detectados:", dpActivos, modoSeleccionado);
    
    for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
      if (boolActivo && analizadores[dpNombre]) {
        const detectados = analizadores[dpNombre].detectados;
        // console.log(`Elementos detectados para ${dpNombre}:`, detectados);
        
        if (detectados && detectados.length > 0) {
          switch (modoSeleccionado) {
            case "TODO":
              // console.log("PINTANDO TODO para", dpNombre);
              detectados.forEach(elem => {
                if (elem) {
                  resaltarElementoConTexto(elem, analizadores[dpNombre].tipo);
                }
              });
              break;
            case "MARCA":
              // console.log("PINTANDO BORDE para", dpNombre);
              detectados.forEach(elem => {
                if (elem) {
                  resaltarBorde(elem, analizadores[dpNombre].tipo);
                }
              });
              break;
            default:
              // console.log("Modo seleccionado desconocido:", modoSeleccionado);
              break;
          }
        } else {
          // console.log(`No hay elementos detectados para ${dpNombre}`);
        }
      }
    }
  });
}

// Ejecutar solo los DP seleccionados por el usuario
function ejecutarDPsSeleccionados() {
  analizadores = {
    [DP_TYPES_ENUM.HIDDENCOST]: new AnalizadorHiddenCost(DP_TYPES_ENUM.HIDDENCOST, DP_COLORS.HIDDENCOST, 40),
    [DP_TYPES_ENUM.MISDIRECTION]: new AnalizadorMisdirection(DP_TYPES_ENUM.MISDIRECTION, DP_COLORS.MISDIRECTION, 0.2, 0.5),
    [DP_TYPES_ENUM.URGENCY]: new AnalizadorNLP(DP_TYPES_ENUM.URGENCY, DP_COLORS.URGENCY, ignoreElements),
    [DP_TYPES_ENUM.SHAMING]: new AnalizadorNLP(DP_TYPES_ENUM.SHAMING, DP_COLORS.SHAMING, ignoreElements),
  }
  // console.log("Iniciando ejecución de DPs seleccionados");
  
  chrome.storage.sync.get("dpActivos", (result) => {
    const dpActivos = result.dpActivos || {};
    let excepto = [];
    
    // Crear array de DPs a excluir
    for (const [dp, valor] of Object.entries(dpActivos)) {
      if (!valor) {
        excepto.push(dp);
      }
    }
    
    // console.log("DPs activos:", dpActivos);
    // console.log("DPs a excluir:", excepto);
    // console.log("Analizadores disponibles:", Object.keys(analizadores));
    
    // Crear recorredor con solo los analizadores disponibles
    let recorredor = new Recorredor(Object.values(analizadores));
    
    // Procesar DOM
    recorredor.ProcesarDOM(excepto);
    
    // Pintar resultados
    PintarAnalizados();
  });
}

// Observer solo ejecuta el callback 1 segundos después de la ultima mutación
let timer;
const observer = new MutationObserver(function (mutations) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    console.log("DOM mutado, reejecutando análisis");
    ejecutarDPsSeleccionados();
  }, 1000); // Aumentado a 1 segundo para evitar demasiadas ejecuciones
});

observer.observe(document, { childList: true, subtree: true });