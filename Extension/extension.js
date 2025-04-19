const DARK_PATTERNS = [
  Misdirection,
  HiddenCost,
  ConfirmShaming,
  FakeUrgency
]

// Observer solo ejecuta el callback 1 segundos después de la ultima mutación
// En páginas que cambian constantemente no sirve
let previousURL = '';
let timer;
const observer = new MutationObserver(function (mutation) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    DARK_PATTERNS.forEach((dp) => {
      try{
        dp.check();
      }catch(e){
        console.error("Error detectando el DP: " + dp.tipo, e);
      }
    });
  }, 100);
});

observer.observe(document, { childList: true, subtree: true });

chrome.runtime.sendMessage({ tipo: "CONSTANTES", DP_TYPES: DP_TYPES });