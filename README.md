# Estructura de carpetas
|Carpeta|Contenido|
|---|---|
|Extension|Contiene los archivos propios de la extensión. Esta carpeta es la que se debe importar al cargar la extensión sin empaquetar en el navegador.|
|sitios-prueba|Sitios web de prueba creados con React + Vite para testear los algoritmos de detección.|
|misdirection-test|HTML + CSS de una tarjeta para comprobar la detección del patrón Misdirection.|

## Carpeta Extension
_Archivos principales_
|Archivo|Contenido|
|---|---|
|`manifest.json`|Manifiesto base universal compatible con navegadores Chromium y Firefox moderno.|
|`manifest.chrome.json`|Manifiesto específico para Chromium (Chrome Web Store) con configuración `service_worker`.|
|`manifest.firefox.json`|Manifiesto específico para Mozilla Firefox (AMO) con `background.scripts` y `browser_specific_settings.gecko`.|
|`globals.js`|Primer script que se inyecta en la página. Define constantes (`DP_TYPES`, descripciones), utilidades de resaltado, el cartel informativo dinámico y caché reactivo en memoria para eliminar latencia en eventos de cursor.|
|`counter.js`|Manejo y persistencia de los contadores de patrones detectados en `storage.local`.|
|`XPathInterpreter.js`|Motor de generación y resolución de rutas XPath en el DOM.|
|`page_segmentation/`|Módulos de segmentación visual de la página en bloques lógicos (`block_segment.js` y `common.js`).|
|`serviceworker.js`|Script de segundo plano compatible con Chromium y Firefox. Gestiona la comunicación con la API de NLP (con timeout controlado de 8s y URL configurable desde almacenamiento) y la sincronización con el popup.|
|`confirmshaming.js`|Detector del patrón Confirm Shaming. Filtra elementos interactivos (botones/enlaces) y utiliza caché local de textos para minimizar el tráfico a la API.|
|`fakeUrgency.js`|Detector del patrón Fake Urgency. Identifica temporizadores y cuentas regresivas, agrupa bloques contenedores y evalúa el texto mediante la API con caché.|
|`scarcity.js`|Detector del patrón Fake Scarcity. Segmenta bloques de texto y evalúa escasez con la API mediante caché de textos ya analizados.|
|`hiddenCosts.js`|Detector DOM-only de precios ocultos basado en comparación de distancias y tamaños de fuentes.|
|`misdirection-script.js`|Detector DOM-only de falsa jerarquía visual y contraste de botones/enlaces clickeables.|
|`preselection.js`|Detector DOM-only de casillas y opciones marcadas por defecto o preseleccionadas dinámicamente.|
|`extension.js`|Último content-script en ejecutarse. Orquesta el ciclo de vida, gestiona el pintado según el modo y establece el `MutationObserver` optimizado con debounce.|
|`menu/`|Archivos del popup de usuario (`pop-up.html`, `pop-up.css`, `pop-up.js`) para activar/desactivar patrones, elegir el modo de visualización (**TODO**, **MARCA**, **NINGUNO**) y personalizar colores.|

---

# Objetos DarkPatterns y disparo de comprobaciones

Cada validador de patrón expone un objeto estandarizado con la siguiente estructura:
```js
const DarkPatternObject = {
  tipo: DP_TYPES.DARK_PATTERN_TYPE,
  detectados: new Set(),

  // En detectores basados en API (Shaming, Urgency, Scarcity):
  cacheTextos: new Map(),        // Caché de texto normalizado -> bool
  elementosEvaluados: new WeakSet(), // Referencias a elementos del DOM ya evaluados
  bloquesPendientes: [],
  esperandoRta: false,

  check: function() {
    /* Lógica de análisis de DOM, consulta de caché y envío de bloques nuevos */
  },
  clear: function() {
    this.detectados.clear();
    desresaltarElementoConTipo(this.tipo);
  }
};
```

`extension.js` orquesta los validadores activos configurados por el usuario y los dispara de forma controlada mediante un `MutationObserver` con filtrado de mutaciones internas y debounce:

```js
const DARK_PATTERNS = {
  MISDIRECTION: Misdirection,
  HIDDENCOST: HiddenCost,
  SHAMING: ConfirmShaming,
  URGENCY: FakeUrgency,
  SCARCITY: FakeScarcity,
  PRESELECTION: Preselection,
};

// Ejecutar solo los DP seleccionados por el usuario desde el popup
function ejecutarDPsSeleccionados() {
  browserAPIExtension.storage.sync.get("dpActivos", (result) => {
    const estadosDp = result.dpActivos || {};
    for (const [dp, activo] of Object.entries(estadosDp)) {
      if (activo && DARK_PATTERNS[dp]) {
        try {
          DARK_PATTERNS[dp].check();
        } catch (e) {
          console.warn("Extension>ejecutarDPsSeleccionados:", e);
        }
      }
    }
    PintarAnalizados();
  });
}

// Observer optimizado: ignora cambios de la propia extensión y ejecuta debounce de 800ms
const observer = new MutationObserver((mutationsList) => {
  /* Filtra mutaciones en carteles, data-dark-pattern y estilos propios */
  ...
  if (timerObserver) clearTimeout(timerObserver);
  timerObserver = setTimeout(() => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => ejecutarDPsSeleccionados(), { timeout: 1500 });
    } else {
      ejecutarDPsSeleccionados();
    }
  }, 800);
});
```

