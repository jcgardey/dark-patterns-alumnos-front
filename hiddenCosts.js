console.log("HOLA ESTO ESTA ANDANDO :)");
const spans = document.getElementsByTagName("span");
const hiddenCosts = [];
const prices = [];
const reNumber = /[$]\s*\d+/;
const defaultFontSize= 5;

for(let i=0;i<spans.length;i++)
{

    let actualSpan = spans[i];
    
    
    if(reNumber.test(actualSpan.textContent))
    {

        if(!actualSpan.checkVisibility())
        {
            hiddenCosts.push(actualSpan);
        }
        else
        { 
            if(parseInt(window.getComputedStyle(actualSpan).fontSize)<defaultFontSize)
            {
                hiddenCosts.push(actualSpan);
                actualSpan.style.backgroundColor = 'green';            }
            else
            {
                prices.push(actualSpan);
                actualSpan.style.backgroundColor = 'yellow';
            }
        }

    }
}

console.log("precios visibles:");
for(let i=0; i<prices.length;i++){
    console.log(prices[i].textContent);
}
console.log("precios ocultos:");
for(let i=0; i<hiddenCosts.length;i++){
    console.log(hiddenCosts[i].textContent);
}



