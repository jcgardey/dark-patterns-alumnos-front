# Estructura de carpetas
|Carpeta|Contenido|
|-|-|
|Extension|Contiene los archivos propios de la extensión, esta carpeta es la que se debe importar a la hora de cargar la extensión sin empaquetar.|
|sitios-prueba|Sitios con los que se probaron los DP en la expo y en los test de algunos algoritmos|
|misdirection-test|HTML + CSS de una sencilla tarjeta para comprobar misdirection (revisar)|

## Carpeta Extension
_Archivos principales_
|Archivo|Contenido|
|-|-|
|globals.js|Primer archivo que se carga de los content-scripts y tiene constantes y funciones que se utilizan en el resto de content-scripts|
|background.js|Script que se ejecuta de fondo en el navegador para toda la extensión, se encarga de comunicarse con la api que detecta los DP basados en texto|
|confirmshaming.js|Lógica de segmentación y comunicación con el background script para el DP de Confirm Shaming|
|urgency.js|Lógica de segmentación y comunicación con el background script para el DP de Fake Urgency|
|hiddenCosts.js|Lógica encargada de detectar los precios ocultos propios del DP de mismo nombre|
|misdirection-script.js|Lógica encargada del analisis del DOM y comprobaciones de colores y contrastes para detectar misdirection|
|extension.js|Ultimo content-script que se ejecuta, establece el mutation observer que dispara todos los DP|

# Objetos DarkPatterns y disparo de comprobaciónes
Al final de cada script de lógica hay un objeto del estilo:
```js
const DarkPatternObject = {
  /* Atributos */,
  tipo: DP_TYPES.DARK_PATTERN_TYPE,
  check: function(){
    /* lógica de detección del DP */
    ...
  }
}
```
El tipo y el método check son indispensables para que extension.js pueda disparar la comprobación en el mutation observer:
```js
/* variables y cosas necesarias */
...
const DARK_PATTERNS = [
  DarkPatternsObject,
  ...
]

const observer = new MutationObserver(function (mutation) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    DARK_PATTERNS.forEach((dp) => {
      try{
        dp.check(); 
      }catch(e){
        console.error("Error detectando el DP: " + dp.tipo, e);
      }
    });
  }, 100);
});
...
/* configuraciones generales y activación del observer */
```

# Cargar extensión en navegadores basados en chromium
Una vez descargado y extraido el repositorio:
- Abrir el navegador y dirigirse a **_Administrar Extensiones_**
![image](https://github.com/user-attachments/assets/6f0b5eea-e7e2-4304-9298-ad093242f937)
- Activar el **_Modo de desarrollador_** en caso de que no lo este
![image](https://github.com/user-attachments/assets/0589f9a7-3cdd-40f5-bc53-e7e22c7fa367)
- Presionar la opción de **_Cargar extensión sin empaquetar_**
![image](https://github.com/user-attachments/assets/0ed6d812-da04-454f-b023-96357e6bbf42)
- Al presionar el boton se abrira el cuadro de dialogo de selección de archivos del sistema. Deben dirigirse a la carpeta del repositorio y dentro de la carpeta **_Extension_** poner **_Seleccionar carpeta_**
![image](https://github.com/user-attachments/assets/6e744ef4-62d8-4d28-9001-1e9e09083185)
- Al hacer esto la extensión aparecera cargada en el listado de extensiones y quedará lista para usar
![image](https://github.com/user-attachments/assets/aec7f8b6-c078-4745-8ec6-2fe59e6609d9)

> [!WARNING]
> Todavia no tiene botón de apagado asi que dispara los comprobadores en todos lados.

# Observaciones
> [!CAUTION]
> **En manifest.json, todos los scripts deben agregarse de modo que globals.js sea el primero en ejecutarse y extension.js el último, teniendo en cuenta que los scripts se activan en el orden en el que aparecen en el manifest.**

> [!WARNING]
> - **Algunas funciones no fueron comprobadas y los parámetros existentes aun deben ajustarse más.**
> - **La extensión es _por ahora_ solo compatible con navegadores basados en chromium.**
