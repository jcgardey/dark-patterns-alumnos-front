class AnalizadorNLP extends AnalizadorBase{
    /**
     * 
     * @param {String} tipo - Usar DP_TYPES_ENUM
     * @param {String} color - Debe ser en formato hex. Ej: #f0f0f0
     * @param {String} ignoreElements - Array de strings en lowercase de los tags a ignorar
     */
    constructor(tipo, color, ignoreElements){
        super(tipo, color);
        /**
         * ```js
         * [{
         *  "text": "Texto del nodo", 
         *  "path": `${XPath}`
         * }, ...]
         * ```
         */
        this.elementos = [];
        this.ignoreElements = ignoreElements; // ['script', 'style', 'noscript', 'br', 'hr', 'input']
    }
    /**
     * @returns {HTMLElement[]}
     */
    Procesar(){
        // aca deberia de llamar al back y mandarle los datos para comunicarse con la api
        // detectados deberia ser un array de HTMLElements 
        this.detectados = this.elementos;
    }
    /**
     * 
     * @param {HTMLElement} elemento 
     * @returns {String} - Texto directamente dentro del elemento sin contar los elementos anidados
     */
    obtenerTexto(elemento){
        let texto = "";
        elemento.childNodes.forEach(
            nodo => {
                if (nodo.nodeType === Node.TEXT_NODE){
                    texto += nodo.textContent;
                }
            }
        );
        return texto;
    }
    /**
     * 
     * @param {String} str - String a comprobar si es un numero
     * @returns 
     */
    isDecimal(str) {
        return !isNaN(parseFloat(str)) && isFinite(str);
    }
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarCualquierTag(XPath, elemento){
        // aca ocurre la magia
        if (this.ignoreElements.includes(elemento.tagName.toLowerCase())) return;

        const texto = this.obtenerTexto(elemento);

        if (texto === "" || texto.trim() === "" || texto.length < 4 || this.isDecimal(texto) || texto.startsWith("$")) return;

        // formato de la api
        this.elementos.push({
            "text": this.obtenerTexto(elemento),
            "path": XPath
        });
    }
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagA(XPath, elemento){this.ProcesarCualquierTag(XPath, elemento);}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagButton(XPath, elemento){this.ProcesarCualquierTag(XPath, elemento);}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagP(XPath, elemento){this.ProcesarCualquierTag(XPath, elemento);}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagSpan(XPath, elemento){this.ProcesarCualquierTag(XPath, elemento);}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagH(XPath, elemento){this.ProcesarCualquierTag(XPath, elemento);}
}