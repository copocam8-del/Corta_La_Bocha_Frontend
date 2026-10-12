import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import GameResult from '../games/GameResult';
import QuestionCard from '../games/QuestionCard';
import { secondsLeft } from '../game/round';
import { useNow } from '../multi/useNow';
import {
  CATEGORIAS_TRIVIA, empezarTrivia, responderTrivia,
  type DificultadTrivia, type PreguntaTrivia, type RespuestaTrivia,
} from '../api/trivia';

// Trivia futbolera: 10 preguntas de 4 opciones, 20 segundos cada una. El servidor corrige y mide el
// tiempo (el reloj de acá es sólo para mostrar).

const PAUSA_MS = 1300; // cuánto se ve la respuesta correcta antes de la siguiente pregunta

const mensajeError = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo conectar con el servidor. Probá de nuevo.';

export default function Trivia() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState('');
  const [dificultad, setDificultad] = useState<DificultadTrivia | ''>('');
  const [matchId, setMatchId] = useState<string | null>(null);
  const [total, setTotal] = useState(10);
  const [pregunta, setPregunta] = useState<PreguntaTrivia | null>(null);
  const [elegida, setElegida] = useState<number | null>(null);
  const [revelada, setRevelada] = useState<{ correcta: number } | null>(null);
  const [marcador, setMarcador] = useState({ puntos: 0, aciertos: 0 });
  const [final, setFinal] = useState<RespuestaTrivia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [finPregunta, setFinPregunta] = useState(0);
  const enviando = useRef(false);
  const now = useNow(!!pregunta && !revelada);

  const empezar = async () => {
    setCargando(true);
    setError(null);
    setFinal(null);
    try {
      const r = await empezarTrivia({ categoria: categoria || undefined, dificultad: dificultad || undefined });
      setMatchId(r.matchId);
      setTotal(r.total);
      setMarcador({ puntos: 0, aciertos: 0 });
      mostrar(r.pregunta);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  const mostrar = (p: PreguntaTrivia) => {
    setPregunta(p);
    setElegida(null);
    setRevelada(null);
    setFinPregunta(Date.now() + p.segundos * 1000);
    enviando.current = false;
  };

  const responder = useCallback(async (opcion: number | null) => {
    if (!matchId || enviando.current) return;
    enviando.current = true;
    setElegida(opcion);
    try {
      const r = await responderTrivia(matchId, opcion);
      setRevelada({ correcta: r.opcionCorrecta });
      setMarcador({ puntos: r.puntos, aciertos: r.aciertos });
      setTimeout(() => {
        if (r.terminada) {
          setPregunta(null);
          setFinal(r);
        } else if (r.pregunta) {
          mostrar(r.pregunta);
        }
      }, PAUSA_MS);
    } catch (e) {
      setError(mensajeError(e));
      enviando.current = false;
    }
  }, [matchId]);

  // Se acabó el tiempo: se manda "sin respuesta"
  // (con tope en la duración: justo al cambiar de pregunta "now" puede ser de hace un instante)
  const restantes = pregunta ? Math.min(pregunta.segundos, secondsLeft(finPregunta, now)) : 0;
  useEffect(() => {
    if (!pregunta || revelada) return;
    const t = setTimeout(() => void responder(null), Math.max(0, finPregunta - Date.now()));
    return () => clearTimeout(t);
  }, [pregunta, revelada, finPregunta, responder]);

  if (final) {
    return (
      <MultiShell maxWidth={520}>
        <GameResult
          titulo={final.gano ? '¡Aprobaste!' : 'Te faltó un poco'}
          gano={!!final.gano}
          puntos={final.puntos}
          logros={final.logros}
          onJugarOtra={() => { setFinal(null); setMatchId(null); }}
        >
          <p data-testid="aciertos" style={{ fontSize: '14px', color: 'rgba(180,255,205,0.85)' }}>
            {final.aciertos} de {final.total} correctas · {final.promedioSegundos} s promedio
          </p>
        </GameResult>
      </MultiShell>
    );
  }

  if (!matchId || !pregunta) {
    return (
      <MultiShell maxWidth={480}>
        <button className="ghost-btn" style={{ width: 'auto', alignSelf: 'flex-start' }} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Juegos
        </button>
        <div style={{ textAlign: 'center' }}>
          <p className="kicker">Trivia futbolera</p>
          <h1 className="neon-title" style={{ fontSize: '28px', marginTop: '6px' }}>¿Cuánto sabés?</h1>
          <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.7)', marginTop: '8px' }}>
            10 preguntas, 20 segundos cada una. Sumás por acertar y más si contestás rápido. Con 6 aciertos aprobás.
          </p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p className="section-label">Categoría</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['', ...CATEGORIAS_TRIVIA].map((c) => (
                <button key={c || 'todas'} className={`option-btn${categoria === c ? ' active' : ''}`} style={{ flex: 'none' }} onClick={() => setCategoria(c)}>
                  {c || 'Todas'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label">Dificultad</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {([['', 'Mezcla'], ['facil', 'Fácil'], ['medio', 'Medio'], ['dificil', 'Difícil']] as const).map(([id, label]) => (
                <button key={id || 'mezcla'} className={`option-btn${dificultad === id ? ' active' : ''}`} onClick={() => setDificultad(id)}>{label}</button>
              ))}
            </div>
          </div>
          <button className="main-btn" data-testid="empezar" disabled={cargando} onClick={() => void empezar()}>¡Arrancar!</button>
        </div>
        {error && <div className="error">{error}</div>}
      </MultiShell>
    );
  }

  return (
    <MultiShell maxWidth={560}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="kicker">Pregunta {pregunta.numero} de {total}</span>
        <span className="kicker" data-testid="marcador-trivia">{marcador.aciertos} ✓ · {marcador.puntos} pts</span>
      </div>
      <QuestionCard
        pregunta={pregunta}
        segundosRestantes={revelada ? 0 : restantes}
        elegida={elegida}
        revelada={revelada}
        bloqueada={!!revelada || elegida !== null}
        onElegir={(i) => void responder(i)}
      />
      {revelada && (
        <p role="status" style={{ textAlign: 'center', fontSize: '14px', color: elegida === revelada.correcta ? '#39ff8c' : '#fca5a5' }}>
          {elegida === null ? '¡Se acabó el tiempo!' : elegida === revelada.correcta ? '¡Correcto!' : 'No era esa.'}
        </p>
      )}
      {error && <div className="error">{error}</div>}
    </MultiShell>
  );
}
