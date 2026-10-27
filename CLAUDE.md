# CLAUDE.md — Corta La Bocha (frontend)

"Corta La Bocha" es un Tutti Frutti (Stop) de fútbol. Equipo: Camila Copo, Augusto Trento y Nicolás Borda.
El backend vive en `../Corta_La_Bocha_Backend` (NestJS + Prisma + PostgreSQL) y tiene su propio CLAUDE.md
con la descripción del juego, la API y las reglas del proyecto.

Hablá en español rioplatense y explicá simple: el equipo está aprendiendo.

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **react-router-dom 7** (rutas en `src/App.tsx`)
- **axios** (cliente en `src/api/axios.ts`), **lucide-react** (íconos), **Tailwind 4** (aunque la mayoría de
  las páginas usan estilos inline + un bloque `<style>`)
- Tests con **Vitest** (`*.test.ts`)

## Comandos

```bash
npm ci            # instalar dependencias
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # chequeo de tipos + build a dist/
npm test          # tests (vitest run)
npm run lint      # eslint (hay errores viejos en varias páginas, ej. Math.random en render)
```

## Estructura

```
src/
  App.tsx                    rutas; las privadas van envueltas en <ProtectedRoute>
  api/axios.ts               cliente axios: agrega el token y ante un 401 manda a /login?expired=1
  auth/
    session.ts               token en localStorage, lectura de "exp" del JWT
    rules.ts                 reglas de registro/login (copia de las del backend)
    common-passwords.ts      contraseñas demasiado comunes (copia exacta de la lista del backend)
    turnstile.ts             captcha de Cloudflare Turnstile (carga del script + CaptchaToken)
    apiErrors.ts             traduce errores del backend a errores por campo
  moderacion/                filtro de malas palabras: palabras.ts + filtro.ts (COPIA EXACTA del backend)
  components/
    ProtectedRoute.tsx       sin token o token vencido → /login; Términos pendientes → AceptarTerminos.tsx
    FieldError.tsx           mensaje de error debajo de un input
    BackButton.tsx           botón "Volver" (fijo arriba a la izquierda) + ventana "¿Seguro?" (textos en abandonar.ts)
  games/multiConfig.ts       menú y opciones de las salas de cada juego (copia del backend)
  multi/juegos/              pantallas de partida multijugador de trivia, ahorcado, sopa, memotest y El Impostor
  games/ui/                  formato común de TODOS los juegos (estilo.ts + JuegoUI.tsx): columna, barra fija, "?", hojas, filas de ajustes
  games/comoJugar.ts         pasos de "Cómo jugar" de cada juego (la hoja del "?")
  games/impostor/            El Impostor: reglas de "En persona" (presencial.ts), lo propio de su estilo (estilo.ts + ImpostorUI.tsx) y su menú
  pages/                     una página por pantalla (Login, Register, Dashboard, GameMenu, Game, Room…)
```

## Auth en el frontend

- El login guarda `token`, `username` y `name` en `localStorage`.
- `ProtectedRoute` revisa que el token exista **y** que no esté vencido (`exp`). Si venció, limpia la sesión
  y redirige a `/login?expired=1`, donde se muestra "Tu sesión venció".
- El interceptor de axios hace lo mismo si el backend responde 401 (salvo en `/auth/login`, donde 401
  significa contraseña incorrecta).
- Las reglas de `src/auth/rules.ts` sólo sirven para avisar antes de enviar; **el backend decide**.
  Si cambia una regla, hay que cambiarla en los dos repos (backend: `src/auth/dto/auth-rules.ts`).
- Todos los mensajes que ve el usuario van en español.
- El nombre de usuario en el registro es opcional: si queda vacío, el backend genera uno.
- `GET /users` y `GET /users/:id` devuelven sólo datos públicos (usuario, país, perfil de juego).
  Email, fecha de nacimiento y nombre real sólo vienen en `GET /users/me`.
- Para cerrar sesión usar `clearSession()` (borra token, username y name), no `removeItem('token')`.
- Contraseñas: el registro y "contraseña nueva" avisan si está en la lista de las más comunes
  (`auth/common-passwords.ts`, **copia exacta** de `src/auth/dto/common-passwords.ts` del backend: un test del
  backend compara las dos). Mismo mensaje que el backend ("Esa contraseña es muy común…").
- Malas palabras: ver "Filtro de malas palabras".
- 429: `parseAuthError` muestra el mensaje del backend, que dice cuánto esperar (1 minuto por IP, 15 por email).

## Filtro de malas palabras (`src/moderacion/`)

- `palabras.ts` (la lista) y `filtro.ts` (normalización + `contieneOfensivo`, `esNombreReservado`, `usuarioPermitido` y
  los mensajes) son **copia exacta** de `src/moderacion/` del backend: un test del backend compara los dos archivos.
  **No los edites acá solos**: cambiá el backend y copiá los dos archivos (cómo agregar una palabra está arriba de
  `palabras.ts`; el detalle de cómo compara está en el CLAUDE.md del backend). **Decide el backend**: acá sólo se avisa antes.
