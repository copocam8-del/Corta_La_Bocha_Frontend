// Frases futboleras que van rotando arriba de algunas pantallas (en lugar del viejo cartel con el año de la temporada).
// Para sumar una, agregala acá.
export const FRASES = [
  'Prohibido tirar centros de mierda',
  'Hoy te convertís en héroe',
  'Me cortaron las piernas',
  '¿Qué mirás, bobo?',
  'Marteeeeeeeeen',
  '¿Para qué te traje?',
  'Pisala, pomelo',
  'La mafia a colocaaaar',
  'Tatán tataán',
  'Dale, definí',
  'Yo a la noche no tengo sueño',
  'Come pasto, burro',
  'Fallllllta',
];

export const FRASE_MS = 4000; // cada cuánto cambia

// Siguiente frase. Se recuerda por dónde iba, así al cambiar de pantalla no vuelve a la primera.
let actual = 0;
export function siguienteFrase(desde: number = actual) {
  actual = (desde + 1) % FRASES.length;
  return actual;
}
export const fraseActual = () => actual;
