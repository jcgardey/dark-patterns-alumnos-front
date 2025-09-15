class AnalizadorMisdirection extends AnalizadorBase {
    /**
     * 
     * @param {String} tipo - Usar DP_TYPES_ENUM
     * @param {String} color - Debe ser en formato hex. Ej: #f0f0f0
     * @param {Number} destacadosEncimaPromedio - Valor entre 0 y 1
     * @param {Number} umbralCantDestacados - Valor entre 0 y 1
     */
    constructor(tipo, color, destacadosEncimaPromedio, umbralCantDestacados) {
        super(tipo, color);
        this.elementos = {};
        this.hijos = {};
        if (destacadosEncimaPromedio > 1 || destacadosEncimaPromedio < 0) 
            throw new Error(`El % de destacados encima del promedio en '${this.constructor.name}' debe estar entre 0 y 1`);
        if (umbralCantDestacados > 1 || umbralCantDestacados < 0) 
            throw new Error(`El % del umbral para la cantidad de destacados en '${this.constructor.name}' debe estar entre 0 y 1`);
        this.destacadosEncimaPromedio = destacadosEncimaPromedio;
        this.umbralCantDestacados = umbralCantDestacados;
    }

    /**
     * Dado un arreglo numérico y un porcentaje entre 1.0 y 0.0,
     * se comprueba cuantos números del arreglo están por encima del
     * promedio + promedio * porcentaje
     * @param {number[]} contrastes
     * @param {number} porcentaje 
     * @returns {number}
     */
    cantidadDestacados(contrastes, porcentaje) {
        let promedio = contrastes.reduce((acc, cont) => acc + cont) / contrastes.length;
        return contrastes.reduce((acc, actual) => {
            if (actual > promedio + promedio * porcentaje) return acc + 1;
            else return acc;
        }, 0);
    }

    /**
     * @returns {HTMLElement[]}
     */
    Procesar() {
        // console.log("Procesando Misdirection...");
        // console.log("Elementos encontrados:", Object.keys(this.elementos).length);
        // console.log("Hijos por padre:", this.hijos);

        // Obtención de padres especiales (que tienen 2 o más hijos)
        const padresEspeciales = Object.fromEntries(
            Object.entries(this.hijos).filter(([k, v]) => v.length >= 2)
        );

        // console.log("Padres especiales:", padresEspeciales);

        let contrastesXRama = [];
        let padresEspecialesArray = [];

        for (const [xPathPadre, hijosArray] of Object.entries(padresEspeciales)) {
            let contraste_hijos = [];
            const elementoPadre = this.elementos[xPathPadre];
            
            if (!elementoPadre) {
                // console.warn(`No se encontró elemento padre para XPath: ${xPathPadre}`);
                continue;
            }

            hijosArray.forEach(elem => {
                try {
                    const contraste = this.contrastarNiveles(elementoPadre, elem);
                    contraste_hijos.push(contraste);
                } catch (error) {
                    // console.warn("Error al contrastar niveles:", error);
                }
            });

            if (contraste_hijos.length > 0) {
                contrastesXRama.push(contraste_hijos);
                padresEspecialesArray.push(elementoPadre);
            }
        }

        // console.log("Contrastes por rama:", contrastesXRama);

        // Filtrado de elementos según si la cantidad de elementos destacados encima de cierto umbral
        let contrastesFiltrados = [];
        contrastesXRama.forEach((contrastes, idx) => {
            const cantDestacados = this.cantidadDestacados(contrastes, this.destacadosEncimaPromedio);
            const umbralMinimo = contrastes.length * this.umbralCantDestacados;
            
            // console.log(`Rama ${idx}: ${cantDestacados} destacados de ${contrastes.length} (umbral: ${umbralMinimo})`);
            
            if (cantDestacados >= umbralMinimo) {
                contrastesFiltrados.push(idx);
            }
        });

        // console.log("Contrastes filtrados (índices):", contrastesFiltrados);

        // Marcando las coincidencias / retornando los elementos a pintar
        this.detectados = [];
        contrastesFiltrados.forEach((idx) => {
            const elemento = padresEspecialesArray[idx];
            if (elemento && elemento.id !== 'root') {
                this.detectados.push(elemento);
            }
        });

        // console.log("Elementos detectados como Misdirection:", this.detectados);
        return this.detectados;
    }

    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarCualquierTag(XPath, elemento) {
        if (this.esClickeable(elemento)) {
            this.agregarElemento(XPath, elemento);
        }
    }

    /**
     * Agrega el elemento a un listado y a un contador de "especialidad"
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    agregarElemento(XPath, elemento) {
        this.elementos[XPath] = elemento;
        
        let XPathAux = XPath;
        while (XPathAux.includes("/") && this.recortarUltimo(XPathAux) !== "") {
            XPathAux = this.recortarUltimo(XPathAux);

            if (this.hijos[XPathAux] === undefined) {
                this.hijos[XPathAux] = [elemento];
            } else {
                this.hijos[XPathAux].push(elemento);
            }
        }
    }

    /**
     * 
     * @param {String} xpath 
     */
    recortarUltimo(xpath) {
        const idx = xpath.lastIndexOf("/");
        return (idx != -1) ? xpath.slice(0, idx) : ""; 
    }

    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagA(XPath, elemento) {
        this.agregarElemento(XPath, elemento);
    }

    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagButton(XPath, elemento) {
        this.agregarElemento(XPath, elemento);
    }

    /**
     * Determina si un elemento tiene una propiedad onClick no nula o atributos clickeables
     * 
     * @param {HTMLElement} elemento 
     * @returns {Boolean}
     */
    esClickeable(elemento) {
        // Verificar onclick
        if (elemento.onclick !== null) return true;
        
        // Verificar atributos comunes de elementos clickeables
        if (elemento.hasAttribute('onclick')) return true;
        if (elemento.hasAttribute('href')) return true;
        
        // Verificar si tiene cursor pointer
        const computedStyle = window.getComputedStyle(elemento);
        if (computedStyle.cursor === 'pointer') return true;
        
        return false;
    }

    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagP(XPath, elemento) {
        this.ProcesarCualquierTag(XPath, elemento);
    }

    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagSpan(XPath, elemento) {
        this.ProcesarCualquierTag(XPath, elemento);
    }

    /**
     * 
     * @param {String} XPath 
     * @param {HTMLElement} elemento 
     */
    ProcesarTagH(XPath, elemento) {
        this.ProcesarCualquierTag(XPath, elemento);
    }

    /**
     * Luminancia según el estándar de contraste de luminancia basado en la fórmula de luminosidad relativa del W3C.
     * LINK: https://www.w3.org/WAI/GL/wiki/Relative_luminance
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     * @returns {number}
     */
    getLuminance(r, g, b) {
        const a = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
  
    /**
     * Cálculo del contraste entre dos colores.
     * @param {number[]} color1 
     * @param {number[]} color2 
     * @returns {number}
     */
    getContrast(color1, color2) {
        const luminance1 = this.getLuminance(color1[0], color1[1], color1[2]);
        const luminance2 = this.getLuminance(color2[0], color2[1], color2[2]);

        return (
            (Math.max(luminance1, luminance2) + 0.05) /
            (Math.min(luminance1, luminance2) + 0.05)
        );
    }
  
    /**
     * Convierte un string del tipo **"rgb(r,g,b)"** a un arreglo numérico **[r, g, b]**.
     * @param {string} rgbString 
     * @returns {number[] | null}
     */
    rgbToArray(rgbString) {
        const result = rgbString.match(/\d+/g);
        return result ? result.map(Number) : null;
    }
   
    /**
     * Dada la raiz de un árbol o subarbol y una hoja, se recorre la rama desde abajo hacia arriba
     * obteniendo los contrastes en cada nodo para luego obtener un acumulado de la totalidad de
     * contrastes de la rama.
     * @param {ChildNode} raiz
     * @param {ChildNode} hoja
     * @returns {number}
     */
    contrastarNiveles(raiz, hoja) {
        let actual = hoja;
        let contrastes = [];
        
        while (actual && actual !== raiz && actual.parentNode) {
            try {
                const computedStyles = window.getComputedStyle(actual);
                const colorArray = this.rgbToArray(computedStyles.color || 'rgb(0,0,0)');
                const bgColorArray = this.rgbToArray(computedStyles.backgroundColor || 'rgb(255,255,255)');
                
                if (colorArray && bgColorArray) {
                    const contraste = this.getContrast(colorArray, bgColorArray);
                    contrastes.push(contraste);
                }
            } catch (error) {
                // console.warn("Error al obtener estilos computados:", error);
            }
            actual = actual.parentNode;
        }
        
        return contrastes.length > 0 ? contrastes.reduce((acumulador, num) => acumulador + num, 0) : 0;
    }
}