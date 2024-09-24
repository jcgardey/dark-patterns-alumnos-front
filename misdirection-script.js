// Obtengo la luminancia según el estándar de 
//contraste de luminancia basado en la fórmula de luminosidad relativa del W3C (fue un dolor de cabeza :c)
// LINK: https://www.w3.org/WAI/GL/wiki/Relative_luminance

//TODO: SELECCIONAR BUTTONS Y PROBAR MISSDIRECTION

function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v /= 255 // v = v / 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// calculo el contraste entre dos colores
function getContrast(color1, color2) {
    const luminance1 = getLuminance(color1[0], color1[1], color1[2]);
    const luminance2 = getLuminance(color2[0], color2[1], color2[2]);

    return (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);
}

// obtengo el color de fondo y el color de texto
// fuente: https://www.w3schools.com/jsref/jsref_getcomputedstyle.asp
function getColor(element) {

    // getComputedStyle es un estilo computado, osea es una propiedad del obj. window que te devuelve todos
    // los estilos que tiene un elemento html
    const style = window.getComputedStyle(element);
    // extraigo con la exp regular todos los nums del string del color de fondo
    // haria algo como esto, si es (255, 255, 255) devuelve [255, 255]
    const backgroundColor = style.backgroundColor.match(/\d+/g).map(Number); // fondo
    const color = style.color.match(/\d+/g).map(Number); // texto
   
   
    return { backgroundColor, color };
}

const checkMisdirection = () => {
    const elements = document.querySelectorAll('.plan-card, button'); // Selecciona las plan-card como los botones

    const contrasts = []; // almacena constrastes y buttons

    elements.forEach(element => {
        if (element instanceof HTMLElement && element.innerText !== 'Siguiente') { // chequea que sea un elemento HTML
            const { backgroundColor, color } = getColor(element);
            const contrast = getContrast(backgroundColor, color);
            contrasts.push({ element, contrast }); // guarda el elemento y su contraste
            
            console.log(`${element.tagName}:`, {
                'Color de Fondo': backgroundColor,
                'Color de Texto': color,
                'Contraste': contrast.toFixed(2),
            });
        }
    });

    // Comparar contrastes de planes
    const freeElement = document.querySelector('.free');
    const proElement = document.querySelector('.pro');
    const premiumElement = document.querySelector('.premium');

    if (freeElement && proElement && premiumElement) {
        const freeContrast = getContrast(getColor(freeElement).backgroundColor, getColor(freeElement).color);
        const proContrast = getContrast(getColor(proElement).backgroundColor, getColor(proElement).color);
        const premiumContrast = getContrast(getColor(premiumElement).backgroundColor, getColor(premiumElement).color);

        if (proContrast > freeContrast || premiumContrast > freeContrast)
            console.log("El plan Pro o el plan Premium son más llamativos que el plan Free.");
        else 
            console.log("El plan Free es más llamativo que Pro y Premium.");
    } 

    // compara contrastes de botones
    const buttonContrasts = contrasts.filter(item => item.element.tagName === 'BUTTON'); // filtro porque solo me interesan los botones
    
    if (buttonContrasts.length > 0) {
        // calculo el contraste maximo
        const mostAttractiveButton = buttonContrasts.reduce((max, current) => (current.contrast > max.contrast ? current : max));
        console.log(`El botón más llamativo es:`, {
            'Elemento': mostAttractiveButton.element,
            'Contraste': mostAttractiveButton.contrast.toFixed(2),
        });
    } else {
        console.warn("No se encontraron botones para evaluar el contraste.");
    }
}

const clickeables = ['a', 'button'];
/**
 * @param {ChildNode} element
 * @returns {boolean}
 */
function isSpecial(element){
    try{
        if (element.nodeName !== 'BODY' && element.nodeName !== '#text' && ((element.getAttribute('onclick') != null) || (element.getAttribute('href') != null) || (clickeables.includes(element.nodeName.toLowerCase())))) {
            //console.log(element.nodeName + ' es especial');
            return true;
        }
    }catch (e){
        //console.log(element + ' dio error: ' + e);
    }
    return false;
}

/**
 * 
 * @param {ChildNode} element 
 * @returns {{arr:ChildNode[],isSpecial:boolean}}
 */
function getParentsOfSpecialNodes(element){
    //console.log('Entró ', element.nodeName);
    //console.log(element.nodeName + ' es un ' + typeof (element));

    let arrReturn = []; // nodos con hijos especiales
    let special = false; // flag de especialidad del nodo actual

    let specialChildCounter = 0; // contador de hijos especiales

    if (element.hasChildNodes()){ // si mi nodo tiene hijos los analizo
        //console.log('Tiene hijos', element.nodeName);
        //console.log(element.childNodes);
        element.childNodes.forEach(
            (hijo)=>{
                let rta = getParentsOfSpecialNodes(hijo); // obtengo la rta de mis hijos

                //console.log('Hijo: ' + hijo.nodeName + ' - RTA: ' + JSON.stringify(rta));

                if (rta.isSpecial){
                    specialChildCounter++; // si es especial lo cuento
                    //console.log(element + ' tiene ' + specialChildCounter + ' hijos especiales');
                }
                arrReturn = arrReturn.concat(rta.arr); // concateno las rtas
            }
        )
        if (specialChildCounter>=2) arrReturn.push(element); // si tengo 2 o más hijos especiales, soy un nodo padre de especiales
    }

    // si soy especial o tengo un hijo especial, "soy especial"
    if (isSpecial(element) || specialChildCounter == 1) special = true;
    
    return {arr:arrReturn,isSpecial:special}; // retorno padres especiales y mi flag de especialidad
}

