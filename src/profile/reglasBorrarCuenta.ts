import { isAxiosError } from 'axios';
import { parseAuthError } from '../auth/apiErrors';

// Reglas de "Borrar mi cuenta" (la pantalla está en BorrarCuenta.tsx)

// Qué mostrar si no se pudo borrar (el backend manda el motivo en español)
export function errorAlBorrar(err: unknown): string {
  if (isAxiosError(err) && err.response && [400, 401].includes(err.response.status)) {
    const data = err.response.data as { message?: unknown; errors?: Record<string, string[]> } | undefined;
    const porCampo = data?.errors && Object.values(data.errors)[0]?.[0];
    if (porCampo) return porCampo;
    if (typeof data?.message === 'string' && data.message !== 'Unauthorized') return data.message;
  }
  return parseAuthError(err).message || 'No se pudo borrar la cuenta. Probá de nuevo.';
}

// "Borrar para siempre" se activa cuando está completo. Con contraseña: que la haya escrito. Con Google: que el nombre
// coincida (sin importar mayúsculas ni espacios), como en el backend
export function confirmacionCompleta(tieneContrasena: boolean, username: string, valor: string) {
  return tieneContrasena ? valor.length > 0 : valor.trim().toLowerCase() === username.toLowerCase();
}

// Lo que se manda a DELETE /users/me
export function cuerpoBorrar(tieneContrasena: boolean, valor: string) {
  return tieneContrasena ? { password: valor } : { confirmacion: valor.trim() };
}