- Avisa antes de enviar, con el mismo mensaje que el backend:
  - Registro (`validateRegister`) y "Editar perfil" (`validateProfile` en `auth/rules.ts`): usuario ofensivo o reservado
    (admin, moderador, clb…) → "Ese nombre de usuario no está permitido. Elegí otro."; nombre/apellido → "Ese nombre
    (apellido) no está permitido. Elegí otro."; bio y favoritos → "Ese texto no está permitido.".
  - El Impostor online (`multi/juegos/impostorAviso.ts`): pista → "Esa pista no está permitida."; adivinanza → "Esa
    respuesta no está permitida." (no se manda y no gasta el intento).
- Tutti Frutti multijugador: el backend manda "***" (`TEXTO_OCULTO`) en lugar de la respuesta ofensiva de otro (y
  `ofensiva: true`); `MultiRoundResults` la muestra tenue con `aria-label="Respuesta no permitida"`. Cuenta como "No vale".
- El Impostor "En persona" no se filtra: los nombres y las pistas no viajan a nadie (es un solo celular).

## Seguridad

Checklist pre-producción (rama `feat/seguridad`, octubre 2026; el detalle completo está en el CLAUDE.md del backend).

| Punto | Estado | Dónde |
|---|---|---|
| Cabeceras HTTP | ✅ | `vercel.json`, para todas las rutas: HSTS 1 año + subdominios, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (cámara, micrófono y ubicación apagados). Un test (`src/vercelHeaders.test.ts`) las controla |
| CSP | ⚠️ Report-Only | `Content-Security-Policy-Report-Only` en `vercel.json`: **avisa en la consola del navegador pero no bloquea nada**. Permite el backend de Render (https y wss), Google Identity (`accounts.google.com/gsi/…`), Cloudflare Turnstile (`challenges.cloudflare.com`), Google Fonts y los estilos inline (las páginas usan `style={{…}}` y bloques `<style>`). Scripts inline, `eval` y plugins NO están permitidos (el build no los usa). **Si agregás un servicio externo, sumalo a la CSP.** Cuando pase un tiempo sin avisos en la consola, se puede cambiar a `Content-Security-Policy` (que sí bloquea) |
| Contraseñas comunes | ✅ | ver "Auth en el frontend" |
| Captcha Turnstile | ⚠️ falta cargar la clave | `components/TurnstileWidget.tsx` en Register: con `VITE_TURNSTILE_SITE_KEY` muestra el widget **invisible** (`appearance: interaction-only`: sólo aparece si Cloudflare necesita que la persona haga algo) y manda `captchaToken`. Cada token sirve una vez: después de cada envío se pide otro (`captcha.reset()`). Sin la variable, nada cambia |
| CI | ✅ | `.github/workflows/ci.yml` en cada PR: `npm ci`, `npm test`, `npm run build`, `npm audit --audit-level=high --omit=dev` y gitleaks sobre todo el historial. Hoy 0 vulnerabilidades (nada ignorado). `.github/dependabot.yml`: npm y github-actions semanal, con 14 días de espera |

- **Token Bearer en `localStorage`, no cookies (a propósito)**: el navegador no lo manda solo, así que no hace falta
  protección CSRF. La contra es que un XSS podría leerlo: por eso no usamos `dangerouslySetInnerHTML` y hay CSP.
- **No hay uploads**: la app no sube archivos (los avatares son de una lista fija).

## Recuperar contraseña

- Login → "¿Olvidaste tu contraseña?" → `/olvide-contrasena` (pide el email; el mensaje es el mismo exista o no la
  cuenta) → mail con el link → `/restablecer-contrasena?token=…` (contraseña nueva + repetirla, reglas en
  `auth/rules.ts` → `validateNewPassword`). API en `api/password.ts`.

## Frases que rotan

- Arriba del título en Login, Register, el menú de cada juego y la configuración de Tutti Frutti solo ya no hay
  "Temporada 2025/2026": va `components/FraseRotativa.tsx`, que cambia de frase futbolera cada 4 s (`FRASE_MS`) con un
  fundido, empezando por una al azar cada vez que se abre la app. La lista está en `components/frases.ts`. Reserva el alto de dos renglones para que la pantalla no salte en
  el celular. Un test controla que ninguna pantalla vuelva a decir "Temporada 20xx".

## Páginas legales

- `/privacidad`, `/terminos` y `/cookies` (en `src/pages/legal/`, públicas). Usan `components/LegalLayout.tsx`.
- Responsable: **CLB Devs (responsable: Camila Copo)**, Ciudad Autónoma de Buenos Aires; contacto
  `clbdevelopers@outlook.es`; jurisdicción: tribunales ordinarios de la CABA. Ya no hay datos por completar (el marcador
  `<Falta>` se borró y un test controla que no vuelva).
- La Política de privacidad nombra a **todos** los proveedores y qué reciben: Supabase (base), Render (servidor), Vercel
  (página), Google (login y Gemini, que recibe las respuestas del Tutti Frutti sin datos personales), Brevo (mails de
  recuperar contraseña), Cloudflare Turnstile (captcha del registro), Google Fonts y los **backups** (copia diaria de la
  base, cifrada, en Google Drive y GitHub, que se borra a los 30 días). Edad mínima: 13 años.
