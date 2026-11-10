const browserAPIExtension = typeof browser !== 'undefined' ? browser : chrome;

const DARK_PATTERNS = {
  MISDIRECTION: Misdirection,
  HIDDENCOST: HiddenCost,
  SHAMING: ConfirmShaming,
  URGENCY: FakeUrgency,
  SCARCITY: FakeScarcity,
  PRESELECTION: Preselection,
};

function iniciarExtension() {
  inyectarFuenteEnCSS();
  DARK_PATTERNS.PRESELECTION.init();
  ejecutarDPsSeleccionados();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarExtension);
} else {
  iniciarExtension();
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    for (const dpNombre of Object.keys(DARK_PATTERNS)) {
      desresaltarElementoConTipo(dpNombre);
    }
    PintarAnalizados();
  }
});

// Recibir patrones activos desde el popup a través del service worker
browserAPIExtension.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tipo === "ACTUALIZAR_DP") {
    browserAPIExtension.storage.sync.get(["dpActivos"], (result) => {
      const dpActivos = result.dpActivos || {};
      for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
        if (!boolActivo) {
          desresaltarElementoConTipo(dpNombre);
        }
      }
      PintarAnalizados();
    });
    sendResponse({ status: "ejecutando patrones activos" });
    return true;
  }

  if (message.tipo === "MODO_AVISO") {
    browserAPIExtension.storage.sync.get(["dpActivos"], (result) => {
      const dpActivos = result.dpActivos || {};
      for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
        if (boolActivo) {
          desresaltarElementoConTipo(dpNombre);
        }
      }
      PintarAnalizados();
    });
    sendResponse({ status: "modo aviso actualizado" });
    return true;
  }
});

function PintarAnalizados() {
  browserAPIExtension.storage.sync.get(["dpActivos", "modoSeleccionado"], async (result) => {
    const dpActivos = result.dpActivos || {};
    const modoSeleccionado = result.modoSeleccionado || "TODO";

    for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
      if (boolActivo && DARK_PATTERNS[dpNombre]) {
        const detectados = [...DARK_PATTERNS[dpNombre].detectados];

        if (detectados && detectados.length > 0) {
          await setCountForType(dpNombre, detectados.length);
          switch (modoSeleccionado) {
            case "TODO":
              detectados.forEach(elem => {
                if (elem && elem.isConnected) {
                  resaltarElementoConTexto(elem, DARK_PATTERNS[dpNombre].tipo);
                }
              });
              break;
            case "MARCA":
              detectados.forEach(elem => {
                if (elem && elem.isConnected) {
                  resaltarBorde(elem, DARK_PATTERNS[dpNombre].tipo);
                }
              });
              break;
            default:
              break;
          }
        } else {
          DARK_PATTERNS[dpNombre].clear();
        }
      }
    }
  });
}

// Ejecutar solo los DP seleccionados por el usuario
function ejecutarDPsSeleccionados() {
  browserAPIExtension.storage.sync.get("dpActivos", (result) => {
    const estadosDp = result.dpActivos || {};
    const activos = [];

    for (const [dp, valor] of Object.entries(estadosDp)) {
      if (valor) {
        activos.push(dp);
      }
    }

    for (const tipoDP of activos) {
      if (DARK_PATTERNS[tipoDP] && typeof DARK_PATTERNS[tipoDP].check === "function") {
        try {
          DARK_PATTERNS[tipoDP].check();
        } catch (e) {
          console.warn("Extension>ejecutarDPsSeleccionados:", e);
        }
      }
    }

    PintarAnalizados();
  });
}

// Observer optimizado: filtra mutaciones internas y ejecuta debounce inteligente
let timerObserver;
const observer = new MutationObserver((mutationsList) => {
  let relevantChange = false;
  let preselectionChange = false;

  for (let i = 0; i < mutationsList.length; i++) {
    const mutation = mutationsList[i];
    const target = mutation.target;

    // Ignorar mutaciones en el propio cartel o atributos aplicados por la extensión
    if (target) {
      if (target.id === 'cartelInfoDarkPattern_ext' || (target.closest && target.closest('#cartelInfoDarkPattern_ext'))) {
        continue;
      }
      if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName?.startsWith('data-dark-pattern'))) {
        continue;
      }
    }

    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.id === 'cartelInfoDarkPattern_ext') continue;
          relevantChange = true;
          if (
            (node.matches && node.matches("input[type='checkbox'], input[type='radio'], select, option")) ||
            (node.querySelector && node.querySelector("input[type='checkbox'], input[type='radio'], select, option"))
          ) {
            preselectionChange = true;
          }
        }
      }
    } else if (mutation.type === 'characterData') {
      relevantChange = true;
    }
  }

  if (!relevantChange) return;

  if (preselectionChange) {
    DARK_PATTERNS.PRESELECTION.init();
  }

  if (timerObserver) clearTimeout(timerObserver);
  timerObserver = setTimeout(() => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        ejecutarDPsSeleccionados();
      }, { timeout: 1500 });
    } else {
      ejecutarDPsSeleccionados();
    }
  }, 800);
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  });
}
