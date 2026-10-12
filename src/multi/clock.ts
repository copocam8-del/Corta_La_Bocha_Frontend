// El reloj de la ronda lo maneja el servidor: manda la hora de fin (endsAt) y su hora actual
// (serverNow). Con eso corregimos la diferencia entre el reloj de la compu y el del servidor.

// Cuánto hay que sumarle a Date.now() para tener la hora del servidor
export function clockOffset(serverNow: number, localNow: number): number {
  return serverNow - localNow;
}

// Segundos que faltan hasta "serverTime" (hora del servidor), vistos desde este navegador
export function secondsUntil(serverTime: number | null, offset: number, localNow: number): number {
  if (serverTime === null) return 0;
  return Math.max(0, Math.ceil((serverTime - (localNow + offset)) / 1000));
}
