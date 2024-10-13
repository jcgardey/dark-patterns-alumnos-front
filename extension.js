const DP_TEXT = {
  SHAMING: "Mensaje generico de confirm shaming",
  URGENCY: "Mensaje generico de fake urgency",
  MISDIRECTION: "Mensaje generico de misdirection",
  HIDDENCOST: "Mensaje generico de hidden cost"
};
// Observer solo ejecuta el callback 1 segundos después de la ultima mutación
// En páginas que cambian constantemente no sirve
let previousURL = '';
let timer;
const observer = new MutationObserver(function(mutation){
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
      hiddenCostScript();
      //checkMisdirection();
      comprobarNodos();
      confirmShamingScript();
      fakeUrgencyScript();
  }, 100);
});

observer.observe(document,{ childList: true, subtree: true });
