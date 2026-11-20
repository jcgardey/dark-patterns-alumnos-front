const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const DEFAULT_COLORES = {
  SHAMING: '#FF9500',
  URGENCY: '#FF0000',
  MISDIRECTION: '#0400FF',
  HIDDENCOST: '#1AFF00',
  PRESELECTION: '#EE82EE',
  SCARCITY: '#FFFF00'
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPatronesYColores();
  initModoAviso();
  listenStorageChanges();
});

// --- Navegación entre pestañas (Configuración vs Quiénes Somos) ---
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-pill');
  const viewSections = {
    'configuracion': document.getElementById('viewConfig'),
    'quienes-somos': document.getElementById('viewAbout')
  };

  function switchTab(viewId) {
    const target = viewSections[viewId] ? viewId : 'configuracion';

    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === target);
    });

    Object.entries(viewSections).forEach(([id, section]) => {
      if (section) section.classList.toggle('active', id === target);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      window.location.hash = view;
      switchTab(view);
    });
  });

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && viewSections[initialHash]) {
    switchTab(initialHash);
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && viewSections[hash]) {
      switchTab(hash);
    }
  });
}

// --- Switches y Selectores de Color de Dark Patterns ---
function initPatronesYColores() {
  const switches = document.querySelectorAll('.switch input[type=checkbox]');
  const colorInputs = document.querySelectorAll('input[type=color]');

  browserAPI.storage.sync.get(["dpActivos", "dpColores"], (res) => {
    const activos = res?.dpActivos || {};
    const colores = { ...DEFAULT_COLORES, ...(res?.dpColores || {}) };

    switches.forEach(cb => {
      cb.checked = !!activos[cb.id];
    });

    colorInputs.forEach(ci => {
      const dpTipo = ci.id.replace("color_", "");
      if (colores[dpTipo]) {
        ci.value = colores[dpTipo];
      }
      actualizarGlowItem(dpTipo, !!activos[dpTipo], ci.value);
    });
  });

  switches.forEach(cb => {
    cb.addEventListener('change', () => {
      browserAPI.storage.sync.get(["dpActivos", "dpColores"], (res) => {
        const nuevosActivos = res?.dpActivos || {};
        const colores = { ...DEFAULT_COLORES, ...(res?.dpColores || {}) };

        switches.forEach(item => {
          nuevosActivos[item.id] = item.checked;
          const colorInput = document.getElementById(`color_${item.id}`);
          const colorVal = colorInput ? colorInput.value : colores[item.id];
          actualizarGlowItem(item.id, item.checked, colorVal);
        });

        browserAPI.storage.sync.set({ dpActivos: nuevosActivos }, () => {
          browserAPI.runtime.sendMessage({ tipo: "DARK_PATTERNS_SELECTED" }).catch(() => {});
        });
      });
    });
  });

  colorInputs.forEach(ci => {
    const dpTipo = ci.id.replace("color_", "");

    ci.addEventListener('input', () => {
      const cb = document.getElementById(dpTipo);
      actualizarGlowItem(dpTipo, cb ? cb.checked : false, ci.value);
    });

    ci.addEventListener('change', () => {
      browserAPI.storage.sync.get("dpColores", (res) => {
        const nuevosColores = res?.dpColores || {};
        colorInputs.forEach(item => {
          const tipo = item.id.replace("color_", "");
          nuevosColores[tipo] = item.value;
        });
        browserAPI.storage.sync.set({ dpColores: nuevosColores });
      });
    });
  });
}

function actualizarGlowItem(dpTipo, activo, color) {
  const item = document.getElementById(`item_${dpTipo}`);
  if (!item) return;
  if (activo && color) {
    item.style.boxShadow = `inset 0 0 20px ${color}60`;
    item.style.borderColor = `${color}99`;
  } else {
    item.style.boxShadow = "none";
    item.style.borderColor = "var(--border-card)";
  }
}

// --- Modo de Aviso ---
function initModoAviso() {
  const radios = document.querySelectorAll('input[name="modo"]');

  browserAPI.storage.sync.get("modoSeleccionado", (res) => {
    const modo = res?.modoSeleccionado || "TODO";
    const radio = document.getElementById(modo);
    if (radio) radio.checked = true;
  });

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        browserAPI.storage.sync.set({ modoSeleccionado: radio.value }, () => {
          browserAPI.runtime.sendMessage({ tipo: "MODO_AVISO" }).catch(() => {});
        });
      }
    });
  });
}

// --- Sincronización en vivo con cambios externos (Popup <-> Opciones) ---
function listenStorageChanges() {
  browserAPI.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    if (changes.dpActivos) {
      const activos = changes.dpActivos.newValue || {};
      Object.entries(activos).forEach(([tipo, valor]) => {
        const cb = document.getElementById(tipo);
        if (cb && cb.checked !== valor) cb.checked = valor;
        const ci = document.getElementById(`color_${tipo}`);
        actualizarGlowItem(tipo, valor, ci ? ci.value : null);
      });
    }

    if (changes.dpColores) {
      const colores = changes.dpColores.newValue || {};
      Object.entries(colores).forEach(([tipo, valor]) => {
        const ci = document.getElementById(`color_${tipo}`);
        if (ci && ci.value !== valor) ci.value = valor;
        const cb = document.getElementById(tipo);
        actualizarGlowItem(tipo, cb ? cb.checked : false, valor);
      });
    }

    if (changes.modoSeleccionado) {
      const nuevoModo = changes.modoSeleccionado.newValue;
      const radio = document.getElementById(nuevoModo);
      if (radio) radio.checked = true;
    }
  });
}
