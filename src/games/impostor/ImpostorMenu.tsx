import { useNavigate } from 'react-router-dom';
import { ChevronRight, Smartphone, Wifi } from 'lucide-react';
import { menuOnlinePath, MULTI_CONFIG } from '../multiConfig';
import { CELESTE, COMO_JUGAR_EN_PERSONA, VERDE } from './estilo';
import { Hinchas, PantallaImpostor } from './ImpostorUI';

// Menú de El Impostor (/juego/impostor): "¿Cómo juegan?" → En persona (un solo celular) u Online (el menú de
// siempre con salas, en /juego/impostor/online). Dos tarjetas grandes con el estilo de las pantallas del Impostor.
export default function ImpostorMenu() {
  const navigate = useNavigate();
  const enPersona = MULTI_CONFIG.impostor.enPersona!;
  const tarjetas = [
    { id: 'modo-en-persona', titulo: 'En persona', texto: enPersona.descripcion, Icono: Smartphone, color: VERDE, ir: enPersona.path },
    { id: 'modo-online', titulo: 'Online', texto: 'Cada uno desde su casa', Icono: Wifi, color: CELESTE, ir: menuOnlinePath('impostor') },
  ];
  return (
    <PantallaImpostor salir={{ to: '/dashboard' }} ayuda={COMO_JUGAR_EN_PERSONA}>
      <div className="imp-entra" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Hinchas />
        <h1 className="imp-titulo">El Impostor</h1>
        <p className="imp-texto">¿Cómo juegan?</p>
      </div>
      {tarjetas.map(({ id, titulo, texto, Icono, color, ir }) => (
        <button key={id} type="button" className="imp-bloque imp-entra" data-testid={id} onClick={() => navigate(ir)}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', minHeight: '112px', cursor: 'pointer', color: 'inherit', textAlign: 'left', font: 'inherit' }}>
          <span style={{ width: 64, height: 64, borderRadius: '20px', background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icono size={32} />
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: "'Oswald', sans-serif", fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', color }}>{titulo}</span>
            <span style={{ display: 'block', fontSize: '15px', color: 'rgba(225,255,236,0.75)', marginTop: '2px' }}>{texto}</span>
          </span>
          <ChevronRight size={24} color="rgba(225,255,236,0.5)" />
        </button>
      ))}
    </PantallaImpostor>
  );
}
