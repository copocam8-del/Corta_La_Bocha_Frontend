import { contieneOfensivo, MENSAJE_ADIVINANZA, MENSAJE_PISTA } from '../../moderacion/filtro';

// El Impostor: aviso antes de mandar una pista o una adivinanza ofensiva, con el mismo mensaje que el
// backend (que igual lo revisa). null = se puede mandar.
export function avisoAntesDeEnviar(type: string, payload: object): string | null {
  const texto = payload as { pista?: unknown; respuesta?: unknown };
  if (type === 'pista' && typeof texto.pista === 'string' && contieneOfensivo(texto.pista)) return MENSAJE_PISTA;
  if (type === 'adivinar' && typeof texto.respuesta === 'string' && contieneOfensivo(texto.respuesta)) return MENSAJE_ADIVINANZA;
  return null;
}
