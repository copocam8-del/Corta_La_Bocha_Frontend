// Reglas de la ronda que se usan en la pantalla de juego (el servidor las vuelve a controlar).

// Segundos que quedan hasta la hora de fin. Se calcula contra el reloj (no restando de a 1)
// para que no se atrase cuando el navegador frena una pestaña en segundo plano.
export function secondsLeft(deadlineMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

// Categorías sin responder. Para cantar ¡Basta! tienen que estar todas completas.
export function missingCategories(categories: string[], answers: Record<string, string | undefined>): string[] {
  return categories.filter((c) => !answers[c]?.trim());
}
