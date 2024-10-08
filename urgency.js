// Cuando termina de cargar una página la segmenta y manda a background
let elements_urgency = segments(document.body);
let filtered_elements_urgency = [];

for (let i = 0; i < elements_urgency.length; i++) {
  if (elements_urgency[i].innerText === undefined) {
    continue;
  }
  let text = elements_urgency[i].innerText.trim().replace(/\t/g, " ");
  if (text.length == 0) {
    continue;
  }
  filtered_elements_urgency.push(text);
}

chrome.runtime.sendMessage({pattern: "URGENCY", data: filtered_elements_urgency}, (response) => {
  const { error, data } = response;
  if (error) {
    if (error.code === "ERR_NETWORK") console.log("El servidor no responde.");
    else console.log(error);
    }
  else
    console.log(data);
});
