import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FraseRotativa from '../components/FraseRotativa';
import { CircleDot, Gauge, Shapes, Timer, Type } from 'lucide-react';
import { comoJugarDe } from '../games/comoJugar';
import { AjusteElegible, Encabezado, PantallaJuego } from '../games/ui/JuegoUI';

// Configuración de la partida solo de Tutti Frutti (contra la IA), como lista de ajustes. Temática y dificultad
// arrancan sin elegir: "¡Jugar!" se habilita cuando están las dos.

const TEMATICAS = [
  { id: 'general', label: 'General' },
  { id: 'liga_argentina', label: 'Liga Argentina' },
  { id: 'mundial', label: 'Mundial' },
  { id: 'champions', label: 'Champions League' },
  { id: 'libertadores', label: 'Copa Libertadores' },
];

const DIFICULTADES = [
  { id: 'facil', label: 'Fácil', sub: 'La IA responde lento y comete errores' },
  { id: 'medio', label: 'Medio', sub: 'Buen nivel y velocidad equilibrada' },
  { id: 'dificil', label: 'Difícil', sub: 'La IA es precisa y rápida' },
  { id: 'experto', label: 'Experto', sub: 'La IA es casi imbatible' },
];

const TIEMPOS = [
  { id: '60', label: '60 s' },
  { id: '120', label: '2 min' },
];

export default function GameSetup() {
  const [tematica, setTematica] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [tiempo, setTiempo] = useState(60);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!tematica || !dificultad) return;
    navigate('/game', { state: { tematica, dificultad, tiempo } });
  };

  const falta = !tematica && !dificultad ? 'Elegí la temática y la dificultad.' : !tematica ? 'Elegí la temática.' : !dificultad ? 'Elegí la dificultad.' : null;

  return (
    <PantallaJuego
      salir={{ to: '/juego/tutti_frutti' }}
      ayuda={comoJugarDe('tutti_frutti')}
      barra={
        <>
          {falta && <p className="ui-barra-nota">{falta}</p>}
          <button className="ui-boton" data-testid="jugar-solo" onClick={handleStart} disabled={!tematica || !dificultad}>
            <CircleDot size={20} strokeWidth={2} />
            ¡Jugar!
          </button>
        </>
      }
    >
      <Encabezado
        icono={Type}
        kicker={<FraseRotativa style={{ fontSize: '11px', letterSpacing: '3px', fontWeight: 500, color: '#7CFFB2', textTransform: 'uppercase' }} />}
        titulo="Nueva partida"
        texto="Modo contra la IA"
      />

      <div className="card ui-filas" data-testid="ajustes-solo">
        <AjusteElegible icono={Shapes} titulo="Temática" opciones={TEMATICAS} valor={tematica} onElegir={setTematica} testid="ajuste-tematica" />
        <AjusteElegible icono={Gauge} titulo="Dificultad" opciones={DIFICULTADES} valor={dificultad} onElegir={setDificultad} testid="ajuste-dificultad" />
        <AjusteElegible icono={Timer} titulo="Tiempo por ronda" opciones={TIEMPOS} valor={String(tiempo)} onElegir={(t) => setTiempo(Number(t))} />
      </div>
    </PantallaJuego>
  );
}
