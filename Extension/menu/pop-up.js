const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {
  const switches = document.querySelectorAll('input[type=checkbox]');
  const colorSelectors = document.querySelectorAll('input[type=color]');

  // 1. Setear switches con lo que haya en sync
  browserAPI.storage.sync.get("dpActivos", (result) => {
    const activos = result.dpActivos || {};
    switches.forEach((checkbox) => {
      checkbox.checked = !!activos[checkbox.id];
    });
  });

  // 2. Setear selectores de color con lo que haya en sync
  browserAPI.storage.sync.get("dpColores", (result) => {
    const colores = result.dpColores || {};
    colorSelectors.forEach((colorSelector) => {
      let dpTipo = colorSelector.id.replace("color_", "");
      if (colores[dpTipo]) {
        colorSelector.value = colores[dpTipo];
        ActualizarColorFila(dpTipo, colores[dpTipo]);
      }
    });
  });

  // 3. Manejar cambios de switches
  switches.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      browserAPI.storage.sync.get(["dpActivos", "dpColores"], (result) => {
        const nuevosEstados = result.dpActivos || {};
        const colores = result.dpColores || {};
        switches.forEach((item) => {
          let dpTipo = item.id;
          nuevosEstados[dpTipo] = item.checked;
          if (colores[dpTipo]) {
            ActualizarColorFila(dpTipo, colores[dpTipo]);
          }
        });
        browserAPI.storage.sync.set({ dpActivos: nuevosEstados }, () => {
          browserAPI.runtime.sendMessage({
            tipo: "DARK_PATTERNS_SELECTED",
          }).catch(() => {});
        });
      });
    });
  });

  // 4. Manejar cambios de selectores de color
  colorSelectors.forEach((colorSelector) => {
    colorSelector.addEventListener('input', () => {
      let dpTipo = colorSelector.id.replace("color_", "");
      ActualizarColorFila(dpTipo, colorSelector.value);
    });

    colorSelector.addEventListener('change', () => {
      const nuevosEstados = {};
      colorSelectors.forEach((item) => {
        let dpTipo = item.id.replace("color_", "");
        nuevosEstados[dpTipo] = item.value;
      });
      browserAPI.storage.sync.set({ dpColores: nuevosEstados });
    });
  });

  // 5. Pintar contadores iniciales desde storage.local
  async function paintCounts() {
    const cts = await browserAPI.storage.local.get({ 
      SHAMING: 0, 
      URGENCY: 0,
      SCARCITY: 0,
      HIDDENCOST: 0, 
      MISDIRECTION: 0, 
      PRESELECTION: 0 
    });
    
    let total = 0;
    for (const [k, c] of Object.entries(cts)) {
      const el = document.getElementById(`ct_${k}`);
      if (el) el.textContent = c;
      total += c;
    }
    const elTotal = document.getElementById("ct_total");
    if (elTotal) elTotal.textContent = total;
  }

  paintCounts();

  // 6. Escuchar mensajes de actualización
  browserAPI.runtime.onMessage.addListener((msg) => {
    if (msg?.action === "dpCountsUpdated") {
      const counts = msg.counts;
      let total = 0;
      for (const [k, c] of Object.entries(counts)) {
        const el = document.getElementById(`ct_${k}`);
        if (el) el.textContent = c;
        total += c;
      }
      const elTotal = document.getElementById("ct_total");
      if (elTotal) elTotal.textContent = total;
    }
  });

  // 7. Manejo del modo seleccionado para aviso
  browserAPI.storage.sync.get("modoSeleccionado", (result) => {
    const modo = result.modoSeleccionado || "TODO";
    const radio = document.getElementById(modo);
    if (radio) {
      radio.checked = true;
      PintarRadio(radio);
    }
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
        browserAPI.storage.sync.set({ modoSeleccionado: radio.value });
        browserAPI.runtime.sendMessage({
          tipo: "MODO_AVISO",
        }).catch(() => {});
      }
    });
  });
});

function ActualizarColorFila(dpTipo, color) {
  const dpSwitch = document.querySelector(`input[id=${dpTipo}]`);
  if (!dpSwitch) return;
  let parent = dpSwitch.parentElement;
  while (parent && parent !== document.documentElement && !parent.classList.contains("option")) {
    parent = parent.parentElement;
  }
  if (parent && parent.classList.contains("option")) {
    parent.style.boxShadow = dpSwitch.checked ? `inset 0 0 20px ${color}60` : "none";
  }
}

function PintarRadio(radio) {
  if (radio) {
    radio.style.background = '#3b82f6';
    radio.style.borderColor = '#3b82f6';
  }
}
