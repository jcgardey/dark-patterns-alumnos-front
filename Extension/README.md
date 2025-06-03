# Funcionalidad: Conectar los switches de la pop up page a extension.js, para indicarle que dark deben ser detectados.

Permitir que el usuario seleccione qué dark patterns quiere detectar desde el popup.html, y que esos valores sean enviados y utilizados en extension.js para aplicar el dp indicado por el usuario.

# Flujo

1. El usuario interactúa con un switch en el popup, popup.js actualiza el chome.storage con los valores nuevos de los dps.

2. El popup.js envía un mensaje avisando al service_worker.js mediante chrome.runtime.sendMessage que hubo cambios en los valores de los switches

3. El service_worker.js reenvía ese mensaje a la pestaña activa con chrome.tabs.sendMessage.

4. El content script (extension.js) escucha el mensaje y ejecuta los dps que esten en el storage.
