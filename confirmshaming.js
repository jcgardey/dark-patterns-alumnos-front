window.onload = (event) => {
  // Cuando termina de cargar una página la segmenta y manda a background
  let elements = segments(document.body);
  let filtered_elements = [];

  for (let i = 0; i < elements.length; i++) {
    if (elements[i].innerText === undefined) {
      continue;
    }
    let text = elements[i].innerText.trim().replace(/\t/g, " ");
    if (text.length == 0) {
      continue;
    }
    filtered_elements.push(text);
  }

  chrome.runtime.sendMessage({pattern: "SHAMING", data: filtered_elements}, (response) => {
    const { error, data } = response;
    if (error) {
      if (error.code === "ERR_NETWORK") console.log("El servidor no responde.");
      else console.log(error);
      }
    else
      console.log(data);
  });
};
