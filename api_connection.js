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

  chrome.runtime.sendMessage({test: "test", filtered_elements}, response => {
  if (!response)
    console.error("This was a fiasco :", runtime.lastError.message);
  else
    console.log(response);
  });
};
