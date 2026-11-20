// Service Worker compatible con Chromium y Firefox Gecko
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const DP_TYPES = {
  SHAMING: 'SHAMING',
  URGENCY: 'URGENCY',
  MISDIRECTION: 'MISDIRECTION',
  HIDDENCOST: 'HIDDENCOST',
  SCARCITY: 'SCARCITY',
  PRESELECTION: 'PRESELECTION'
};

const API_BASE_URL = "https://dark-patterns-extension.lifia.info.unlp.edu.ar";

// Inicializa valores por defecto al instalar
browserAPI.runtime.onInstalled.addListener(() => {
  const valoresPorDefecto = {
    SHAMING: false,
    URGENCY: false,
    HIDDENCOST: false,
    PRESELECTION: false,
    MISDIRECTION: false,
    SCARCITY: false
  };
  const modoSeleccionado = "TODO";
  const coloresPorDefecto = {
    SHAMING: '#FF9500',
    URGENCY: '#FF0000',
    MISDIRECTION: '#0400FF',
    HIDDENCOST: '#1AFF00',
    PRESELECTION: '#EE82EE',
    SCARCITY: '#FFFF00'
  };

  browserAPI.storage.sync.get(["dpActivos", "modoSeleccionado", "dpColores"], (result) => {
    browserAPI.storage.sync.set({
      dpActivos: result.dpActivos || valoresPorDefecto,
      modoSeleccionado: result.modoSeleccionado || modoSeleccionado,
      dpColores: result.dpColores || coloresPorDefecto
    }, () => {
      console.info("Configuración por defecto de Dark Patterns guardada.");
    });
  });
});

// Listener para mensajes de control de la UI (popup)
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tipo === "DARK_PATTERNS_SELECTED") {
    sendMessageCurrentTab({ tipo: "ACTUALIZAR_DP" });
    sendResponse({ status: "Ok" });
    return true;
  }

  if (message.tipo === "MODO_AVISO") {
    sendMessageCurrentTab({ tipo: "MODO_AVISO" });
    sendResponse({ status: "Ok" });
    return true;
  }

  // Peticiones a la API de NLP desde los content scripts
  if (requestPatterns.includes(message.pattern)) {
    let endpoint = "";
    let payload = {};

    if (message.pattern === DP_TYPES.SHAMING) {
      endpoint = `${API_BASE_URL}/shaming`;
      payload = { Version: '1.0', tokens: message.data };
    } else if (message.pattern === DP_TYPES.URGENCY) {
      endpoint = `${API_BASE_URL}/urgency`;
      payload = { version: '1.0', texts: message.data };
    } else if (message.pattern === DP_TYPES.SCARCITY) {
      endpoint = `${API_BASE_URL}/scarcity`;
      payload = { version: '1.0', texts: message.data };
    }

    sendRequest(endpoint, payload, sendResponse);
    return true; // Respuesta asíncrona
  }
});

const requestPatterns = [DP_TYPES.SHAMING, DP_TYPES.URGENCY, DP_TYPES.SCARCITY];

function sendMessageCurrentTab(data) {
  getCurrentTab((tab) => {
    if (tab && tab.id) {
      browserAPI.tabs.sendMessage(tab.id, data).catch((err) => {
        // Pestaña en segundo plano o no receptiva
      });
    }
  });
}

function getCurrentTab(callback) {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    browserAPI.tabs.query(queryOptions, ([tab]) => {
      if (browserAPI.runtime.lastError) {
        console.error(browserAPI.runtime.lastError);
      }
      callback(tab);
    });
  } catch (err) {
    console.error("ServiceWorker>getCurrentTab:", err);
  }
}

function sendRequest(url, data, callback) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal: controller.signal
  }).then(async (response) => {
    clearTimeout(timeoutId);
    try {
      const responseData = await response.json();
      if (response.ok) {
        callback?.({ data: responseData });
      } else {
        callback?.({ error: responseData });
      }
    } catch (parseError) {
      callback?.({ error: { code: "ERR_PARSE", message: parseError.message } });
    }
  }).catch((error) => {
    clearTimeout(timeoutId);
    callback?.({
      error: {
        code: error.name === 'AbortError' ? 'ERR_TIMEOUT' : 'ERR_NETWORK',
        message: error.message
      }
    });
  });
}
