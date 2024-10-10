function hiddenCostScript(){
    const elementos = document.querySelectorAll('p,span,h5'); //Esto es temporal porque podrían aparecer precios con varios tipos de tags HTML. Estamos viendo como incluir distintos tags
    let hiddenCosts = [];
    let prices = [];
    const reNumber = /[$]\s*\d+/;
    const hiddenCostSize = 5;
    let principalPrices = [];
    let biggestPriceSize = -1;
    const hiddenCostDistance = 40; //El minimo se basa en la pagina de ejemplo pero de momento no pensamos que considerar para este valor.    

    function getCenter(element) {
        const rectangle = element.getBoundingClientRect();
        return {"x": (rectangle.left + rectangle.width) / 2, "y": (rectangle.top + rectangle.height) / 2};
    }

    function getDistance (element,anotherElement) {
        const centerA = getCenter(element);
        const centerB = getCenter(anotherElement);
        return Math.sqrt(Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2));
    }

    function distanceCheck(){
        for(let i=0;i<prices.length;i++)
            {
                let j = 0;
                while(j < principalPrices.length)
                {
                    let distance = getDistance(prices[i],principalPrices[j]);
                    if(distance < hiddenCostDistance )
                    {
                        hiddenCosts.push(prices[i]);
                        resaltarElementoConTexto(prices[i], "guarda con la billetera");
                        break;
                    }
                    j++;
                }
            }
    }

    function sizeCheck(){
        for(let i=0;i<elementos.length;i++)
            {
                let actualElement = elementos[i];
                let actualSize = parseInt(window.getComputedStyle(actualElement).fontSize);  
                if(reNumber.test(actualElement.textContent))
                {
                    if(actualSize >= biggestPriceSize)
                    {
                        if(actualSize > biggestPriceSize)
                        {
                            biggestPriceSize = actualSize;
                            prices = prices.concat(principalPrices);
                            principalPrices = [];
                            principalPrices.push(actualElement);
                        }
                        else
                        {
                            principalPrices.push(actualElement);
                        }
                    }
                    else
                    {
                        prices.push(actualElement);
                    }
                }
            }
    }

    sizeCheck();
    distanceCheck();
    return hiddenCosts;
}

