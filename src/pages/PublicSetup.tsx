import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Shapes, Users } from 'lucide-react';

import { TEMATICAS_MULTI as TEMATICAS } from '../multi/types';
import { gameIcon, gameName } from '../games/gameIcons';
import { isMultiGame, menuOnlinePath, menuPath, MULTI_CONFIG } from '../games/multiConfig';
import { comoJugarDe } from '../games/comoJugar';
import { AjusteElegible, Encabezado, PantallaJuego } from '../games/ui/JuegoUI';

const CANTIDADES = [
  { id: 'pocos',  label: 'Pocos',  desc: '2 a 4 jugadores' },
  { id: 'muchos', label: 'Muchos', desc: '5 a 8 jugadores' },
];

// Partida pública (/juego/:game/publica): elegís el tamaño (y en Tutti Frutti, la temática) y la
// cola arma la partida sola. Los demás juegos tienen una configuración pública fija.
export default function PublicSetup() {
  const navigate = useNavigate();
  const { game: param } = useParams<{ game: string }>();
  const game = isMultiGame(param) ? param : 'tutti_frutti';
  const publica = MULTI_CONFIG[game].publica;
  const [tematica,   setTematica]   = useState('general');
  const [cantidad,   setCantidad]   = useState('pocos');

  const handleBuscar = () => {
    navigate(`${menuPath(game)}/buscando`, { state: { game, tematica: publica.eligeTematica ? tematica : '', size: cantidad } });
  };

  const cantidades = CANTIDADES.filter(c => publica.tamanos.includes(c.id as 'pocos' | 'muchos'))
    .map(c => ({ id: c.id, label: c.label, sub: publica.rangos?.[c.id as 'pocos' | 'muchos'] ?? c.desc }));

  return (
    <PantallaJuego
      salir={{ to: menuOnlinePath(game) }}
      ayuda={comoJugarDe(game)}
      barra={
        <button className="ui-boton" data-testid="buscar-partida" onClick={handleBuscar}>
          Buscar partida
          <ChevronRight size={20} strokeWidth={2.5}/>
        </button>
      }
    >
      <Encabezado icono={gameIcon(game)} kicker={`Partida pública · ${gameName(game)}`} titulo="Buscar partida" texto="Configurá cómo querés jugar" />

      <div className="card ui-filas">
        {/* Temática (sólo Tutti Frutti) */}
        {publica.eligeTematica && (
          <AjusteElegible icono={Shapes} titulo="Temática" opciones={TEMATICAS} valor={tematica} onElegir={setTematica} />
        )}
        <AjusteElegible icono={Users} titulo="Jugadores" opciones={cantidades} valor={cantidad} onElegir={setCantidad}
          testid="ajuste-cantidad" />
        <p className="ui-fila-sub" style={{ padding: '0 4px', lineHeight: 1.45 }}>{publica.descripcion}</p>
      </div>
    </PantallaJuego>
  );
}