- Si la app empieza a guardar un dato nuevo o a usar otro proveedor, **actualizá la Política de privacidad**
  (y la fecha `LEGAL_LAST_UPDATE`, hoy '27 de octubre de 2026'). Si el cambio es importante, subí también
  `TERMS_VERSION` en el backend (`src/legal/terminos.ts`): todos tienen que volver a aceptar.

## Aceptar los Términos (todos los usuarios)

- Registro: la casilla obligatoria ya existía; `registerPayload` manda `aceptaTerminos: true` (el backend lo exige y guarda
  fecha y versión). Si el backend responde el error en `aceptaTerminos`, se muestra debajo de la casilla.
- **Cualquier pantalla privada** pasa por `ProtectedRoute` → `ConTerminos`: pregunta `GET /users/me` una vez por sesión
  (`auth/terminos.ts` recuerda el token con los Términos al día; otro login vuelve a preguntar) y, si dice
  `terminosPendientes` (usuarios de antes, los que entran con Google, o cuando cambia la versión), en lugar de la pantalla
  muestra `components/AceptarTerminos.tsx`: "Actualizamos los Términos y la Política de privacidad", links a `/terminos` y
  `/privacidad` **en otra pestaña** (no se pierde la pantalla), la casilla "Leí y acepto…", "Aceptar y seguir" fijo abajo
  (desactivado sin la casilla) y "Cerrar sesión". Manda `POST /users/me/aceptar-terminos {version}` con la
  `terminosVersion` que dio `/users/me`. Hasta aceptar no se ve ninguna pantalla privada (ni juegos ni salas). Mientras
  pregunta muestra un spinner; si el servidor no responde, "Reintentar". Tests en `components/aceptarTerminos.test.tsx`.

## Botón "Volver"

- `components/BackButton.tsx`: flecha + "Volver", **igual en todas las pantallas** (fijo arriba a la izquierda, se
  dibuja con un portal en `<body>` para que `position: fixed` no dependa de contenedores con animación). Recibe `to`:
  la pantalla anterior **lógica**, no el historial del navegador:
  - menú de un juego → Dashboard; crear sala / pública / código → menú del juego; cola pública → elegir pública;
  - juego solo (configuración o partida) → menú de ese juego; sala (lobby, partida o final) → menú del juego;
  - perfil → Dashboard; ranking → de donde viniste (`state.from`: perfil o Dashboard); legales → de donde viniste
    (`state.from` que pone `LegalFooter`) o Dashboard/login; olvidé/restablecer contraseña → login.
- En el Dashboard, en su lugar va **"Cerrar sesión"** (mismo botón). En Login y Register no hay.
- En medio de una partida se pasa `confirm={ABANDONAR}` ("¿Seguro que querés abandonar? La partida cuenta como
  perdida") y `onLeave` (ahorcado/memotest solo: rendirse; sopa: terminar; multijugador: `room.leave()`, que les avisa
  a los demás). Desafío del día: avisa que el reloj sigue corriendo (se puede retomar).
- Las pantallas dejan lugar arriba para el botón (`MultiShell` tiene 52 px de padding arriba).

## Selección de juegos y menú de cada juego

- `/dashboard` (`pages/Dashboard.tsx`) es la pantalla de selección de juegos: el catálogo viene de `GET /games` y
  cada tarjeta muestra tus estadísticas de ese juego (`GET /users/me/games`). Después del login (Welcome) se va ahí.
  Los juegos con `multiplayer: true` abren su menú `/juego/:game`; el desafío del día va directo a su pantalla.
- `/juego/:game` (`pages/GameMenu.tsx`, el viejo Lobby): "¿Cómo querés jugar?" → **Solo** (Tutti Frutti: "Contra la
  IA"; los demás: "Jugar solo"; El Impostor no tiene: `solo` es opcional en `multiConfig`), **Con amigos** (crear sala privada / unirse con código) y **Online** (partida
  pública). El ranking está en el Dashboard y en el perfil (ya no en este menú).
- Juegos con `enPersona` en `multiConfig` (hoy sólo El Impostor): `/juego/:game` pregunta primero **"¿Cómo juegan?"**
  → "En persona" (`enPersona.path`) u "Online", que es el menú de siempre en `/juego/:game/online`. Las pantallas
  online (crear sala, código, pública, sala) vuelven ahí con `menuOnlinePath(game)` (en los demás juegos es `menuPath`).
- Rutas del multijugador por juego: `/juego/:game/crear-sala`, `/juego/:game/codigo`, `/juego/:game/publica`,
  `/juego/:game/buscando` y la sala `/room/:code` (el juego lo dice el servidor: `state.game`). Las rutas viejas de
  Tutti Frutti (`/lobby`, `/create-room`, `/public-setup`) redirigen al menú nuevo.
- Opciones de cada juego (temática, dificultad, rondas, tiempo, mínimo y máximo de jugadores, pública, explicación del
  lobby) en `games/multiConfig.ts`: **copia de `src/rooms/modes/*.mode.ts` del backend**; si cambia una, cambiala en los dos.
  `explicacion` (opcional) es el resumen del backend (en la pantalla, "Cómo jugar" sale de `games/comoJugar.ts`); `publica.rangos`
  cambia el "2 a 4 jugadores".
