# Espacio para publicidad (apagado)

La app tiene un lugar reservado para **un anuncio no intrusivo entre partidas**, pero **no hay ninguna red de
anuncios integrada** y el espacio está **apagado**: no se dibuja, no ocupa lugar y no carga nada de terceros.

## Dónde aparecería

Componente `src/ads/AdSlot.tsx` (configuración en `src/ads/ads.ts`). Sólo **entre partidas**, nunca durante una
ronda ni encima de los botones del juego:

- Tarjeta de resultado de los juegos (`games/GameResult.tsx`: ahorcado, trivia, sopa de letras, memotest).
- Resultado de la partida contra la máquina (`pages/Game.tsx`, recién cuando llegó el resultado).
- Final del multijugador (`pages/GameMulti.tsx`).
- Abajo de la pantalla de selección de juegos (`pages/Dashboard.tsx`).

El recuadro mide como máximo 336 px de ancho (un formato "rectángulo mediano" de 300×250 entra) y está marcado
como "Publicidad" (también para lectores de pantalla).

## Cómo se activaría

1. Elegir la red de anuncios y aprobar la cuenta del sitio en esa red.
2. Poner `VITE_ADS_ENABLED=true` en las variables del frontend (Vercel) y volver a publicar. Con cualquier otro
   valor (o sin la variable) sigue apagado.
3. Cargar el script de la red **sólo si `adsEnabled()` es true y el usuario dio su consentimiento** (ver abajo), y
   renderizar el anuncio adentro de `AdSlot`.
4. Si la red lo pide, agregar `public/ads.txt`.

## Qué hay que tener en cuenta antes de prenderlo

- **Usuarios desde 13 años**: hay menores de edad registrados. Usar **sólo anuncios no personalizados** (sin
  seguimiento) para todos, o como mínimo para los menores de 18 (la fecha de nacimiento está en el perfil, pero
  **nunca** se la pasamos a la red de anuncios). Marcar el sitio como apto para menores en la configuración de la red
  y bloquear categorías sensibles (apuestas, alcohol, citas, etc.). **Apuestas deportivas: bloquearlas sí o sí.**
- **Política de privacidad** (`/privacidad`): sumar la red de anuncios como proveedor, qué datos recibe (IP,
  navegador, cookies) y para qué. Actualizar la fecha (`LEGAL_LAST_UPDATE`).
- **Política de cookies** (`/cookies`): las redes de anuncios usan cookies de terceros. Hay que listarlas y pedir
  **consentimiento previo** (banner con "Aceptar" y "Rechazar" igual de visibles) antes de cargar el script. Sin
  consentimiento, no se carga nada.
- **Ley 25.326** (Argentina) y, si hay usuarios de otros países, sus normas (ej. GDPR en Europa).
- **No intrusivo**: sin pop-ups, sin videos con sonido automático, sin anuncios que tapen el juego ni en medio de una
  ronda (el reloj corre). Un solo anuncio por pantalla.
- **Rendimiento**: cargar el script con `async`, sólo en las pantallas con anuncio, y medir que no empeore la carga en
  el celular.
- **Seguridad**: si se agrega una Content Security Policy, permitir sólo los dominios de la red elegida.
- **Términos y condiciones**: mencionar que el servicio puede mostrar publicidad.
