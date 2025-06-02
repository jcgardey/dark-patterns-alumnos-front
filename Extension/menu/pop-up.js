document.querySelectorAll('input[type=checkbox]').forEach((checkbox) => {
	// Inicializar el estado del checkbox desde chrome.storage
	chrome.storage.sync.get([checkbox.id], (result) => {
		checkbox.checked = result[checkbox.id] || false;
	});
    checkbox.addEventListener('change', () => {
      const state = checkbox.checked;
      const id = checkbox.id;
	  chrome.storage.sync.set({ [id]: state });
      // Puedes guardar esto con chrome.storage si quieres persistencia
    });
  });
  