- Íconos y nombres de cada juego en `games/gameIcons.ts` (íconos de lucide, sin logos de terceros).
- El ranking tiene filtro por juego (el ELO es general); el perfil muestra estadísticas por juego y los logros
  agrupados (generales y de cada juego).

## Juegos

- **Formato común de todos los juegos** (`games/ui/`, el de El Impostor): menú de cada juego, configuración y partida solo,
  crear sala / código / pública / buscando, la sala de espera y las partidas multijugador. Los juegos de Tutti Frutti,
  ahorcado, trivia, sopa, memotest, desafío del día y El Impostor se ven igual:
  - `PantallaJuego` (`JuegoUI.tsx`): `MultiShell` con **columna de 480 px**, el `BackButton` de siempre a la izquierda y el
    **"?" a la derecha** (`BotonAyuda` → hoja "Cómo jugar" que sube desde abajo, pasos de `games/comoJugar.ts`: si cambia
    una regla en el backend, cambiá el texto ahí). `barra`: el **botón principal fijo abajo** (`ui-boton`, el "Entrar" del
    login) con el aviso justo arriba (`ui-barra-nota`). `BarraAbajo` deja al final un espacio del alto de la barra
    (ResizeObserver): la barra nunca tapa nada. La sala (`Room.tsx`) usa `MultiShell` + `EstilosJuego` + `BotonAyuda` y
    cada partida pone su `BarraAbajo`.
  - Bloques `.card` y **listas de ajustes** (`ui-filas` + `ui-fila`: ícono en un circulito verde, nombre y valor). Una
    opción que se elige de una lista es un `AjusteElegible` (la fila abre un `Selector` en una hoja; sin elegir dice
    "Elegí"; `deshabilitado` sólo muestra el valor). Las de la sala están en `multi/AjustesSala.tsx` (crear sala y lobby).
  - `Encabezado`: rótulo, el **ícono del juego** de `gameIcons.ts` en un círculo con brillo, título `.neon-title` y una línea.
  - Los tableros pueden ser más anchos que la columna en la compu con `.ui-ancho` y `--ancho` (sopa 600 px `SOPA_ANCHO`,
    memotest `anchoMesa` = 960 en la PC, grilla de Tutti Frutti 860). En el celular miden lo que la columna: **nunca hay
    scroll horizontal**.
  - Los estilos comunes van **una vez por pantalla** (`EstilosJuego`, lo pone `PantallaJuego`): la barra y las hojas van
    en un portal al `<body>` y no los repiten (una copia más abajo pisaría los estilos propios de un juego). Los efectos de
    pasar el mouse van en `@media (hover: hover)`. Ojo: el CSS base de Tailwind pone los íconos `display: block`; para un
    ícono al lado de un texto usá un `inline-flex`.
  - `games/ui/formato.test.tsx` controla el "?", las filas y que el botón principal esté en la barra.
- Componentes comunes: `games/GameResult.tsx` (resultado con puntos y logros; "Jugar otra" va fijo abajo) y
  `multi/MultiShell.tsx` (fondo). Final multijugador: `MultiFinal` con `abajo` pone "Jugar otra vez" / "Buscar otra
  partida" fijo abajo (El Impostor no lo usa).
- **Tutti Frutti**: la grilla es una tarjeta por categoría (`game/tuttiEstilo.ts`): en el celular de a dos, en la compu
  más ancha. "¡Basta!" fijo abajo con el aviso "completá todas las categorías" arriba (solo y multijugador).
- **Ahorcado** (`/ahorcado`, `pages/Ahorcado.tsx`, `api/ahorcado.ts`): la pelota (`games/Pelota.tsx`, etapas en
  `games/pelotaEtapas.ts`) se aplasta con cada error. Teclado en pantalla (con Ñ) y del teclado físico. El
  navegador nunca conoce la respuesta hasta el final. Se elige la dificultad (Medio de entrada) y se toca "¡Arrancar!".
  Palabra, teclado y "arriesgar" son los mismos en solo y multijugador (`games/AhorcadoUI.tsx`).
- **Trivia** (`/trivia`, `pages/Trivia.tsx`, `api/trivia.ts`): pregunta con 4 opciones en `games/QuestionCard.tsx`
  (la reusa el desafío del día). El reloj es sólo visual; si llega a 0 se manda `opcion: null`. El servidor corrige.
- **Desafío del día** (`/desafio-diario`, `pages/DesafioDiario.tsx`, `api/desafio.ts`): si ya jugó hoy muestra el
  resultado, la racha, el botón Compartir (`navigator.share` o copiar) y la cuenta regresiva; tabla del día abajo.
- **Sopa de letras** (`/sopa-de-letras`, `pages/SopaDeLetras.tsx`, `api/sopa.ts`): se marca arrastrando (mouse o
  dedo, con `pointer events` y `touch-action: none`) o tocando la primera y después la última letra. La línea se
  "pega" a la dirección recta más cercana (`games/sopaLinea.ts`). El servidor verifica.
