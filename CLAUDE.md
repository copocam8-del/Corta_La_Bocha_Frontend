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
  api/tuttiFrutti.ts         validación de rondas
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

## Páginas legales

- `/privacidad`, `/terminos` y `/cookies` (en `src/pages/legal/`, públicas). Usan `components/LegalLayout.tsx`.
- Los datos que faltan completar están marcados con `<Falta>…</Falta>` (se ven resaltados en amarillo).
- Si la app empieza a guardar un dato nuevo o a usar otro proveedor, **actualizá la Política de privacidad**
  (y la fecha `LEGAL_LAST_UPDATE`).
- El registro exige aceptar Términos y Privacidad (casilla obligatoria, consentimiento de la Ley 25.326).

## Variables de entorno

- `VITE_API_URL`: URL del backend (default `http://localhost:3000`)
- `VITE_WS_URL`: URL de WebSocket
- `.env.production` tiene las URLs de Render (son públicas, no secretos).

## Reglas para trabajar

- El frontend no calcula puntajes, rankings ni valida respuestas: sólo muestra lo que dice el backend
  (ver `docs/RULES.md` del backend).
- Trabajar en una rama y abrir PR contra `main`.
