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
  pages/                     una página por pantalla (Login, Register, Dashboard, Game, Room…)
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

## Páginas legales

- `/privacidad`, `/terminos` y `/cookies` (en `src/pages/legal/`, públicas). Usan `components/LegalLayout.tsx`.
- Los datos que faltan completar están marcados con `<Falta>…</Falta>` (se ven resaltados en amarillo).
- Si la app empieza a guardar un dato nuevo o a usar otro proveedor, **actualizá la Política de privacidad**
  (y la fecha `LEGAL_LAST_UPDATE`).
- El registro exige aceptar Términos y Privacidad (casilla obligatoria, consentimiento de la Ley 25.326).

## Selección de juegos

- `/dashboard` (`pages/Dashboard.tsx`) es la pantalla de selección de juegos: el catálogo viene de `GET /games` y
  cada tarjeta muestra tus estadísticas de ese juego (`GET /users/me/games`). Después del login (Welcome) se va ahí;
  Tutti Frutti lleva a `/lobby` (que tiene "Otros juegos" para volver).
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
- Perfil (`pages/Profile.tsx`): avatar del set propio (`profile/avatarData.ts`, mismos ids que el backend),
  equipo/selección/jugador favorito, bio, estadísticas y puesto en el ranking (`api/profile.ts`).
- Ranking (`pages/GlobalRanking.tsx`): pestañas Global / Semanal / Mensual / ELO (`GET /users/ranking?period=…`) y
  "Tu posición" aunque no estés en el top (`GET /users/me/ranking?period=…`). El perfil muestra ELO y puesto en
  las ligas semanal y mensual; la partida solo muestra cuánto cambió el ELO.
- **Multijugador real** (`src/multi/`): una sola conexión Socket.IO (`multi/socket.ts`, autenticada con el token;
  URL `VITE_WS_URL` o `VITE_API_URL`). `useRoom(code)` entra a la sala (y vuelve a entrar si se corta), recibe
  `room:state` y expone las acciones. El servidor manda en todo; el frontend sólo muestra y manda lo que se escribe
  (borrador cada 350 ms y el final al cortar la ronda). Reloj con `multi/clock.ts` (corrige la diferencia con el
  reloj del servidor).
  - `/create-room` → `POST /rooms` → `/room-code` (código real) → `/room/:code`.
  - `/room/:code` (`pages/Room.tsx`) muestra el lobby o la partida (`pages/GameMulti.tsx`) según la fase: recargar
    vuelve a donde estabas. `/game-multi/:code` redirige ahí. Si te vas de la pantalla, se avisa `room:leave`.
  - Pública: `/public-setup` (temática y tamaño) → `/public-queue` (cola) → `queue:matched` → `/room/:code`.
  - Estilos compartidos en `multi/MultiShell.tsx`.
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

## Variables de entorno

- `VITE_API_URL`: URL del backend (default `http://localhost:3000`)
- `VITE_WS_URL`: URL de WebSocket
- `VITE_GOOGLE_CLIENT_ID`: Client ID de Google (opcional). Ver `.env.example`.
- `.env.production` tiene las URLs de Render (son públicas, no secretos).

## Reglas para trabajar

- El frontend no calcula puntajes, rankings ni valida respuestas: sólo muestra lo que dice el backend
  (ver `docs/RULES.md` del backend).
- Trabajar en una rama y abrir PR contra `main`.