- **Memotest** (`/memotest`, `pages/Memotest.tsx`, `api/memotest.ts`): cartas con texto e íconos de lucide (escudo,
  etiqueta, persona, bandera, estadio). Si dos cartas no son par, se ven 0,9 s y se tapan.
  - **El tablero se adapta a la pantalla** (solo y multijugador): `columnasMemotest(cartas, orientacion, ancho)` en
    `api/memotest.ts` arma siempre una grilla completa. PC (horizontal): 12 = 6×2, 16 = 8×2 (4×4 si la ventana mide
    menos de 900 px), 20 = 5×4. Celular (vertical): 12 = 3×4, 16 = 4×4, 20 = 4×5. "Celular" = ventana de menos de
    700 px o más alta que ancha (`orientacionDe`). `games/usePantallaMemotest.ts` escucha `resize` y `matchMedia`
    (girar el celular, achicar la ventana) y saca los listeners al desmontar. En la PC la mesa llega a 960 px
    (`MESA_PC`) y las cartas son apaisadas (4/3); en el celular, paradas (3/4). Letra e ícono
    según `medidasCarta`; columnas con `minmax(0, 1fr)` y el texto corta palabras largas, así nunca hay scroll horizontal.
    La columna de la pantalla es de 480 px y la mesa se ensancha con `.ui-ancho` (`anchoMesa`).
- **Estilo de El Impostor** (todas sus pantallas: menú, "En persona" y online): el formato común de los juegos (`games/ui`,
  ver arriba) y, en `games/impostor/estilo.ts` + `ImpostorUI.tsx`, sólo lo propio: los colores de rol, **impostor en ROJO**
  (`VenetianMask`, `imp-rojo`) y los demás, **"Hinchas", en CELESTE** (`Users`, `imp-celeste`), con brillo suave; la
  animación de la revelación y la ilustración: tres de NUESTROS hinchas **recortados sin el fondo gris** en
  `public/avatars/impostor/` (`HINCHAS_PORTADA`, el del medio adelante, con brillo verde y sin círculo); salen de
  `public/avatars/hinchas/` con un recorte del fondo (si cambian esas imágenes, hay que recortarlas de nuevo). Nada de
  imágenes de otras apps, escudos ni logos. `PantallaImpostor` = `PantallaJuego` + los estilos del Impostor.
- **Menú del Impostor** (`/juego/impostor`, `games/impostor/ImpostorMenu.tsx`, lo abre `GameMenu`): dos tarjetas grandes,
  "En persona" y "Online" (este último sigue siendo el menú de siempre en `/juego/impostor/online`).
- **El Impostor** (sólo multijugador, de 3 a 8; `multi/juegos/ImpostorMulti.tsx`, tipos en `multi/gameViews.ts` → `ImpostorView`):
  con el estilo del Impostor (funciona igual que antes): arriba tu rol ("Hincha" en celeste con tu palabra bien grande, o
  "Impostor" en rojo con "Sos el impostor" y la categoría), con botón para taparla; abajo la etapa con el reloj (pista de
  quién / ¡A votar! / ¡Descubrieron a X!), el campo de la pista sólo en tu turno (máx. 30; "Mandar pista" va en la barra fija
  de abajo, `form="imp-pista-form"`), la lista de pistas por jugador, la votación con un botón por cada uno de los demás y, si
  te descubren, el campo para adivinar ("Arriesgar" también abajo). La revelación (quién era, la palabra, los votos y los
  puntos) tiene animación. La sala y el lobby son los de todos los juegos (columna de 480 px, formato común); en la partida
  el "?" lo pone `ImpostorMulti` (la sala no lo repite). El servidor nunca le manda la palabra al impostor: la pantalla sólo muestra lo que llega.
  **El online tiene UN solo impostor** (varios impostores es sólo de "En persona": en el online habría que cambiar el modo del
  backend, la votación y los puntos). `multi/impostor.test.tsx` controla el menú, lo que ve cada uno y que las opciones sean las del backend.
  En el catálogo sigue "Próximamente" (`available: false`): para probarlo se entra directo a `/juego/impostor`.
