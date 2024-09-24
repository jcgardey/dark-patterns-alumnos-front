window.onload = (event) => {
  chrome.runtime.sendMessage("test");
  console.log("Script manda un msg");
  chrome.runtime.onMessage.addListener((request, sender) => {
    console.log("Script recibe un msg");
    console.log(request.message);
  });
};
