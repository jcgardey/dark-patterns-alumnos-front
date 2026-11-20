# Política de Privacidad — Dark Patterns Detector (UNLP / LIFIA)

**Última actualización:** 20 de noviembre de 2026

Esta extensión de navegador es desarrollada en el marco de un proyecto de extensión universitaria de la **Facultad de Informática de la Universidad Nacional de La Plata (UNLP)**, coordinado por el laboratorio de investigación **LIFIA**.

---

## 1. Principio de Privacidad y Minimización de Datos

La extensión está diseñada para proteger la autonomía y privacidad de la persona usuaria. **No recopilamos, vendemos ni compartimos información personal identificable (PII)**, historial de navegación, credenciales, cookies ni métricas de telemetría o analítica.

---

## 2. Qué datos se transmiten y cuándo

La extensión cuenta con 6 detectores de patrones oscuros, divididos en dos modalidades:

1. **Detección 100 % local (sin transmisión de datos):**
   * *Hidden Cost* (Costos ocultos)
   * *Misdirection* (Desvío de atención)
   * *Preselection* (Preselección involuntaria)
   Estos detectores analizan la estructura visual (DOM) íntegramente dentro del navegador del usuario. No envían ninguna información a servidores externos.

2. **Detección asistida por API de Procesamiento de Lenguaje Natural (NLP):**
   * *Confirm Shaming* (Avergonzar para confirmar)
   * *Fake Urgency* (Falsa urgencia)
   * *Fake Scarcity* (Falsa escasez)
   
   **Estado por defecto (Opt-In):** Todos los detectores inician **desactivados (`false`)** al instalar la extensión. Solo cuando el usuario activa explícitamente alguno de estos tres detectores, la extensión extrae fragmentos puntuales de texto visible de la página (por ejemplo, el texto de un botón, enlace o temporizador) junto con su ruta estructural relativa en el DOM (`XPath`), y los envía mediante **HTTPS** a la API académica alojada en:
   `https://dark-patterns-extension.lifia.info.unlp.edu.ar`

   * **Qué se envía:** Únicamente el texto candidato a analizar (`text`) y su selector estructural (`path`).
   * **Qué NO se envía:** No se envían URLs de las páginas visitadas, direcciones IP intencionales, cookies, tokens de sesión, formularios privados ni identificadores del usuario o navegador.

---

## 3. Almacenamiento y Retención en el Servidor

La API (`dark-patterns-alumnos-back`) opera de forma **efímera y sin estado (stateless)** bajo el dominio fijo institucional `https://dark-patterns-extension.lifia.info.unlp.edu.ar`:
* Procesa los fragmentos de texto en memoria utilizando modelos lingüísticos (spaCy y clasificadores supervisados) para determinar si contienen patrones persuasivos o engañosos.
* Devuelve inmediatamente la clasificación booleana a la extensión.
* **No persiste, registra ni almacena** los textos enviados en bases de datos ni archivos de log permanentes.

En futuras versiones, en caso de incorporarse recolección anónima de métricas de uso o fragmentos estructurales del DOM con fines de investigación académica y mejora de la herramienta, se solicitará consentimiento explícito adicional mediante las declaraciones correspondientes del navegador (`technicalAndInteraction`).

---

## 4. Almacenamiento Local en el Navegador

La extensión utiliza únicamente almacenamiento local del navegador:
* `storage.sync`: Guarda exclusivamente las preferencias de configuración del usuario (qué patrones están activos, colores de resaltado y modo de aviso).
* `localStorage` del sitio: Guarda selectores XPath de elementos que el usuario eligió explícitamente ignorar (*"Dejar de marcar este caso"*).

---

## 5. Código Abierto y Contacto

El código fuente completo tanto de la extensión como del servidor de análisis es público y auditable:
* **Extensión (Frontend):** https://github.com/jcgardey/dark-patterns-alumnos-front/tree/main/Extension
* **API NLP (Backend):** https://github.com/jcgardey/dark-patterns-alumnos-back

---

## English Summary (for Mozilla Add-ons Reviewers)

* **Data transmitted:** Only when the user explicitly enables *Confirm Shaming*, *Fake Urgency*, or *Fake Scarcity* (all disabled by default), the extension sends visible candidate UI text snippets and their relative DOM `XPath` via HTTPS POST to the UNLP/LIFIA academic API (`https://dark-patterns-extension.lifia.info.unlp.edu.ar`).
* **No PII / No Tracking:** Page URLs, cookies, credentials, browsing history, and user identifiers are never collected or transmitted.
* **Retention:** The backend API is stateless; texts are processed in memory and discarded immediately after returning the classification response.
