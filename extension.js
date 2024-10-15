const DP_TEXT = {
  SHAMING: 'Posible forma de persuasión',
  URGENCY: 'Podría no ser cierto',
  MISDIRECTION: 'Posible acción oculta',
  HIDDENCOST: 'Posible precio oculto',
};

const DARK_PATTERNS = [
  { name: 'HIDDEN_COSTS', check: hiddenCostScript, url: '/roomio' },
  { name: 'MISDIRECTION', check: comprobarNodos, url: '/check_in' },
  { name: 'FAKE_URGENCY', check: fakeUrgencyScript, url: '/ebook' },
  { name: 'CONFIRMSHAMING', check: confirmShamingScript, url: '/car_rental' },
];

// Observer solo ejecuta el callback 1 segundos después de la ultima mutación
// En páginas que cambian constantemente no sirve
let previousURL = '';
let timer;
const observer = new MutationObserver(function (mutation) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    DARK_PATTERNS.forEach((dp) => {
      if (window.location.pathname.includes(dp.url ?? '')) {
        dp.check();
      }
    });
  }, 100);
});

observer.observe(document, { childList: true, subtree: true });
