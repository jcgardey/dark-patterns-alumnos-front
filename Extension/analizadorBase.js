class DP_TYPES_ENUM{
    static SHAMING = "SHAMING";
    static URGENCY = "URGENCY";
    static MISDIRECTION = "MISDIRECTION";
    static HIDDENCOST = "HIDDENCOST";
    constructor(){
        throw new Error("No se puede instanciar un enum!");
    }
}
Object.freeze(DP_TYPES_ENUM);

class DP_COLORS{
    static SHAMING = "FF9500";
    static URGENCY = "FF0000";
    static MISDIRECTION = "0400FF";
    static HIDDENCOST = "1AFF00";
    constructor(){
        throw new Error("No se puede instanciar un enum!");
    }
}
Object.freeze(DP_COLORS);

class AnalizadorBase{
    /**
     * 
     * @param {String} tipo - Usar DP_TYPES_ENUM
     * @param {String} color - Debe ser en formato hex. Ej: #f0f0f0
     */
    constructor(tipo, color){
        if (new.target === AnalizadorBase){
            throw new Error("'AnalizadorBase' no puede instanciarse!");
        }
        this.tipo = tipo;
        this.color = color;
        this.detectados = [];
    }
    /**
     * @returns {HTMLElement[]}
     */
    Procesar(){
        throw new Error(`Método 'Procesar' no fue implementado en la clase '${this.constructor.name}'!`);
    }
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarCualquierTag(XPath, elemento){}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagA(XPath, elemento){}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagButton(XPath, elemento){}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagP(XPath, elemento){}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagSpan(XPath, elemento){}
    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagH(XPath, elemento){}
}