/**
 * 
 * @param {ChildNode} element 
 * @param {ChildNode[]} ignore
 * @returns {ChildNode[]}
 */
function getSpecialNodes(element,ignore){

    let arrReturn = []; // arreglo acumulador de especiales por debajo element
     
    if (element.hasChildNodes()) { // si tengo hijos los analizo
        element.childNodes.forEach(
            (hijo) => {
                if (!ignore.includes(hijo)){ // si mi hijo es parte de los nodos a ignorar, no se analiza
                    if (isSpecial(hijo)) { // si es especial lo guardo y no sigo, solo quiero los primeros hijos especiales
                        arrReturn.push(hijo);
                        //console.log('tengo especial');
                    }else{ // si no es especial arrastro el arreglo de especiales
                        arrReturn = getSpecialNodes(hijo,ignore).concat(arrReturn);
                    }
                }
            }
        )
    }
    return arrReturn; // retorno especiales acumulados
}

/**
 * 
 * @param {ChildNode[]} nodes
 * @param {string} color 
 */
function pintar(nodes, color){
    if (nodes.length > 0){
        nodes.forEach((node) => {
            try {
                let srt = color; //
                Object.assign(node.style, { background: `${color}` });
                pintar(node.childNodes); //
            } catch (e) {
                //console.log(node + ' falla: ' + e);
            }
        })
    }
}

function rgbToArray(rgbString) {
    // Usa una expresión regular para capturar los números dentro de "rgb(r, g, b)"
    const result = rgbString.match(/\d+/g);
    // Convierte los valores capturados de string a números enteros y retorna como array
    return result ? result.map(Number) : null;
}

/**
 * 
 * @param {ChildNode} raiz
 * @param {ChildNode} hoja
 */
function contrastarNiveles(raiz, hoja){
    let actual = hoja;
    let contrastes = [];
    while (actual !== raiz){
        const computedStyles = window.getComputedStyle(actual);
        //console.log(computedStyles.color);
        contrastes.push(getContrast(rgbToArray(computedStyles.color), rgbToArray(computedStyles.backgroundColor)));
        actual = actual.parentNode;
    }
    return contrastes.reduce((acumulador,num)=>acumulador+num,0);
}

/**
 * @param {ChildNode} parent
 * @param {ChildNode[]} camino
 * @param {ChildNode[][]} caminos
 * @param {ChildNode[]} ignore
 */
function getChildBranches(parent,camino,caminos,ignore){
    camino.push(parent); // me agrego al camino
    if (parent.hasChildNodes()){ // si tengo hijos
        parent.childNodes.forEach(
            (child)=>{
                if (!ignore.includes(child)){
                    if (isSpecial(child)){ // si hijo es especial se lo agrega al array y se guarda el camino
                        camino.push(child);
                        caminos.push(Array.from(camino));
                        camino.pop();
                    }else{
                        getChildBranches(child,camino,caminos,ignore); // si no es especial se intenta seguir iterando
                    }
                }
            }
        );
    }

    camino.pop(); // me quito del camino
}

/**
 * 
 * @param {[]} contrastes 
 * @return {number[]}
 */
function calcularLlamativos(contrastes) {
    // 1. Calcular la media
    let suma = contrastes.reduce((acc, val) => acc + val, 0);
    let media = suma / contrastes.length;

    // 2. Calcular la desviación estándar
    let sumaCuadrados = contrastes.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);
    let desviacionEstandar = Math.sqrt(sumaCuadrados / contrastes.length);

    // 3. Definir el umbral
    let umbral = media + (desviacionEstandar * 0); // revisar si sirve desviacion

    // 4. Identificar los elementos llamativos
    let elementosLlamativos = contrastes.filter(val => val > umbral);

    return elementosLlamativos;
}

const comprobarNodos = () =>{
    //console.log(document.lastChild);
    let sp = getParentsOfSpecialNodes(document/* .lastChild */).arr;

    console.log(sp);

    let spChilds = [];
    let coleccion = [];
    
    sp.forEach((parent)=>{
        let myChilds = getSpecialNodes(parent,sp);
        if (myChilds.length >= 2) spChilds = spChilds.concat(myChilds);
    })
    
    console.log('TODOS LOS HIJOS',spChilds);

    sp.forEach(
        (padre)=>{ // por padre
            let caminos = [];

            getChildBranches(padre,[],caminos,sp); // obtengo caminos de padre a hijo especial

            if (caminos.length > 1){
                //console.log(padre,' -> ',caminos);

                let caminos_contrastes = caminos.map( // mapeo caminos a la suma de contrastes
                    (camino)=>{
                        return contrastarNiveles(camino[0],camino[camino.length-1]);
                    }
                )

                //console.log(padre,' -> ',caminos_contrastes);

                let llamativos = calcularLlamativos(caminos_contrastes);

                console.log(padre,' llamativo -> ',llamativos);

                if (llamativos.length >= 1){
                    pintar([padre],'#FF0000');
                }

            } 
        }
    );
}

document.addEventListener("DOMContentLoaded",comprobarNodos);

document.addEventListener("DOMContentLoaded", checkMisdirection);
