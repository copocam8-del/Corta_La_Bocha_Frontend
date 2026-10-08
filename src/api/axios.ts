import axios from 'axios';
import { clearSession, getToken } from '../auth/session';

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
// "contraseña incorrecta", así que ahí no redirigimos.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest && getToken()) {
      clearSession();
      window.location.assign('/login?expired=1');
    }
    return Promise.reject(error);
  },
);

export default api;
