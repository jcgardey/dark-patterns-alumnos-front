# Documentación del Pop-up "Dark Patterns"

Pop-up page para configuracion basica de la extension Dark patterns. 

## Estructura

### HTML
- Título: `DARK PATTERNS`
- Ícono principal (Darth Vader)
- Lista de patrones (Confirm Shaming, Fake Urgency, etc.) con interruptores
- Íconos inferiores de navegación: **Configuración** y **Quiénes somos**

### CSS
- Popup de 400x400px
- Fondo gris oscuro
- Texto blanco, centrado
- Interruptores personalizados tipo "slider"
- Íconos inferiores con efecto `hover`
- Todo centrado y espaciado usando `flexbox`

### JS
Este archivo contiene la lógica JavaScript para manejar los interruptores (checkboxes) en el pop-up de la extensión Dark Patterns.

- Captura el evento change de todos los checkboxes dentro del pop-up.

- Cuando se cambia un interruptor, registra en consola el estado actualizado (encendido/apagado).


## Componentes importantes

| Clase CSS         | Descripción |
|-------------------|-------------|
| `.switch`         | Contenedor del interruptor |
| `.slider`         | Estilo visual del switch |
| `.options-container` | Agrupa todas las opciones en columna |
| `.option`         | Fila con texto a la izquierda y switch a la derecha |
| `.bottom-icons`   | Íconos inferiores alineados horizontalmente |
| `.main-icon`      | Ícono principal debajo del título |