---

# Compatibilidad de Manifiestos (Chromium vs Firefox)

Para permitir publicar la extensión tanto en la **Chrome Web Store** como en **Firefox Add-ons (AMO)** sin advertencias de compatibilidad, la carpeta `Extension/` incluye:

1. **`manifest.json` (Universal)**:
   - Manifiesto por defecto listo para desarrollo. Es compatible de forma nativa con Chromium (Chrome, Edge, Brave, Opera) y con Firefox 121+.
2. **`manifest.chrome.json` (Chromium estricto)**:
   - Configurado con `"background": { "service_worker": "serviceworker.js" }`.
   - Utilizar este archivo para generar el paquete `.zip` destinado a la **Chrome Web Store**.
3. **`manifest.firefox.json` (Firefox estricto)**:
   - Configurado con `"background": { "scripts": ["serviceworker.js"] }` y la sección obligatoria:
     ```json
     "browser_specific_settings": {
       "gecko": {
         "id": "darkpatterns-detector@extension.local",
         "strict_min_version": "109.0"
       }
     }
     ```
   - Utilizar este archivo renombrado como `manifest.json` para empaquetar el `.zip` destinado a **Firefox Add-ons (AMO)**.

> [!TIP]
> **Cómo alternar de manifiesto según el destino de publicación:**
> - Si vas a subir la extensión a la **Chrome Web Store**: asegurate de que `manifest.chrome.json` sea el que esté copiado como `manifest.json` dentro de tu paquete.
> - Si vas a subir la extensión a **Firefox AMO**: reemplazá el contenido de `manifest.json` con el de `manifest.firefox.json`.

---

# Cargar la extensión en navegadores

### Navegadores basados en Chromium (Google Chrome, Edge, Brave, Opera)
1. Abrir el navegador y dirigirse a **_Administrar Extensiones_** (`chrome://extensions/`).
![image](https://github.com/user-attachments/assets/6f0b5eea-e7e2-4304-9298-ad093242f937)
2. Activar el **_Modo de desarrollador_** (esquina superior derecha).
![image](https://github.com/user-attachments/assets/0589f9a7-3cdd-40f5-bc53-e7e22c7fa367)
3. Presionar la opción de **_Cargar extensión sin empaquetar_**.
![image](https://github.com/user-attachments/assets/0ed6d812-da04-454f-b023-96357e6bbf42)
4. En el cuadro de diálogo, seleccionar la carpeta **_Extension_** del repositorio.
![image](https://github.com/user-attachments/assets/6e744ef4-62d8-4d28-9001-1e9e09083185)
5. La extensión aparecerá en el listado lista para usar.
![image](https://github.com/user-attachments/assets/aec7f8b6-c078-4745-8ec6-2fe59e6609d9)

### Mozilla Firefox
1. Abrir Firefox y escribir en la barra de direcciones: `about:debugging#/runtime/this-firefox`.
2. Presionar el botón **_Cargar complemento temporal..._** (Load Temporary Add-on).
3. Navegar hasta la carpeta **_Extension_** y seleccionar el archivo `manifest.json` (o `manifest.firefox.json`).
4. El complemento quedará activo para la sesión actual de navegación.

---

# Activar sitios de prueba
Para activar los sitios de prueba es necesario tener instalado [**Node.js**](https://nodejs.org/es) para usar **npm** y [**Vite**](https://vite.dev/).

```console
cd sitios-prueba
npm i            # Necesario la primera vez
npm run dev
```

---

# Observaciones y Buenas Prácticas

> [!CAUTION]
> **En `manifest.json`, todos los scripts deben agregarse respetando estrictamente el orden de dependencias: `globals.js` debe ser siempre el primero en ejecutarse y `extension.js` el último, ya que los content scripts se ejecutan secuencialmente según su posición en el array `"js"`.**

> [!NOTE]
> **Control desde el Popup**: La extensión incluye un menú emergente donde es posible activar o desactivar individualmente cualquiera de los 6 patrones, seleccionar el modo de aviso (**TODO** para borde y cartel informativo con flip automático, **MARCA** para solo borde, o **NINGUNO**), y personalizar el color asignado a cada patrón.

> [!TIP]
> **Depuración en Consola**: Cada vez que se detecta alguno de los 6 patrones, se imprime automáticamente un mensaje formateado y con color en la consola de herramientas de desarrollo (`F12`), indicando el elemento del DOM afectado, el texto evaluado y si la resolución provino de la caché local o de la API.
