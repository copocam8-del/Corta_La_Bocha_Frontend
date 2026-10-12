// Configuración del espacio de publicidad. APAGADO salvo que VITE_ADS_ENABLED sea exactamente "true".
// No hay ninguna red de anuncios integrada: ver docs/PUBLICIDAD.md antes de activarlo.

export function adsEnabled(env: Record<string, unknown> = import.meta.env as Record<string, unknown>): boolean {
  return env.VITE_ADS_ENABLED === 'true';
}

// Dónde puede aparecer (siempre ENTRE partidas, nunca en medio de una ronda)
export type AdPlacement = 'resultado' | 'seleccion-juegos';
