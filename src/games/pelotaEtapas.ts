// Cuánto se aplasta y se apaga "la redonda" según los errores (0 = inflada, max = murió la redonda)
export function etapaPelota(errores: number, max: number) {
  const s = Math.min(1, Math.max(0, errores / max));
  return {
    scaleX: 1 + 0.35 * s,
    scaleY: 1 - 0.62 * s,
    // de blanco a gris
    color: `rgb(${Math.round(245 - 90 * s)}, ${Math.round(245 - 85 * s)}, ${Math.round(245 - 70 * s)})`,
    brillo: 1 - 0.8 * s,
    muerta: errores >= max,
  };
}
