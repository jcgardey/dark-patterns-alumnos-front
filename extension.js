hiddenCostScript();
checkMisdirection();
comprobarNodos();

let previousURL = '';
const observer = new MutationObserver(function(mutation){
    if(location.href !== previousURL){
        previousURL = location.href;
        hiddenCostScript();
    }
});

observer.observe(document,{ childList: true, subtree: true });