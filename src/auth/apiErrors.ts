import { isAxiosError } from 'axios';
import type { FieldErrors } from './rules';

export interface ParsedApiError {
  fieldErrors: FieldErrors; // errores para mostrar debajo de cada input
  message: string; // error general para mostrar arriba del formulario ('' si no hay)
}

const NETWORK_ERROR =
  'No se pudo conectar con el servidor. Puede estar iniciando (Render free tier tarda ~30-60s en despertar): probá de nuevo en unos segundos.';

// Traduce la respuesta de error del backend a errores por campo + un mensaje general.
// El backend de /auth responde 400 con { message, errors: { campo: ['...'] } } y 409 con { message }.
export function parseAuthError(err: unknown): ParsedApiError {
  if (!isAxiosError(err)) return { fieldErrors: {}, message: 'Ocurrió un error inesperado.' };
  if (!err.response) return { fieldErrors: {}, message: NETWORK_ERROR };

  const { status, data } = err.response;
  const backendMessage: unknown = data?.message;

  if (status === 400 && data?.errors && typeof data.errors === 'object') {
    const fieldErrors: FieldErrors = {};
    for (const [field, msgs] of Object.entries(data.errors as Record<string, string[]>)) {
      if (Array.isArray(msgs) && msgs.length) fieldErrors[field] = msgs[0];
    }
    return { fieldErrors, message: '' };
  }

  if (status === 401) return { fieldErrors: {}, message: 'Email o contraseña incorrectos' };

  if (status === 409) {
    const msg = typeof backendMessage === 'string' ? backendMessage : '';
    if (/usuario/i.test(msg)) return { fieldErrors: { username: 'Ese nombre de usuario ya está en uso' }, message: '' };
    if (/email/i.test(msg)) return { fieldErrors: { email: 'Ya hay una cuenta con ese email' }, message: '' };
    return { fieldErrors: {}, message: msg || 'Ese usuario ya existe' };
  }

  if (status >= 500) return { fieldErrors: {}, message: 'El servidor tuvo un problema. Probá de nuevo en un rato.' };

  if (typeof backendMessage === 'string') return { fieldErrors: {}, message: backendMessage };
  return { fieldErrors: {}, message: `Error del servidor (${status})` };
}
