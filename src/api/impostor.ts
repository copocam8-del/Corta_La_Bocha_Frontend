import api from './axios';

// El Impostor "En persona": el backend sólo da una palabra por ronda (las que no viste primero).
// El resto del juego corre en el navegador y no cuenta para estadísticas ni logros.

export interface PalabraEnPersona {
  texto: string;
  categoria: string; // "Jugador", "Equipo", "Selección", "Estadio" o "DT"
}

export const pedirPalabrasEnPersona = (tematica: string, rondas: number) =>
  api.post<{ palabras: PalabraEnPersona[] }>('/impostor/local', { tematica, rondas }).then((r) => r.data.palabras);
