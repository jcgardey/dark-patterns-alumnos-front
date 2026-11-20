# Especificación de Cumplimiento — Mozilla Add-on Policies (AMO)

Documento técnico de auditoría frente a las políticas oficiales de publicación de Mozilla:  
<https://extensionworkshop.com/documentation/publish/add-on-policies/>

---

## 1. Declaración de Transmisión de Datos a Servidor Externo (`Data Disclosure & Consent`)

### Comportamiento técnico real
* **Servidor remoto por defecto:** `https://dark-patterns-extension.lifia.info.unlp.edu.ar` (servidor institucional de LIFIA — Facultad de Informática, UNLP).
* **Endpoints utilizados:** `POST /shaming`, `POST /urgency`, `POST /scarcity` desde `Extension/serviceworker.js`.
* **Payload enviado:**
  * `/shaming`: `{ "Version": "1.0", "tokens": [{ "text": "...", "path": "..." }] }`
  * `/urgency`: `{ "version": "1.0", "texts": [{ "text": "...", "path": "..." }] }`
  * `/scarcity`: `{ "version": "1.0", "texts": [{ "text": "...", "path": "..." }] }`
* **Control del usuario (Opt-In):** Al instalarse la extensión, los 6 detectores se inicializan en `false`. No se realiza ninguna petición externa hasta que el usuario activa manualmente los interruptores de *Confirm Shaming*, *Fake Urgency* o *Fake Scarcity*.
* **Detectores puramente locales:** *Hidden Cost*, *Misdirection* y *Preselection* no transmiten datos fuera del navegador.

### Requerimientos de Mozilla para publicación en AMO
1. **Política de Privacidad (`PRIVACY_POLICY.md`):** Obligatoria al transmitir contenido de páginas web (`websiteContent`) a un servidor remoto. Debe enlazarse en la ficha del complemento en AMO.
2. **Propiedad `data_collection_permissions` en `manifest.firefox.json` y `manifest.json`:**
   Declarada dentro de `browser_specific_settings.gecko`:
   ```json
   "data_collection_permissions": {
     "required": ["websiteContent"],
     "optional": []
   }
   ```
   *Justificación:* Los fragmentos de texto extraídos de los sitios web entran en la categoría `websiteContent` de Firefox. (Nota: `manifest.chrome.json` omite `browser_specific_settings` por ser una clave exclusiva de Gecko/Firefox).
   *Telemetría futura de investigación:* Actualmente no se recopila telemetría anónima de uso. Si en una versión futura se implementa recolección anónima de métricas de uso o del DOM con fines de investigación académica, se agregará `"technicalAndInteraction"` en `"optional"` junto con su correspondiente control opt-in/opt-out.
   *Aviso en UI (`strict_min_version: "109.0"`):* Para cubrir versiones anteriores a Firefox 140 (previas al diálogo nativo de consentimiento), `Extension/options/options.html` incluye un aviso visible de privacidad junto al endpoint fijo institucional, además de mantener los interruptores NLP desactivados por defecto.

---

## 2. Permisos y Alcance (`Permissions & Minimal Scope`)

* `permissions`: `["activeTab", "storage"]`
  * `activeTab`: Comunicación con la pestaña activa al cambiar opciones desde el popup.
  * `storage`: Persistencia de preferencias del usuario en `storage.sync` (patrones activos, colores y modo de aviso).
* `host_permissions` y `content_scripts.matches` (`<all_urls>`, `http://*/*`, `https://*/*`):
  * Necesarios porque los patrones oscuros pueden aparecer en cualquier sitio web de comercio electrónico o servicio en línea que visite el usuario.
  * Incluye explícitamente `https://dark-patterns-extension.lifia.info.unlp.edu.ar/*`. La URL de la API está fija en el código (`Extension/serviceworker.js`) y no es modificable por el usuario, garantizando que nunca se redirija el tráfico a terceros arbitrarios.

---

## 3. Seguridad y Calidad de Código (`No Remote Code & Safe DOM`)

* **Sin ejecución de código remoto:** Todo el JavaScript de la extensión está empaquetado localmente. No se utiliza `eval()`, `new Function()`, ni inyección de `<script>` externos. Las fuentes tipográficas (`SpaceMono`) e íconos están incluidos en `web_accessible_resources`.
* **Manipulación segura del DOM:** Se reemplazó `innerHTML` por `textContent` en `Extension/globals.js` para evitar advertencias del validador automático (`addons-linter`).
* **Sin ofuscación:** Todo el código fuente está legible y disponible públicamente en GitHub.

---

## 4. Identificador de Extensión en Gecko (`gecko.id`)

* Configurado en `manifest.firefox.json` y `manifest.json` con el dominio institucional:
  `"id": "dark-patterns-extension@lifia.info.unlp.edu.ar"`

---

## 5. Notas Listas para Copiar en el Formulario de Revisión de Mozilla (Reviewer Notes)

```text
This extension was developed as an open-source university extension project at LIFIA (Facultad de Informática, Universidad Nacional de La Plata - UNLP).

Source code:
- Extension: https://github.com/jcgardey/dark-patterns-alumnos-front/tree/main/Extension
- Backend NLP API: https://github.com/jcgardey/dark-patterns-alumnos-back

Data transmission disclosure:
- By default, all 6 detectors are disabled on installation.
- 3 detectors (Hidden Cost, Misdirection, Preselection) run 100% locally on the DOM.
- 3 detectors (Confirm Shaming, Fake Urgency, Fake Scarcity), when explicitly enabled by the user, extract visible candidate UI text snippets and their relative XPath, and send them via HTTPS POST to our stateless academic API (https://dark-patterns-extension.lifia.info.unlp.edu.ar) for NLP classification.
- Page URLs, cookies, browsing history, and personal data are never transmitted or stored.
- Broad host permissions (<all_urls>) are required because deceptive UI patterns can appear on any website the user visits.
```
