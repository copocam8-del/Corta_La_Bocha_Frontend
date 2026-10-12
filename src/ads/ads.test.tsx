import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import AdSlot from './AdSlot';
import { adsEnabled } from './ads';

describe('espacio de publicidad', () => {
  it('está apagado salvo que VITE_ADS_ENABLED sea "true"', () => {
    expect(adsEnabled({})).toBe(false);
    expect(adsEnabled({ VITE_ADS_ENABLED: 'false' })).toBe(false);
    expect(adsEnabled({ VITE_ADS_ENABLED: '1' })).toBe(false);
    expect(adsEnabled({ VITE_ADS_ENABLED: 'true' })).toBe(true);
  });

  it('apagado no dibuja nada; prendido muestra un recuadro marcado como publicidad', () => {
    expect(renderToStaticMarkup(<AdSlot placement="resultado" enabled={false} />)).toBe('');
    const html = renderToStaticMarkup(<AdSlot placement="resultado" enabled />);
    expect(html).toContain('aria-label="Publicidad"');
    expect(html).toContain('publicidad-resultado');
  });

  it('por defecto (sin variable) está apagado', () => {
    expect(renderToStaticMarkup(<AdSlot placement="seleccion-juegos" />)).toBe('');
  });
});
