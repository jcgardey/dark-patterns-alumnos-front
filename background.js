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
    .then(({ data }) => {
      if (callback) {
        callback({ data });
      }
    })
    .catch((error) => {
      callback({ error });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.pattern === "SHAMING"){
    sendRequest("http://localhost:5000/shaming", { tokens: request.data }, sendResponse);
    return true;
  }
  if (request.pattern === "URGENCY"){
    sendRequest("http://localhost:5000/urgency", { tokens: request.data }, sendResponse);
    return true;
  }
});