- **El Impostor "En persona"** (`/juego/impostor/en-persona`, `pages/ImpostorPresencial.tsx`, reglas en
  `games/impostor/presencial.ts`, API en `api/impostor.ts`): **un solo celular que se pasan**. Pantallas:
  1. **Configuración** como "lista de ajustes" (filas con ícono a la izquierda y valor a la derecha): **Jugadores** (abre una
     hoja para agregar y sacar nombres: de 3 a 12, hasta 20 caracteres, sin repetidos sin importar tildes ni mayúsculas),
     **Impostores** con − y + (`maxImpostores`: 1 con 3-4 jugadores, 2 con 5-7, 3 con 8 o más; si sacan jugadores baja solo,
     `ajustarImpostores`), **Pista para el impostor** (interruptor: prendido ve la categoría, apagado no ve nada), **Temática**
     y **Rondas** (abren un selector). Botón "Iniciar juego". Nombres y ajustes se recuerdan en `localStorage` con try/catch
     (`impostor-en-persona-nombres` / `-ajustes`).
  2. **Pasar el celu**: "Jugador" chiquito y el nombre grande; una tarjeta con los hinchas que se **desliza hacia arriba**
     (pointer events, `touch-action: none`; también el botón "Ver mi palabra" para accesibilidad). Debajo aparece el rol, que
     sale SÓLO de `secretoDe(ronda, jugador, pista)`: impostor (rojo, "No tenés palabra", la categoría si la pista está
     prendida y cuántos impostores más hay, sin decir quiénes) o hincha (celeste, "Tu palabra es:" y la palabra). "Jugador
     siguiente" primero baja la tarjeta (se tapa todo) y después muestra el siguiente nombre con una pantalla nueva (`key`):
     **nunca queda la palabra del anterior**. El último ve "¡A dar pistas!".
  3. **Orden de pistas**: "Empieza NOMBRE" grande y la lista numerada (dos vueltas, en voz alta) → "¡A votar!".
  4. **Votación** en voz alta con reloj opcional (sin reloj / 30 s / 60 s, contra la hora de fin) → "Revelar".
  5. **Revelación** con animación: quiénes eran los impostores (pueden ser varios) y la palabra → "Siguiente ronda" o "Ver final".
  6. **Final**: palabra e impostores de cada ronda, "Jugar de nuevo" y "Cambiar ajustes".
  Los impostores de cada ronda rotan (`armarRondas(jugadores, palabras, impostores)` + `elegirImpostores`: siempre distintos
  en la ronda, primero los que menos veces lo fueron). "¡Jugar!" pide las palabras a `POST /impostor/local` (una por ronda) y
  **todo lo demás pasa en el navegador**. **No cuenta** para estadísticas, ELO, ligas ni logros. Volver en plena partida
  pregunta antes (`SALIR_EN_PERSONA`). Tests en `games/impostor/impostorPresencial.test.tsx` (rotación con varios
  impostores, pista prendida/apagada, que nunca se vea la palabra del anterior, cada pantalla).
- Ojo en Windows: no puede haber dos archivos que sólo difieren en mayúsculas (`Pelota.tsx` y `pelota.ts` chocan).

## Perfil, partidas y ranking

- Partida solo (`pages/Game.tsx`): la decide el servidor. `api/soloMatch.ts` llama a
  `POST /solo-matches/quick` (letra, categorías y plan de la máquina) y a `.../finish` (resultado oficial y
  estadísticas). El frontend **no** calcula puntajes ni quién ganó.
  - Reloj: se calcula contra la hora de fin (`game/round.ts` → `secondsLeft`), no restando de a 1, para que no
    se atrase con la pestaña en segundo plano. La duración sale de `roundSeconds` del servidor.
  - ¡Basta! sólo con **todas** las categorías completas (`missingCategories`); el backend lo vuelve a controlar
    (400). El cartel final dice "¡Basta!" o "¡Tiempo!" según cómo terminó la ronda.
  - La fila de la máquina muestra un lápiz cuando ya escribió (según `aiPlan`); sus respuestas se ven al final.
  - Errores de `finish`: 409 ya terminada, 410 venció (llegó muy tarde: cuenta como perdida), 400 se muestra el
    mensaje del servidor.
- Avatares (`profile/avatars.tsx` → `<Avatar id size>` y `<AvatarPicker>`): los clásicos (íconos, `profile/avatarData.ts`)
  y los **hinchas de clubes** (`profile/hinchas.ts` = datos de cada club; `profile/Hincha.tsx` = el personaje en SVG).
  - **Desde octubre 2026 se ven ilustraciones**: una imagen por avatar en `public/avatars/hinchas/<id>.webp` (384×384,
    ~18 KB). Salen de UNA ilustración base propia (hecha por Camila con IA: el hincha con el mate, ropa en verde, magenta y
    celeste puros) que un script recolorea por club: camiseta con el diseño (rayas, franja, banda, mitades, V), short,
    medias y piluso con un color del club, sobre fondo gris liso (sin círculo). `<Avatar>` muestra la imagen (`hinchaImagen(id)`);
    chiquito la agranda ×1,9 y la centra en cara y pecho. Si la imagen no carga, usa el SVG de `Hincha.tsx` (respaldo).
    Las imágenes tampoco pueden tener texto, escudos, logos ni sponsors. Un test controla que haya una por hincha.
    Para un club nuevo hay que generar su imagen con el mismo script (pedírselo a Claude con la imagen base).
  - **Dos poses por club**: 1 = con el mate (id del club) y 2 = festejando con los brazos arriba (mismo id + `_2`;
    `avatarIdDe`, `poseDe`, `HINCHA_AVATAR_IDS` en `hinchas.ts`; backend: `CLUB_AVATAR_IDS_2`). El selector muestra las
    dos. `getHincha` acepta los dos ids. Chiquito, cada pose se centra distinto (`CENTRO_CHICO` en `avatars.tsx`).
  - El SVG de respaldo es un personaje PROPIO armado en código, caricatura de hincha de barrio: flaco y desgarbado, cabeza
    grande, pelo largo (flequillo, desprolijo, raya al medio o rulos), sonrisa enorme con dientes y ojos achinados. En una
    mano el vaso de fernet con coca (casi negro, espuma clara; sin marcas); con la otra señala, hace pulgar arriba o la
    apoya en la cintura. Camiseta un poco grande, short corto, medias bajas, zapatillas blancas grandes. Sin gorro.
    Contorno negro tipo historieta, sombras simples y fondo de color fuerte. Cambia según el club: diseño de camiseta
    (`lisa`, `rayas`, `aros`, `franja`, `banda`, `mitades`, `v`) y colores. Del id (`varianteDe`, con hash mezclado)
    salen pose (6), espejo (vaso en la otra mano; nunca en mitades ni banda), cara (3), piel (4), pelo (4) y color,
    bigote finito o barba de pocos días, y cadenita o muñequera con los colores del club.
  - **Un avatar por camiseta**: si varios clubes tienen la misma (mismo diseño y colores, aunque cambie el fondo), hay un
    solo avatar con el club más conocido en `club` y los demás en `otros` (no se muestran en el selector, pero el
    buscador los encuentra). 45 clubes en 29 avatares. Un test controla que no haya camisetas repetidas.
  - **Prohibido** en el dibujo: texto, nombres de clubes, escudos o formas de escudo, logos, sponsors y marcas. El nombre
    del club tampoco aparece debajo de la miniatura: el selector muestra sólo el avatar, y el nombre (club y "otros") va
    en `title` y `aria-label` para accesibilidad. Los tests lo controlan (`avatars.test.tsx`).
  - Chiquito (`size` < 48: ranking, salas, marcador) se encuadra de la cintura para arriba; grande, de cuerpo entero.
  - Para agregar un club: si su camiseta ya existe, sumalo a `otros` de ese avatar (sin id nuevo). Si no, agregá el avatar
    en `hinchas.ts` (orden alfabético por nombre) y su id en `CLUB_AVATAR_IDS` del backend. Una vez publicado, un id no se
    cambia ni se borra (los usuarios lo pueden tener elegido).
  - Se muestran en el perfil (grande), el ranking (podio y filas), el lobby de las salas, el marcador de la partida y el
    menú de cada juego.
