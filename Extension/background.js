let DP_TYPES;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tipo === "CONSTANTES") {
    DP_TYPES = message.DP_TYPES;
    console.info("Constantes cargadas.")
  }
});

function sendMessageCurrentTab(data) {
  getCurrentTab(function (tab) {
    chrome.tabs.sendMessage(tab.id, data);
  });
}

function getCurrentTab(callback) {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (chrome.runtime.lastError)
      console.error(chrome.runtime.lastError);
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      callback(tab);
    });
  } catch (err) {
    console.log('exception');
    console.log(err);
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
    callback?.({ error });
  });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.pattern === DP_TYPES.SHAMING){
    sendRequest("http://localhost:5000/shaming", { tokens: request.data }, sendResponse);
    return true;
  }
  if (request.pattern === DP_TYPES.URGENCY){
    sendRequest("http://localhost:5000/urgency", { tokens: request.data }, sendResponse);
    return true;
  }
});

