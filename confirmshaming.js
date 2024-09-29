// Cuando termina de cargar una página la segmenta y manda a background
let elements_shaming = segments(document.body);
let filtered_elements_shaming = [];

for (let i = 0; i < elements_shaming.length; i++) {
  if (elements_shaming[i].innerText === undefined) {
    continue;
  }
  let text = elements_shaming[i].innerText.trim().replace(/\t/g, " ");
  if (text.length == 0) {
    continue;
  }
  filtered_elements_shaming.push(text);
}

chrome.runtime.sendMessage({pattern: "SHAMING", data: filtered_elements_shaming}, (response) => {
  const { error, data } = response;
  if (error) {
    if (error.code === "ERR_NETWORK") console.log("El servidor no responde.");
    else console.log(error);
    }
  else
    console.log(data);
});
