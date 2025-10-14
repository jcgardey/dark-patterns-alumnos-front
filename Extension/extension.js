const DARK_PATTERNS = {
  MISDIRECTION: Misdirection,
  HIDDENCOST: HiddenCost,
  SHAMING: ConfirmShaming,
  URGENCY: FakeUrgency
}

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

function PintarAnalizados() {
  chrome.storage.sync.get(["dpActivos", "modoSeleccionado"], (result) => {
    const dpActivos = result.dpActivos || {};
    const modoSeleccionado = result.modoSeleccionado || "TODO";
    
    // console.log("Pintando elementos detectados:", dpActivos, modoSeleccionado);
    
    for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
      if (boolActivo && DARK_PATTERNS[dpNombre]) {
        const detectados = DARK_PATTERNS[dpNombre].detectados;
        // console.log(`Elementos detectados para ${dpNombre}:`, detectados);
        
        if (detectados && detectados.length > 0) {
          setCountForType(dpNombre, detectados.length);
          switch (modoSeleccionado) {
            case "TODO":
              // console.log("PINTANDO TODO para", dpNombre);
              detectados.forEach(elem => {
                if (elem) {
                  resaltarElementoConTexto(elem, DARK_PATTERNS[dpNombre].tipo);
                }
              });
              break;
            case "MARCA":
              // console.log("PINTANDO BORDE para", dpNombre);
              detectados.forEach(elem => {
                if (elem) {
                  resaltarBorde(elem, DARK_PATTERNS[dpNombre].tipo);
                }
              });
              break;
            default:
              // console.log("Modo seleccionado desconocido:", modoSeleccionado);
              break;
          }
        } else {
          // console.log(`No hay elementos detectados para ${dpNombre}`);
          DARK_PATTERNS[dpNombre].clear();
        }
      }
    }
  });
}

// Ejecutar solo los DP seleccionados por el usuario
function ejecutarDPsSeleccionados() {
  chrome.storage.sync.get("dpActivos", async (result) => {
    const estadosDp = result.dpActivos || {};
    let activos = [];
    
    // Crear array de DPs a excluir
    for (const [dp, valor] of Object.entries(estadosDp)) {
      if (valor) {
        activos.push(dp);
      }
    }

    console.log("LLEGA");
    
    for (const tipoDP of Object.values(activos)) {
      try{
        DARK_PATTERNS[tipoDP].check();
        
        console.log("chequea ");
      } catch (e) {
        console.log(e);
      }
      
    }
    
    // Pintar resultados
    PintarAnalizados();
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
  }, 500); // 5 segundos para menos ejecuciones
});

observer.observe(document, { childList: true, subtree: true });

//chrome.runtime.sendMessage({ tipo: "CONSTANTES", DP_TYPES: DP_TYPES });



