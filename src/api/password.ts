import api from './axios';

// Recuperar contraseña. El backend responde siempre lo mismo al pedir el link (no revela quién tiene cuenta).

export const pedirLinkRecuperacion = (email: string) =>
  api.post<{ message: string }>('/auth/forgot-password', { email }).then((r) => r.data);

export const restablecerContrasena = (token: string, password: string) =>
  api.post<{ message: string }>('/auth/reset-password', { token, password }).then((r) => r.data);
