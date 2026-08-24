document.addEventListener('DOMContentLoaded', () => {
  const switches = document.querySelectorAll('input[type=checkbox]');
  const colorSelectors = document.querySelectorAll('input[type=color]');

  // 1. Setear switches con lo que haya en sync
  chrome.storage.sync.get("dpActivos", (result) => {
    const activos = result.dpActivos || {};
    switches.forEach((checkbox) => {
      checkbox.checked = !!activos[checkbox.id];
    });
  });

  // 2. Setear selectores de color con lo que haya en sync
  chrome.storage.sync.get("dpColores", (result) => {
    const colores = result.dpColores || {};
    colorSelectors.forEach(async (colorSelector) => {
      let dpTipo = colorSelector.id.replace("color_", "");
      colorSelector.value = colores[dpTipo];
      ActualizarColorFila(dpTipo, (await chrome.storage.sync.get('dpColores')).dpColores[dpTipo]);
    });
  });

  // 3. Manejar cambios de switches
  switches.forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      const nuevosEstados = {};
      await switches.forEach(async (item) => {
        let dpTipo = item.id;
        nuevosEstados[dpTipo] = item.checked;
        ActualizarColorFila(dpTipo, (await chrome.storage.sync.get('dpColores')).dpColores[dpTipo]);
      });
      chrome.storage.sync.set({ dpActivos: nuevosEstados });

      chrome.runtime.sendMessage({
        tipo: "DARK_PATTERNS_SELECTED",
      });
    });
  });

  // 4. Manejar cambios de selectores de color
  colorSelectors.forEach((colorSelector) => {
    colorSelector.addEventListener('input', () => {
      colorSelectors.forEach((item) => {
        let dpTipo = item.id.replace("color_", "");
        ActualizarColorFila(dpTipo, item.value);
      });
    });
  });
  colorSelectors.forEach((colorSelector) => {
    colorSelector.addEventListener('change', async () => {
      const nuevosEstados = {};
      await colorSelectors.forEach((item) => {
        let dpTipo = item.id.replace("color_", "");
        nuevosEstados[dpTipo] = item.value;
      });
      chrome.storage.sync.set({ dpColores: nuevosEstados });
    });
  });

  // 5. Pintar contadores iniciales desde storage.local
  async function paintCounts() {
    const cts = await chrome.storage.local.get({ 
      SHAMING: 0, 
      URGENCY: 0,
      SCARCITY: 0,
      HIDDENCOST: 0, 
      MISDIRECTION: 0, 
      PRESELECTION: 0 
    });
    
    let total = 0;

    for (const [k, c] of Object.entries(cts)){
      document.getElementById(`ct_${k}`).textContent = c;
      total += c;
    }

    document.getElementById("ct_total").textContent = total;
  }

  paintCounts();

  // 6. Escuchar mensajes de actualización
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.action === "dpCountsUpdated") {
      const counts = msg.counts;
      let total = 0;
      for (const [k, c] of Object.entries(counts)) {
        document.getElementById(`ct_${k}`).textContent = c;
        total += c;
      }
      document.getElementById("ct_total").textContent = total;
    }
  });

  // 7. Manejo del modo seleccionado para aviso
  chrome.storage.sync.get("modoSeleccionado", (result) => {
      const radio = document.getElementById(result.modoSeleccionado);
      radio.checked = true;
      PintarRadio(radio);
  });

  // 8. Pintar los radio buttons del modo de aviso
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

async function ActualizarColorFila(dpTipo, color) {
  const dpSwitch = document.querySelector(`input[id=${dpTipo}]`);
  let parent = dpSwitch.parentElement;
  while (parent != document.documentElement && !parent.classList.contains("option")) {
    parent = parent.parentElement;
  }
  if (parent.classList.contains("option")) {
    parent.style.boxShadow = dpSwitch.checked ? `inset 0 0 20px ${color}60` : "none";
  }
}

function PintarRadio(radio) {
    radio.style.background = '#3b82f6'; // azul
    radio.style.borderColor = '#3b82f6';
  }