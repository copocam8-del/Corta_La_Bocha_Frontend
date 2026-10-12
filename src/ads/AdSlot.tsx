import { adsEnabled, type AdPlacement } from './ads';

// Espacio reservado para un anuncio no intrusivo ENTRE partidas (pantallas de resultado y de selección
// de juegos). Con VITE_ADS_ENABLED distinto de "true" no dibuja nada (no ocupa lugar ni carga nada).
// Todavía no hay red de anuncios: cuando se elija una, el anuncio va adentro de este recuadro
// (ver docs/PUBLICIDAD.md: edad mínima 13 años, consentimiento y políticas de privacidad y cookies).
export default function AdSlot({ placement, enabled = adsEnabled() }: { placement: AdPlacement; enabled?: boolean }) {
  if (!enabled) return null;
  return (
    <aside
      aria-label="Publicidad"
      data-testid={`publicidad-${placement}`}
      style={{
        margin: '12px auto 0', width: '100%', maxWidth: '336px', minHeight: '100px', borderRadius: '10px',
        border: '1px dashed rgba(180,255,205,0.25)', background: 'rgba(4,20,11,0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
        color: 'rgba(180,255,205,0.45)', fontSize: '11px',
      }}
    >
      <span style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '9px' }}>Publicidad</span>
      {/* Acá va el anuncio de la red elegida (no integrado todavía) */}
    </aside>
  );
}
