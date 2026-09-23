# Extensión Reduno · Captura de leads

Captura anuncios de particulares (Idealista, Fotocasa, Wallapop, Milanuncios…) en **1 clic**
y los envía a tu CRM. No usa bots ni rastrea nada: solo lee el anuncio que **tú** estás viendo
cuando pulsas el botón.

## Instalar en Chrome o Edge (5 minutos, gratis)

Las extensiones no se instalan desde una web; se cargan como "extensión sin empaquetar".
Solo hay que hacerlo una vez.

1. Descarga esta carpeta `extension` a tu ordenador (si clonaste el repo, ya la tienes).
   - Desde GitHub: botón verde **Code → Download ZIP**, y descomprime.
2. Abre tu navegador y ve a:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Activa el interruptor **"Modo de desarrollador"** (arriba a la derecha en Chrome; abajo a la izquierda en Edge).
4. Pulsa **"Cargar descomprimida"** (Chrome) / **"Cargar desempaquetado"** (Edge).
5. Selecciona la carpeta **`extension`** (la que contiene `manifest.json`).
6. Fija el icono **R** azul en la barra: clic en el icono de piezas 🧩 y en la chincheta 📌.

## Cómo usarla

1. Abre un anuncio en Idealista, Fotocasa, Wallapop, etc.
2. Pulsa el icono **R**.
3. La extensión rellena sola lo que encuentra (título, precio, zona, teléfono si es público).
   Revisa/corrige, elige Vendedor o Comprador, y pulsa **"Guardar en CRM"**.
4. Se abre (o se actualiza) tu CRM con el lead ya añadido. Listo.

## Notas
- Si un anuncio no muestra teléfono público, contáctalo por el chat del portal.
- **Uso responsable:** contacta tú y pide consentimiento antes de enviar publicidad (RGPD/LSSI).
- Si cambias la URL de tu CRM, actualiza `CRM_URL` en `popup.js` y `manifest.json`.
