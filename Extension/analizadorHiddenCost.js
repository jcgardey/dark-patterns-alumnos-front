class AnalizadorHiddenCost extends AnalizadorBase{
    /**
     * 
     * @param {String} tipo - Usar DP_TYPES_ENUM
     * @param {String} color - Debe ser en formato hex. Ej: #f0f0f0
     * @param {Number} maxDistance - Distancia maxima usada para agrupar e identificar posibles hidden cost
     */
    constructor(tipo, color, maxDistance){
        super(tipo, color);
        this.maxDistance = maxDistance;
        this.elementos = [];
    }
    /**
     * Dado un elemento obtiene su centro.
     * @param {Element} element 
     * @returns {{
    *  x: number,
    *  y: number
    * }}
    */
    getCenter(element) {
        const rectangle = element.getBoundingClientRect();
        return {
            x: (rectangle.left + rectangle.width) / 2,
            y: (rectangle.top + rectangle.height) / 2,
        };
    }

    /**
    * Dados dos elementos se obtiene la distancia entre ellos.
    * @param {Element} element 
    * @param {Element} anotherElement 
    * @returns {number}
    */
    getDistance(element, anotherElement) {
        const centerA = this.getCenter(element);
        const centerB = this.getCenter(anotherElement);
        return Math.sqrt(
            Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2)
        );
    }

    /**
    * Utilizando los precios y precios principales, se obtienen aquellos precios que se encuentran por debajo
    * de la distancia máxima pasada por parametros.
    * @param {Element[]} prices 
    * @param {Element[]} principalPrices
    * @returns {Element[]}
    */
    distanceCheck(prices, principalPrices) {
        let hiddenCosts = [];

        for (let i = 0; i < prices.length; i++) {
            let j = 0;
            while (j < principalPrices.length) {
                let distance = this.getDistance(prices[i], principalPrices[j]);
                if (distance < this.maxDistance) {
                    hiddenCosts.push(prices[i]);
                    break;
                }
                j++;
            }
        }

        return hiddenCosts;
    }

    /**
    * Dada una lista de elementos, se distinguen entre sus tamaños como precios
    * principales y normales.
    * @returns {{
    *  prices: Element[],
    *  principalPrices: Element[]
    * }}
    */
    sizeCheck() {
        let prices = [];
        let principalPrices = [];
        let biggestPriceSize = -1;
        const reNumber = /[$]\s*\d+/;

        for (let i = 0; i < this.elementos.length; i++) {
            let actualElement = this.elementos[i];
            let actualSize = parseInt(
                window.getComputedStyle(actualElement).fontSize
            );
            if (reNumber.test(actualElement.textContent)) {
                if (actualSize >= biggestPriceSize) {
                    if (actualSize > biggestPriceSize) {
                        biggestPriceSize = actualSize;
                        prices = prices.concat(principalPrices);
                        principalPrices = [];
                        principalPrices.push(actualElement);
                    } else {
                        principalPrices.push(actualElement);
                    }
                } else {
                    prices.push(actualElement);
                }
            }
        }
        return {
            prices: prices,
            principalPrices: principalPrices
        }
    }
    /**
     * @returns {Element[]}
     */
    Procesar(){
        const precios = this.sizeCheck();
        this.detectados = this.distanceCheck(precios.prices, precios.principalPrices);
        return this.detectados;
    }
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagP(XPath, elemento){
        this.elementos.push(elemento);
    }
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagSpan(XPath, elemento){
        this.elementos.push(elemento);
    }
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagH(XPath, elemento){
        if (elemento.tagName.toLowerCase() == "h5"){
            this.elementos.push(elemento);
        }
    }
}
