import axios from 'axios';
import { clearSession, getToken } from '../auth/session';
import { CONTRASENA_INCORRECTA } from '../auth/apiErrors';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401 a un pedido que llevaba token, la sesión venció o es inválida:
// la borramos y mandamos a /login?expired=1. En /auth/login un 401 sólo significa
// "contraseña incorrecta", así que ahí no redirigimos. Lo mismo al borrar la cuenta con la contraseña equivocada.
export function esSesionVencida(error: { config?: { url?: string; method?: string }; response?: { status?: number; data?: { message?: unknown } } }) {
  const url = error.config?.url ?? '';
  const isLoginRequest = url.includes('/auth/login');
  const contrasenaMalAlBorrar =
    url.endsWith('/users/me') && error.config?.method?.toLowerCase() === 'delete' && error.response?.data?.message === CONTRASENA_INCORRECTA;
  return error.response?.status === 401 && !isLoginRequest && !contrasenaMalAlBorrar;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (esSesionVencida(error) && getToken()) {
      clearSession();
      window.location.assign('/login?expired=1');
    }
    return Promise.reject(error);
  },
);

export default api;
