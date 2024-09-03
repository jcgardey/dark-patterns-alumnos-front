// Obtengo la luminancia según el estándar de 
//contraste de luminancia basado en la fórmula de luminosidad relativa del W3C (fue un dolor de cabeza :c)
// LINK: https://www.w3.org/WAI/GL/wiki/Relative_luminance


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

    const plans = document.querySelectorAll('.plan-card');

    plans.forEach(plan => {
        const { backgroundColor, color } = getColor(plan);
        const contrast = getContrast(backgroundColor, color);


        // checking para controlar por la consola del navegador lo que se obtuvo de getContrast y getColor
        console.log(`${plan.querySelector('h3').innerText}:`, {
            'Color de Fondo': backgroundColor,
            'Color de Texto': color,
            'Contraste': contrast.toFixed(2),

        });
    
    
    });


    /* Si los contrastes de "Pro" 
        y "Premium" son más altos, entonces son más LLAMATIVOS, sino, el plan "Free" es más llamativo
        Osea si el contraste es alto, el contendor será más fácil de leer, entonces tiene mas predominancia
    */


    const freeContrast = getContrast(getColor(document.querySelector('.free'))
                        .backgroundColor, getColor(document.querySelector('.free')).color);

    const proContrast = getContrast(getColor(document.querySelector('.pro'))
                        .backgroundColor, getColor(document.querySelector('.pro')).color);
    const premiumContrast = getContrast(getColor(document.querySelector('.premium'))
                        .backgroundColor, getColor(document.querySelector('.premium')).color);

    // comparo los contrastes

    // TODO: queda revisar bien esto, está medio a mano, pero funciona :)
    if (proContrast > freeContrast || premiumContrast > freeContrast)
        console.log("El plan Pro o el plan Premium son más llamativos que el plan Free.");
    else 
        console.log("El plan Free es más llamativo que Pro y Premium.");

}



document.addEventListener("DOMContentLoaded", checkMisdirection);