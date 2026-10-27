import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { createRoom } from '../api/rooms';
import { gameIcon, gameName } from '../games/gameIcons';
import { isMultiGame, menuOnlinePath, menuPath, MULTI_CONFIG } from '../games/multiConfig';
import { comoJugarDe } from '../games/comoJugar';
import { Encabezado, PantallaJuego } from '../games/ui/JuegoUI';
import AjustesSala from '../multi/AjustesSala';

// Crear sala privada de cualquier juego (/juego/:game/crear-sala): el servidor la crea y devuelve
// el código. El anfitrión elige las opciones del juego (temática, dificultad, rondas y tiempo) en una
// lista de ajustes; en Tutti Frutti no hay dificultad porque en multijugador no juega la máquina.
export default function CreateRoom() {
  const navigate = useNavigate();
  const { game: param } = useParams<{ game: string }>();
  const game = isMultiGame(param) ? param : 'tutti_frutti';
  const config = MULTI_CONFIG[game];
  const [tematica, setTematica]     = useState(config.defaults.tematica);
  const [dificultad, setDificultad] = useState(config.defaults.dificultad);
  const [rondas, setRondas]         = useState(config.defaults.rounds);
  const [tiempo, setTiempo]         = useState(config.defaults.seconds);
  const [creando, setCreando]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleContinuar = async () => {
    setCreando(true);
    setError(null);
    try {
      const { code } = await createRoom({ game, tematica, rounds: rondas, seconds: tiempo, ...(dificultad ? { dificultad } : {}) });
      navigate(`${menuPath(game)}/codigo`, { state: { code } });
    } catch {
      setError('No se pudo crear la sala. Revisá tu conexión y probá de nuevo.');
      setCreando(false);
    }
  };

  return (
    <PantallaJuego
      salir={{ to: menuOnlinePath(game) }}
      ayuda={comoJugarDe(game)}
      barra={
        <button className="ui-boton" data-testid="crear-sala" onClick={() => void handleContinuar()} disabled={creando}>
          {creando ? 'Creando sala…' : 'Crear sala'}
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      }
    >
      <Encabezado icono={gameIcon(game)} kicker={`Sala privada · ${gameName(game)}`} titulo="Crear sala" texto="Configurá la partida" />

      <div className="card ui-filas" data-testid="ajustes-sala">
        <AjustesSala
          config={config}
          ajustes={{ tematica, dificultad, rounds: rondas, seconds: tiempo }}
          onCambiar={(c) => {
            if (c.tematica !== undefined) setTematica(c.tematica);
            if (c.dificultad !== undefined) setDificultad(c.dificultad);
            if (c.rounds !== undefined) setRondas(c.rounds);
            if (c.seconds !== undefined) setTiempo(c.seconds);
          }}
        />
      </div>

      {error && <p className="error" role="alert">{error}</p>}
    </PantallaJuego>
  );
}
