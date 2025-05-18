document.querySelectorAll('input[type=checkbox]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const state = checkbox.checked;
      const id = checkbox.id;
      console.log(`${id} is now ${state}`);
      // Puedes guardar esto con chrome.storage si quieres persistencia
    });
  });
  