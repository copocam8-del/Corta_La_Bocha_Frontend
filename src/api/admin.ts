import api from './axios';

// Panel de administración (backend: /admin/*, sólo lectura). El backend decide quién entra
// (ADMIN_EMAILS): si no sos admin responde 404. Acá sólo se muestran los datos.

export type PeriodoAdmin = 'hoy' | '7d' | '30d' | 'todo';

export const PERIODOS_ADMIN: { id: PeriodoAdmin; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'todo', label: 'Todo' },
];

export interface DiaCantidad {
  dia: string; // AAAA-MM-DD (hora argentina)
  cantidad: number;
}

export interface AdminUsuarios {
  periodo: PeriodoAdmin;
  total: number;
  nuevos: number;
  conGoogle: number;
  conContrasena: number;
  nuevosPorDia: DiaCantidad[];
  activos: { hoy: number; semana: number; mes: number };
  ultimosRegistros: { username: string; email: string | null; creado: string; conGoogle: boolean }[];
}

export interface PorJuego {
  total: number;
  solo: number;
  multijugador: number;
  abandonadas: number;
}

export interface AdminPartidas {
  periodo: PeriodoAdmin;
  total: number;
  solo: number;
  multijugador: number;
  abandonadas: number;
  abandonosMultijugador: number;
  porJuego: Record<string, PorJuego>;
  porDia: { dia: string; total: number; juegos: Record<string, number> }[];
  enVivo: { salas: number; jugando: number; conectados: number; enCola: number; porJuego: Record<string, { salas: number; jugando: number; conectados: number }> };
  top: { username: string; puntos: number; partidas: number; ganadas: number }[];
}

export interface AdminIa {
  periodo: PeriodoAdmin;
  proveedor: string;
  modelo: string | null;
  configurado: boolean;
  partidasValidadas: number;
  partidasSinValidar: number;
  porcentajeSinValidar: number;
  respuestasEvaluadas: number;
  porcentajeValidas: number;
  gastoEstimadoUsd: number;
  notaGasto: string;
}

export interface ItemContenido {
  id: string;
  texto: string;
  veces: number;
  porcentaje: number;
}

export interface AdminContenido {
  periodo: PeriodoAdmin;
  minimoVeces: number;
  trivia: { masFalladas: ItemContenido[]; masAcertadas: ItemContenido[] };
  ahorcado: ItemContenido[];
  sopa: { id: string; nombre: string; cantidad: number }[];
  memotest: { id: string; nombre: string; cantidad: number }[];
  letras: { letra: string; cantidad: number }[];
  sinDatos: string[];
}

// Usuarios existentes cuyo nombre no pasaría el filtro de malas palabras (no depende del período)
export interface AdminNombres {
  revisados: number;
  nombres: { username: string; creado: string; motivo: 'ofensivo' | 'reservado' }[];
}

// ¿Mostrar el panel? Sólo si /users/me dice isAdmin: true (el backend igual lo controla en /admin)
export const esAdmin = (perfil: { isAdmin?: boolean } | null | undefined) => perfil?.isAdmin === true;

const get = <T,>(ruta: string, periodo: PeriodoAdmin) => api.get<T>(`/admin/${ruta}`, { params: { periodo } }).then((r) => r.data);

export const getAdminUsuarios = (p: PeriodoAdmin) => get<AdminUsuarios>('usuarios', p);
export const getAdminPartidas = (p: PeriodoAdmin) => get<AdminPartidas>('partidas', p);
export const getAdminIa = (p: PeriodoAdmin) => get<AdminIa>('ia', p);
export const getAdminContenido = (p: PeriodoAdmin) => get<AdminContenido>('contenido', p);
export const getAdminNombres = () => api.get<AdminNombres>('/admin/nombres').then((r) => r.data);
