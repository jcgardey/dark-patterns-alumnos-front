function recursiveSegmentation(children){
  var result = [];

  for (var child of children) {
      result = result.concat(segments(child));
  }

  return result;
}

function wasResalted(element) {
  if (!element.hasChildNodes()) return false;
  let children = element.children;
  for (const child of children) {
    if (child.classList.contains("resaltador-dark-pattern")) return true;
  }
  return false;
}

var allIgnoreChildren = function(element) {
    if (element.children.length === 0) {
        return false;
    }
    else {
        for (var child of element.children) {
            if (ignoredElements.includes(child.tagName.toLowerCase())) {
                continue;
            }
            else {
                return false;
            }
        }
        return true;
    }
};
  
var segments = function(element) {
    if (!element) {
        return [];
    }
    var tag = element.tagName.toLowerCase();
    if (ignoredElements.includes(tag) || isPixel(element) || !isShown(element)) {
      return [];
    }

      /*
    if (wasResalted(element)) {
      for (const child of element.children) {
        if (child.classList.contains("resaltador-dark-pattern")) {
          console.log(child);
          element.removeChild(child);
        }
      }
    }
        */
  
  // Es bloque (div, section, etc)
    if (blockElements.includes(tag)) {
        if (!containsBlockElements(element)) {
            if (allIgnoreChildren(element)) {
                return [];
            }
            if (getElementArea(element) / winArea > 0.3) {
              return recursiveSegmentation(element.children);
            }
            else {
                return [element];
            }
        }
        else if (containsTextNodes(element)) {
            return [element];
        }
      // Parche para que ande con el resaltador
      /*
        else if (wasResalted(element)) {
            for (const child of element.children) {
              if (child.classList.contains("resaltador-dark-pattern")) element.removeChild(child);
            }
            return [element];
        }
        */
        else {
          return recursiveSegmentation(element.children);
        }
    }
  // No es bloque
    else {
        if (containsBlockElements(element, false)) {
          return recursiveSegmentation(element.children);
        }
        else {
            if (getElementArea(element) / winArea > 0.3) {
              return recursiveSegmentation(element.children);
            }
            else {
                return [element];
            }
        }
    }
};
