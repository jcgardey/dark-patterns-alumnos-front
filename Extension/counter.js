const COUNTS_KEY = 'dpCounts';

// Estructura base del contador (vector) por tipo
function initCounts() {
  return {
    [DP_TYPES.SHAMING]: 0,
    [DP_TYPES.URGENCY]: 0,
    [DP_TYPES.MISDIRECTION]: 0,
    [DP_TYPES.HIDDENCOST]: 0,
    total: 0,
  };
}

function computeTotal(counts) {
  return Object.values(DP_TYPES).reduce((acc, t) => acc + (counts[t] || 0), 0);
}

// Lee el contador completo
async function getCounts() {
  const { dpCounts } = await chrome.storage.local.get({ dpCounts: initCounts() });
  return dpCounts;
}

// Setea el contador completo
async function setCounts(counts) {
  counts.total = computeTotal(counts);
  await chrome.storage.local.set({ dpCounts: counts });
  // Notifica a popup y otros contextos para refrescar UI
  chrome.runtime.sendMessage({ action: 'dpCountsUpdated', counts });
}

// Actualiza parcialmente (por ejemplo, solo HIDDENCOST)
async function setCountForType(type, value) {
  const counts = await getCounts();
  counts[type] = value;
  await setCounts(counts);
}

// Resetea todo a 0 (p. ej. al cambiar de página o al limpiar)
async function clearAllCounts() {
  await setCounts(initCounts());
}

// Utilidad: suma a un tipo (si querés modo “acumulador”)
async function addToType(type, delta) {
  const counts = await getCounts();
  counts[type] = (counts[type] || 0) + delta;
  await setCounts(counts);
}