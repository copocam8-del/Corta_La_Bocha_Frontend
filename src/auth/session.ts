// Manejo de la sesión guardada en localStorage (token JWT + datos del usuario)

const SESSION_KEYS = ['token', 'username', 'name'];

export function getToken(): string | null {
  return localStorage.getItem('token');
}

// Guarda la respuesta de un login exitoso (POST /auth/login o /auth/google)
export function saveSession(data: { access_token: string; username?: string | null; name?: string | null }) {
  localStorage.setItem('token', data.access_token);
  if (data.username) localStorage.setItem('username', data.username);
  if (data.name) localStorage.setItem('name', data.name);
}

export function clearSession() {
  SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
}

// Lee el campo "exp" del JWT (segundos desde 1970). No verifica la firma: eso lo hace el backend.
// Sólo sirve para no mostrar pantallas protegidas con un token que ya sabemos vencido.
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(base64));
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

// Id del usuario logueado (campo "sub" del JWT). Sólo para mostrar cosas como "vos" en el ranking.
export function getTokenUserId(token: string | null = getToken()): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { sub } = JSON.parse(atob(payload));
    return typeof sub === 'string' ? sub : null;
  } catch {
    return null;
  }
}

// Un token que no se puede leer o que no tiene "exp" se considera vencido
export function isTokenExpired(token: string, now = Date.now()): boolean {
  const exp = getTokenExpiration(token);
  return exp === null || exp * 1000 <= now;
}

export function hasValidSession(): boolean {
  const token = getToken();
  return !!token && !isTokenExpired(token);
}
