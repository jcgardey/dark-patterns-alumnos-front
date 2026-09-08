/**
 * Dado un elemento obtiene su centro.
 * @param {Element} element 
 * @returns {{
 *  x: number,
 *  y: number
 * }}
 */
function getCenter(element) {
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
function getDistance(element, anotherElement) {
  const centerA = getCenter(element);
  const centerB = getCenter(anotherElement);
  return Math.sqrt(
    Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2)
  );
}

/**
 * Utilizando los precios y precios principales, se obtienen aquellos precios que se encuentran por debajo
 * de la distancia máxima pasada por parametros.
 * @param {Element[]} prices 
 * @param {Element[]} principalPrices 
 * @param {number} hiddenCostMaxDistance 
 * @returns {Element[]}
 */
function distanceCheck(prices, principalPrices, hiddenCostMaxDistance) {
  let hiddenCosts = [];

  for (let i = 0; i < prices.length; i++) {
    let j = 0;
    while (j < principalPrices.length) {
      let distance = getDistance(prices[i], principalPrices[j]);
      if (distance < hiddenCostMaxDistance) {
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
 * @param {NodeListOf<Element>} elementos 
 * @returns {{
 *  prices: Element[],
 *  principalPrices: Element[]
 * }}
 */
function sizeCheck(elementos) {
  let prices = [];
  let principalPrices = [];
  let biggestPriceSize = -1;
  const reNumber = /[$]\s*\d+/;

  for (let i = 0; i < elementos.length; i++) {
    let actualElement = elementos[i];
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
 * Utilizando los precios y precios principales, se obtienen aquellos precios que no se encuentren tachados
 * 
 * @param {NodeListOf | Element[]} elementos  - Lista de elementos HTML a comprobar.
 * @returns {Element[]} - Array de elementos cuyo estilo  "textDecorationLine" no es "line-through" 
 */
function tachadoCheck(elementos){
  return Array.from(elementos).filter(el => {
      const styles = window.getComputedStyle(el);
      const notachado = styles.textDecorationLine !== "line-through"; // || styles.textDecoration !== "line-through" es redundante?;
      return notachado && esVisible(el); //elementos que no están tachados y son visibles
    });
}
/**
 * chequea si un elemento es visible, para ignorar elementos ocultos
 * @param {Element} element
 * @returns {boolean}
 */
function esVisible(element) {
  if (element.hasAttribute('hidden')) return false;

  const styles = window.getComputedStyle(element);
  if (styles.display === "none" || styles.visibility === "hidden") return false;
  if (parseFloat(styles.opacity) === 0) return false;

  return true;
}
// Objeto a usar en extension.js
const HiddenCost = {
  hiddenCostMaxDistance: 40,
  tipo: DP_TYPES.HIDDENCOST,
  detectados: new Set(),
  check: function() {
    const elementos = document.querySelectorAll('p,span,h5'); //Esto es temporal porque podrían aparecer precios con varios tipos de tags HTML. Estamos viendo como incluir distintos tags
    const filtrados = tachadoCheck(elementos);
    const precios = sizeCheck(filtrados);
    const hiddens = distanceCheck(precios.prices, precios.principalPrices, this.hiddenCostMaxDistance);

    hiddens.forEach((hiddenCost) => {
      this.detectados.add(hiddenCost);
    });
  },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}