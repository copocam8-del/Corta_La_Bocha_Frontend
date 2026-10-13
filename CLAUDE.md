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
    apiErrors.ts             traduce errores del backend a errores por campo
  components/
    ProtectedRoute.tsx       sin token o token vencido → /login
    FieldError.tsx           mensaje de error debajo de un input
    BackButton.tsx           botón "Volver" (fijo arriba a la izquierda) + ventana "¿Seguro?" (textos en abandonar.ts)
  games/multiConfig.ts       menú y opciones de las salas de cada juego (copia del backend)
  multi/juegos/              pantallas de partida multijugador de trivia, ahorcado, sopa y memotest
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
- Los datos que faltan completar están marcados con `<Falta>…</Falta>` (se ven resaltados en amarillo).
- Si la app empieza a guardar un dato nuevo o a usar otro proveedor, **actualizá la Política de privacidad**
  (y la fecha `LEGAL_LAST_UPDATE`).
- El registro exige aceptar Términos y Privacidad (casilla obligatoria, consentimiento de la Ley 25.326).

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
  IA"; los demás: "Jugar solo"), **Con amigos** (crear sala privada / unirse con código) y **Online** (partida
  pública). El ranking está en el Dashboard y en el perfil (ya no en este menú).
- Rutas del multijugador por juego: `/juego/:game/crear-sala`, `/juego/:game/codigo`, `/juego/:game/publica`,
  `/juego/:game/buscando` y la sala `/room/:code` (el juego lo dice el servidor: `state.game`). Las rutas viejas de
  Tutti Frutti (`/lobby`, `/create-room`, `/public-setup`) redirigen al menú nuevo.
- Opciones de cada juego (temática, dificultad, rondas, tiempo, máximo de jugadores, pública) en
  `games/multiConfig.ts`: **copia de `src/rooms/modes/*.mode.ts` del backend**; si cambia una, cambiala en los dos.
- Íconos y nombres de cada juego en `games/gameIcons.ts` (íconos de lucide, sin logos de terceros).
- El ranking tiene filtro por juego (el ELO es general); el perfil muestra estadísticas por juego y los logros
  agrupados (generales y de cada juego).

## Juegos

- Componentes comunes: `games/GameResult.tsx` (resultado con puntos y logros) y `multi/MultiShell.tsx` (fondo).
- **Ahorcado** (`/ahorcado`, `pages/Ahorcado.tsx`, `api/ahorcado.ts`): la pelota (`games/Pelota.tsx`, etapas en
  `games/pelotaEtapas.ts`) se aplasta con cada error. Teclado en pantalla (con Ñ) y del teclado físico. El
  navegador nunca conoce la respuesta hasta el final.
- **Trivia** (`/trivia`, `pages/Trivia.tsx`, `api/trivia.ts`): pregunta con 4 opciones en `games/QuestionCard.tsx`
  (la reusa el desafío del día). El reloj es sólo visual; si llega a 0 se manda `opcion: null`. El servidor corrige.
- **Desafío del día** (`/desafio-diario`, `pages/DesafioDiario.tsx`, `api/desafio.ts`): si ya jugó hoy muestra el
  resultado, la racha, el botón Compartir (`navigator.share` o copiar) y la cuenta regresiva; tabla del día abajo.
- **Sopa de letras** (`/sopa-de-letras`, `pages/SopaDeLetras.tsx`, `api/sopa.ts`): se marca arrastrando (mouse o
  dedo, con `pointer events` y `touch-action: none`) o tocando la primera y después la última letra. La línea se
  "pega" a la dirección recta más cercana (`games/sopaLinea.ts`). El servidor verifica.
- **Memotest** (`/memotest`, `pages/Memotest.tsx`, `api/memotest.ts`): cartas con texto e íconos de lucide (escudo,
  etiqueta, persona, bandera, estadio). Si dos cartas no son par, se ven 0,9 s y se tapan.
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
- Perfil → "Editar perfil": Nombre y Apellido (arriba de Nombre de usuario) se validan antes de enviar con
  `validateProfileNames` de `auth/rules.ts` (obligatorios, hasta `NAME_MAX` = 50, igual que el registro). Al guardar se
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
    nombres de los jugadores en `multi/players.ts`; estilos en `multi/MultiShell.tsx`.
- Resultado de la partida solo (`game/RoundResults.tsx`): por cada categoría, tu respuesta y la de la máquina con su
  estado (Válida / No vale / Sin respuesta / Sin validar), puntos, motivo y el nombre que reconoció la IA. Si
  `validationIncomplete` es true se muestra un aviso: la IA no respondió y la partida no cuenta para estadísticas.
  Puntaje: 20 único válido, 10 válida y distinta, 5 repetida, 0 no vale (lo calcula el backend).
- Logros: `GET /users/me/achievements` (nombre y descripción vienen del backend). Íconos por id en
  `profile/achievementIcons.ts`; grilla en `profile/AchievementsGrid.tsx` (bloqueados en gris). La partida solo
  muestra "¡Logro desbloqueado!" con los `newAchievements` que devuelve el backend.

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
- `.env.production` tiene las URLs de Render (son públicas, no secretos).

## Reglas para trabajar

- El frontend no calcula puntajes, rankings ni valida respuestas: sólo muestra lo que dice el backend
  (ver `docs/RULES.md` del backend).
- Trabajar en una rama y abrir PR contra `main`.