- Perfil → "Editar perfil": antes de enviar se valida con `validateProfile` de `auth/rules.ts`: Nombre y Apellido
  (arriba de Nombre de usuario; obligatorios, hasta `NAME_MAX` = 50, igual que el registro, con `validateProfileNames`)
  y el filtro de malas palabras en usuario, bio y favoritos. Al guardar se
  actualiza el nombre de arriba y el `name` de localStorage (es el `first_name`, como en el login).
- Perfil (`pages/Profile.tsx`): avatar del set propio (clásicos o hinchas, mismos ids que el backend),
  equipo/selección/jugador favorito, bio, estadísticas y puesto en el ranking (`api/profile.ts`).
- Ranking (`pages/GlobalRanking.tsx`): pestañas Global / Semanal / Mensual / ELO (`GET /users/ranking?period=…`) y
  "Tu posición" aunque no estés en el top (`GET /users/me/ranking?period=…`). El perfil muestra ELO y puesto en
  las ligas semanal y mensual; la partida solo muestra cuánto cambió el ELO.
- **Multijugador real** (`src/multi/`): una sola conexión Socket.IO (`multi/socket.ts`, autenticada con el token;
  URL `VITE_WS_URL` o `VITE_API_URL`). `useRoom(code)` entra a la sala (y vuelve a entrar si se corta), recibe
  `room:state` y expone las acciones. El servidor manda en todo; el frontend sólo muestra y manda lo que se escribe
  (borrador cada 350 ms y el final al cortar la ronda). Reloj con `multi/clock.ts` (corrige la diferencia con el
  reloj del servidor).
  - `/juego/:game/crear-sala` → `POST /rooms {game, …}` → `/juego/:game/codigo` (código real) → `/room/:code`.
  - `/room/:code` (`pages/Room.tsx`) muestra el lobby (opciones del juego) o la partida según la fase y el juego:
    Tutti Frutti en `pages/GameMulti.tsx`; trivia, ahorcado, sopa y memotest en `multi/juegos/*Multi.tsx` (leen
    `state.view`, tipos en `multi/gameViews.ts`, y mandan jugadas con `room.action(type, payload)` → `game:action`).
    Recargar vuelve a donde estabas. `/game-multi/:code` redirige ahí. Si te vas de la pantalla, se avisa `room:leave`.
  - Pública: `/juego/:game/publica` (tamaño; temática sólo en Tutti Frutti) → `/juego/:game/buscando` (cola) →
    `queue:matched` → `/room/:code`.
  - Partes comunes (encabezado, marcador, cuenta regresiva y final con logros) en `multi/MultiParts.tsx`; colores y
    nombres de los jugadores en `multi/players.ts`; estilos en `multi/MultiShell.tsx`. `MultiShell` le saca la animación de
    entrada a su contenedor cuando termina: mientras está puesta, el vidrio de las `.card` (`backdrop-filter`) no difumina la
    cancha de atrás y se ven las líneas nítidas a través de las tarjetas.
  - **Empate en el primer puesto** (el backend manda `final.empate` y `final.empatados`, y `result: 'draw'` en cada
    posición): nadie gana. Los que empataron ven "¡Empate!" con `Handshake` en amarillo (como el empate contra la
    máquina) y abajo "Empataron X e Y"; los demás ven "Empataron X, Y y Z" en vez de "Ganó…". En las posiciones, los
    empatados llevan el apretón de manos (nunca "Ganador"). Los nombres se unen con `listaNombres` (`players.ts`).
