class Recorredor{
    /**
     * 
     * @param {AnalizadorBase[]} analizadores 
     */
    constructor(analizadores){
        this.analizadores = analizadores;
        /**
         * ```js
         * {
         *  "SHAMING": [...],
         *  "HIDDENCOST": [...],
         *  ...
         * }
         * ```
         */
        this.elementosAPintar = {};
        for(let i = 0; i < this.analizadores.length; i++){
            this.elementosAPintar[this.analizadores[i].tipo] = [];
        }
    }
    /**
     * Recorre y almacena todos los elementos identificados separados por tipo
     * @param {String[]} excepto - DPs a ignorar
     */
    ProcesarDOM(excepto){
        this.recorrerDOM(excepto);
        for (let i = 0; i < this.analizadores.length; i++){
            if (excepto.includes(this.analizadores[i].tipo)) continue;
            const elems = this.analizadores[i].Procesar();
            // console.log(`===== ${this.analizadores[i].tipo} =====`);
            // console.log(this.analizadores[i]);
            if (elems === undefined) continue;
            for (let j = 0; j < elems.length; j++){
                this.elementosAPintar[this.analizadores[i].tipo].push(elems[j]);
            }
        }
    }
    /**
     * Recorre el DOM disparando los analizadores donde corresponda
     * 
     * @param {String[]} excepto - DPs a ignorar
     * @param {Element} nodo - Elemento desde el que inicia el recorrido, por defecto es el body
     * @param {String} xPathActual - XPath del elemento pasado como 'nodo', por defecto es /html/body 
     */
    recorrerDOM(excepto = [], nodo = document.body, xPathActual = "/html/body"){
        // Dispara analizador
        switch(nodo.tagName.toLowerCase()){
            case "a":
                this.analizadores.forEach(analizador => {
                    if(!excepto.includes(analizador.tipo)) analizador.ProcesarTagA(xPathActual, nodo);
                });
                break;
            case "button":
                this.analizadores.forEach(analizador => {
                    if(!excepto.includes(analizador.tipo)) analizador.ProcesarTagButton(xPathActual, nodo);
                });
                break;
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
                this.analizadores.forEach(analizador => {
                    if(!excepto.includes(analizador.tipo)) analizador.ProcesarTagH(xPathActual, nodo);
                });
                break;
            case "span":
                this.analizadores.forEach(analizador => {
                    if(!excepto.includes(analizador.tipo)) analizador.ProcesarTagSpan(xPathActual, nodo);
                });
                break;
            case "p":
                this.analizadores.forEach(analizador => {
                    if(!excepto.includes(analizador.tipo)) analizador.ProcesarTagP(xPathActual, nodo);
                });
                break;
            default:
                this.analizadores.forEach(analizador => {
                    if(!excepto.includes(analizador.tipo)) analizador.ProcesarCualquierTag(xPathActual, nodo);
                });
                break;
        } 
        // Continua el recorrido
        Array.from(nodo.children).forEach(element => {
            this.recorrerDOM(excepto, element, this.appendXPath(element, xPathActual));
        });
    }
    /**
     * Devuelve el XPath absoluto del elemento actual,
     * concatenando el XPath del padre ya calculado.
     *
     * @param {Element} element - El elemento actual.
     * @param {string} parentXPath - El XPath absoluto del padre.
     * @returns {string} - El XPath completo hasta element.
     */
    appendXPath(element, parentXPath) {
        const tag = element.tagName.toLowerCase();

        // calcula el índice de este elemento entre los hermanos con el mismo tag
        let index = 1;
        const siblings = element.parentNode ? element.parentNode.children : [];
        for (const sib of siblings) {
            if (sib.tagName === element.tagName) {
                if (sib === element) break;
                index++;
            }
        }

        // concatena al XPath del padre
        return `${parentXPath}/${tag}[${index}]`;
    }
}