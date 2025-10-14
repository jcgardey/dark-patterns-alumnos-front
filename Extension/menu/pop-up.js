document.addEventListener('DOMContentLoaded', () => {
  const switches = document.querySelectorAll('input[type=checkbox]');

  // 1. Setear switches con lo que haya en sync
  chrome.storage.sync.get("dpActivos", (result) => {
    const activos = result.dpActivos || {};
    switches.forEach((checkbox) => {
      checkbox.checked = !!activos[checkbox.id];
    });
  });

  // 2. Manejar cambios de switches
  switches.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const nuevosEstados = {};
      switches.forEach((item) => {
        nuevosEstados[item.id] = item.checked;
      });
      chrome.storage.sync.set({ dpActivos: nuevosEstados });

      chrome.runtime.sendMessage({
        tipo: "DARK_PATTERNS_SELECTED",
      });
    });
  });

  // 3. Pintar contadores iniciales desde storage.local
  async function paintCounts() {
    const { dpCounts } = await chrome.storage.local.get({ dpCounts: null });
    if (!dpCounts) return;
    document.getElementById("ct_SHAMING").textContent = dpCounts.SHAMING ?? 0;
    document.getElementById("ct_URGENCY").textContent = dpCounts.URGENCY ?? 0;
    document.getElementById("ct_HIDDENCOST").textContent = dpCounts.HIDDENCOST ?? 0;
    document.getElementById("ct_MISDIRECTION").textContent = dpCounts.MISDIRECTION ?? 0;
    document.getElementById("ct_total").textContent = dpCounts.total ?? 0;
  }

  paintCounts();

  // 4. Escuchar mensajes de actualización
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.action === "dpCountsUpdated") {
      const counts = msg.counts;
      document.getElementById("ct_SHAMING").textContent = counts.SHAMING ?? 0;
      document.getElementById("ct_URGENCY").textContent = counts.URGENCY ?? 0;
      document.getElementById("ct_HIDDENCOST").textContent = counts.HIDDENCOST ?? 0;
      document.getElementById("ct_MISDIRECTION").textContent = counts.MISDIRECTION ?? 0;
      document.getElementById("ct_total").textContent = counts.total ?? 0;
    }
  });

  // 5. Manejo del modo seleccionado para aviso
  chrome.storage.sync.get("modoSeleccionado", (result) => {
      const radio = document.getElementById(result.modoSeleccionado);
      radio.checked = true;
      PintarRadio(radio);
  });

  // 6. Pintar los radio buttons del modo de aviso
  document.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[type=radio]').forEach(r => {
        r.style.background = '';
        r.style.borderColor = '#cccccc';
      });
      if (radio.checked) {
        PintarRadio(radio);
        chrome.storage.sync.set({modoSeleccionado: radio.value})
        chrome.runtime.sendMessage({
          tipo: "MODO_AVISO",
        }, (response) => console.log("Rta del worker ", response))
      }
    });
  });
});

function PintarRadio(radio){
    radio.style.background = '#3b82f6'; // azul
    radio.style.borderColor = '#3b82f6';
  }