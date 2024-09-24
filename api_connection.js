window.onload = (event) => {
  // Cuando termina de cargar una página le avisa a background y espera respuesta.
  chrome.runtime.sendMessage({test: "test"}, response => {
  if (!response)
    console.error("This was a fiasco :", runtime.lastError.message);
  else
    console.log(response);
  });
};
