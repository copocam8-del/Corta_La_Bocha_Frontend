import { useNavigate } from 'react-router-dom';
import { ChevronRight, Smartphone, Wifi } from 'lucide-react';
import { menuOnlinePath, MULTI_CONFIG } from '../multiConfig';
import { CELESTE, COMO_JUGAR_EN_PERSONA, VERDE } from './estilo';
import { Hinchas, PantallaImpostor } from './ImpostorUI';

// Menú de El Impostor (/juego/impostor): "¿Cómo juegan?" → En persona (un solo celular) u Online (el menú de
// siempre con salas, en /juego/impostor/online). Dos tarjetas grandes de vidrio verde, como el resto de la app.
export default function ImpostorMenu() {
  const navigate = useNavigate();
  const enPersona = MULTI_CONFIG.impostor.enPersona!;
  const tarjetas = [
    { id: 'modo-en-persona', titulo: 'En persona', texto: enPersona.descripcion, Icono: Smartphone, color: VERDE, ir: enPersona.path },
    { id: 'modo-online', titulo: 'Online', texto: 'Cada uno desde su casa', Icono: Wifi, color: CELESTE, ir: menuOnlinePath('impostor') },
  ];
  return (
    <PantallaImpostor salir={{ to: '/dashboard' }} ayuda={COMO_JUGAR_EN_PERSONA}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Hinchas />
        <h1 className="neon-title imp-titulo">El Impostor</h1>
        <p className="imp-texto">¿Cómo juegan?</p>
      </div>
      {tarjetas.map(({ id, titulo, texto, Icono, color, ir }) => (
        <button key={id} type="button" className="card imp-modo" data-testid={id} onClick={() => navigate(ir)}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', minHeight: '104px', cursor: 'pointer', color: 'inherit', textAlign: 'left', font: 'inherit' }}>
          <span style={{ width: 60, height: 60, borderRadius: '50%', background: `${color}1f`, border: `1px solid ${color}66`, boxShadow: `0 0 16px ${color}40`,
            color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icono size={28} />
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: "'Oswald', sans-serif", fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', color, textShadow: `0 0 14px ${color}66` }}>{titulo}</span>
            <span style={{ display: 'block', fontSize: '14px', color: 'rgba(180,255,205,0.75)', marginTop: '2px' }}>{texto}</span>
          </span>
          <ChevronRight size={24} color="#7CFFB2" />
        </button>
      ))}
    </PantallaImpostor>
  );
}
