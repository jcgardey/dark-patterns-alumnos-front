/*
window.onload = function(){
hiddenCostScript();
checkMisdirection();
comprobarNodos();
confirmShamingScript();
fakeUrgencyScript();
}
*/

// Observer solo ejecuta el callback 5 segundos después de la ultima mutación
// En páginas que cambian constantemente no sirve
let previousURL = '';
let timer;
const observer = new MutationObserver(function(mutation){
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
      hiddenCostScript();
      checkMisdirection();
      comprobarNodos();
      confirmShamingScript();
      fakeUrgencyScript();
  }, 5000);
/*
    if(location.href !== previousURL){
        previousURL = location.href;
        hiddenCostScript();
        confirmShamingScript();
        fakeUrgencyScript();
    }
*/
});

observer.observe(document,{ childList: true, subtree: true });