- Resultado de la partida solo (`game/RoundResults.tsx`): por cada categoría, tu respuesta y la de la máquina con su
  estado (Válida / No vale / Sin respuesta / Sin validar), puntos, motivo y el nombre que reconoció la IA. Si
  `validationIncomplete` es true se muestra un aviso: la IA no respondió y la partida no cuenta para estadísticas.
  Puntaje: 20 único válido, 10 válida y distinta, 5 repetida, 0 no vale (lo calcula el backend).
- Logros: `GET /users/me/achievements` (nombre y descripción vienen del backend). Íconos por id en
  `profile/achievementIcons.ts`; grilla en `profile/AchievementsGrid.tsx` (bloqueados en gris). La partida solo
  muestra "¡Logro desbloqueado!" con los `newAchievements` que devuelve el backend.

## Panel de administración (`/admin`, sólo lectura)

- **Quién entra lo decide el backend** (`ADMIN_EMAILS` en Render). El frontend sólo usa `isAdmin` de `GET /users/me`:
  el botón **"Panel"** del Dashboard (`PanelButton`) aparece sólo si es `true`, y `/admin` (`pages/Admin.tsx`) vuelve al
  Dashboard si es `false` o si `/admin/*` responde 404 (no sos admin). Hasta confirmarlo no muestra nada.
- Pestañas Usuarios / Partidas / IA / Contenido / Nombres (`admin/AdminTabs.tsx`) y período Hoy / 7 días / 30 días / Todo. Cada
  pestaña y período se pide una vez (`api/admin.ts`) y queda guardado mientras estás en la pantalla. El backend limita a
  30 pedidos por minuto (429 → "Demasiados pedidos" con botón Reintentar).
- **Nombres** (`TabNombres`, `GET /admin/nombres`): "Nombres a revisar", tabla de sólo lectura con los usuarios que
  ya existen y cuyo nombre no pasaría el filtro de malas palabras (usuario, alta y motivo: ofensivo o reservado). No
  depende del período y no tiene botones: nada se cambia solo.
- Tarjetas con números grandes y gráficos hechos con SVG/CSS, **sin librerías** (`admin/AdminParts.tsx`: `BarrasPorDia`
  apilado por juego, `BarrasHorizontales`, `Tabla` que en el celular se desplaza adentro de su caja). Colores por juego y
  formatos (números y plata con coma, días "13 oct") en `admin/adminFormat.ts`.
- `<meta name="robots" content="noindex, nofollow">` dentro de la pantalla (React 19 lo sube al `<head>`). "Volver" al
  Dashboard. El panel no calcula nada: muestra lo que manda el servidor (incluido lo que la base no guarda).

## Login con Google

- `components/GoogleButton.tsx` (en Login y Register) usa Google Identity Services (`auth/googleIdentity.ts`) y
  manda el `credential` a `POST /auth/google`. **Si `VITE_GOOGLE_CLIENT_ID` no está definido, el botón no se
  muestra.** La sesión se guarda con `saveSession()` igual que en el login normal.

## Programar en tu compu

Copiá `.env.local.example` a `.env.local` (apunta al backend local en el puerto 3000) y corré `npm run dev`. El
backend local se levanta con `npm run db:local` y `npm run dev:local` (ver el README del backend).

## Publicidad (apagada)

`ads/AdSlot.tsx` reserva un espacio para un anuncio **entre partidas** (resultados y selección de juegos). No dibuja
nada salvo que `VITE_ADS_ENABLED=true`. No hay ninguna red de anuncios integrada: antes de activarla leé
`docs/PUBLICIDAD.md` (usuarios desde 13 años, anuncios no personalizados, consentimiento de cookies, políticas).

## Variables de entorno

- `VITE_API_URL`: URL del backend (default `http://localhost:3000`)
- `VITE_WS_URL`: URL de WebSocket
- `VITE_GOOGLE_CLIENT_ID`: Client ID de Google (opcional). Ver `.env.example`.
  En producción está cargado en Vercel (proyecto **corta-la-bocha-frontend**, tipo Config) y en Render como `GOOGLE_CLIENT_ID`.
  Al cambiar una variable `VITE_` en Vercel hay que volver a publicar, porque se leen en el build.
- `VITE_ADS_ENABLED`: `true` muestra el espacio de publicidad (por defecto apagado). Ver `docs/PUBLICIDAD.md`.
- `VITE_TURNSTILE_SITE_KEY`: "Site Key" del widget de Cloudflare Turnstile (opcional, es pública). Va con
  `TURNSTILE_SECRET_KEY` del backend (Render). Sin ella, el registro funciona sin captcha.
- `.env.production` tiene las URLs de Render (son públicas, no secretos).

## Reglas para trabajar

- El frontend no calcula puntajes, rankings ni valida respuestas: sólo muestra lo que dice el backend
  (ver `docs/RULES.md` del backend).
- Trabajar en una rama y abrir PR contra `main`.
