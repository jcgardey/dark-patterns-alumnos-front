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
  axios
    .post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      if (callback) {
        callback(response);
      }
    });
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.test === "test"){
    sendResponse({ message: "Pasaje de mensajes anda."});
  }
});
