  document.addEventListener('DOMContentLoaded', () => {

  const switches = document.querySelectorAll('input[type=checkbox]');



    chrome.storage.sync.get("dpActivos", (result) => {
      const activos = result.dpActivos || {};
      console.info("QUE TIENE EL GET?:", result);
      // Setear el estado inicial de los checkboxes en el DOM
    switches.forEach((checkbox) => {
        checkbox.checked = !!activos[checkbox.id];
      });
    });

    // 2. Manejar cambios en los checkboxes sin volver a hacer un get
    switches.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        // Armar nuevo estado desde el DOM directamente
        const nuevosEstados = {};
        const seleccionados = [];

        switches.forEach((item) => {
          nuevosEstados[item.id] = item.checked;
          if (item.checked) seleccionados.push(item.id);
        });

        // Guardar nuevo estado en storage
        chrome.storage.sync.set({ dpActivos: nuevosEstados });

        console.info("Nuevos estados de DP guardados:", nuevosEstados);
        
        // Enviar los patrones seleccionados al service worker
        chrome.runtime.sendMessage({
          tipo: "DARK_PATTERNS_SELECTED",
        }, (response) => {
          console.log("Respuesta del service worker:", response);
        });
      });
    });
  });
