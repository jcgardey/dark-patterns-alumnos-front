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
});
