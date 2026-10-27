import api from '../api/axios';

// Términos y Política de privacidad: todos los usuarios tienen que aceptar la versión vigente (la decide el backend,
// src/legal/terminos.ts → TERMS_VERSION). GET /users/me dice si falta (terminosPendientes) y cuál es la versión
// (terminosVersion); la pantalla de ProtectedRoute la manda tal cual a POST /users/me/aceptar-terminos.

export interface EstadoTerminos {
  pendientes: boolean;
  version: string;
}

export const consultarTerminos = () =>
  api.get<{ terminosPendientes?: boolean; terminosVersion?: string }>('/users/me').then((r) => ({
    pendientes: r.data.terminosPendientes === true,
    version: r.data.terminosVersion ?? '',
  }));

export const aceptarTerminos = (version: string) => api.post('/users/me/aceptar-terminos', { version }).then((r) => r.data);

// Para no preguntar en cada pantalla: el token con el que ya sabemos que están aceptados. Otro login (otro token)
// vuelve a preguntar. Vive en memoria: al recargar la página se pregunta de nuevo (una vez).
let alDiaPara: string | null = null;
export const terminosAlDia = (token: string) => alDiaPara === token;
export const marcarTerminosAlDia = (token: string | null) => {
  alDiaPara = token;
};
