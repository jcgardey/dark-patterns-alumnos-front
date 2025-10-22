// Service Worker, se ejecuta en segundo plano y no tiene acceso al DOM directamente.
const DP_TYPES = {
  SHAMING: 'SHAMING',
  URGENCY: 'URGENCY',
  MISDIRECTION: 'MISDIRECTION',
  HIDDENCOST: 'HIDDENCOST',
  SCARCITY: 'SCARCITY',
  PRESELECTION: 'PRESELECTION'
}

//inicializo los dps en true
chrome.runtime.onInstalled.addListener(() => {
  const valoresPorDefecto = {
    SHAMING: false,
    URGENCY: false,
    HIDDENCOST: true,
    MISDIRECTION: true,
    PRESELECTION: true,
    SCARCITY: false
  };
  const modoSeleccionado = "TODO";
  chrome.storage.sync.set({ dpActivos: valoresPorDefecto, modoSeleccionado: modoSeleccionado }, () => {
    console.info("Valores por defecto de DP activos guardados.");
  });
});

// Listener para mensajes entrantes desde otras partes de la extensión
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Código comentado para cargar constantes desde un mensaje, se puede habilitar si es necesario
   if (message.tipo === "CONSTANTES") {
      DP_TYPES = message.DP_TYPES;
      console.info("Constantes cargadas.");
      sendResponse();
    }

  // Maneja el mensaje cuando se seleccionan Dark Patterns en la popup
  if (message.tipo === "DARK_PATTERNS_SELECTED") {
    sendMessageCurrentTab(
      {
        tipo: "ACTUALIZAR_DP",
      });
    sendResponse({ status: "Ok" });
  }

  if (message.tipo === "MODO_AVISO") {
    sendMessageCurrentTab({tipo: "MODO_AVISO"});
    sendResponse("Ok 2");
  }
});

// Envía un mensaje al contenido de la pestaña actual
function sendMessageCurrentTab(data) {
  getCurrentTab(function (tab) {
    chrome.tabs.sendMessage(tab.id, data);
  });
}

// Obtiene la pestaña actual activa y ejecuta el callback con la información de la pestaña
function getCurrentTab(callback) {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (chrome.runtime.lastError)
        console.error(chrome.runtime.lastError);
      // `tab` será una instancia de `tabs.Tab` o `undefined`.
      callback(tab);
    });
  } catch (err) {
    console.log("ServiceWorker>getCurrentTab: ",err);
  }
}

function sendRequest(url, data, callback) {
  // TODO: REVISAR SI LA CONVERSIÓN DESDE AXIOS A FETCH ES CORRECTA.
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    const responseData = await response.json();
    if (response.ok) {
      callback?.({ data: responseData });
    } else {
      callback?.({ error: responseData });
    }
  }).catch((error) => {
    error.code = "ERR_NETWORK";
    callback?.({ error });
  });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.pattern === DP_TYPES.SHAMING){
    sendRequest("http://localhost:5000/shaming", { tokens: request.data }, sendResponse);
  }else if (request.pattern === DP_TYPES.URGENCY){
    sendRequest("http://localhost:5000/urgency", { tokens: request.data }, sendResponse);
  }else if (request.pattern === DP_TYPES.SCARCITY){
    sendRequest("https://localhost:5000/scarcity", { tokens: request.data }, sendResponse);
  }
  return true;
});

