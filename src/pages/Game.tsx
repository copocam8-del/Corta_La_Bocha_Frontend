import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ABANDONAR } from '../components/abandonar';
import { Bot, PenLine, Hourglass, StopCircle, Timer, Trophy, Handshake, Skull, Flame } from 'lucide-react';
import { finishQuickMatch, startQuickMatch, type QuickMatch, type QuickMatchResult } from '../api/soloMatch';
import { achievementIcon } from '../profile/achievementIcons';
import RoundResults from '../game/RoundResults';
import { missingCategories, secondsLeft } from '../game/round';
import AdSlot from '../ads/AdSlot';
import { comoJugarDe } from '../games/comoJugar';
import { PantallaJuego } from '../games/ui/JuegoUI';
import { TF_CSS } from '../game/tuttiEstilo';

// La partida se decide en el servidor: él sortea la letra, arma las respuestas de la máquina
// (según la dificultad) y al final valida tus respuestas, calcula el resultado y actualiza
// tus estadísticas. Acá sólo se muestra el juego.

export default function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tematica, dificultad, tiempo: tiempoElegido } = (location.state || {}) as {
    tematica: string; dificultad: string; tiempo: number;
  };
  const tiempo = tiempoElegido || 60;

  const [match, setMatch] = useState<QuickMatch | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(tiempo);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [iaRespuestas, setIaRespuestas] = useState<Record<string, string>>({});
  const iaBuildRef = useRef<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  // Por qué terminó la ronda: el jugador cantó ¡Basta! o se acabó el reloj
  const [finishReason, setFinishReason] = useState<'basta' | 'tiempo' | null>(null);
  const deadlineRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<QuickMatchResult | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iaTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef = useRef(false);

  const letra = match?.letter ?? '';
  const categorias = match?.categories ?? [];

  // 1) Pedirle la partida al servidor (una sola vez, aunque React monte dos veces en desarrollo)
  useEffect(() => {
    if (!tematica || startedRef.current) return;
    startedRef.current = true;
    startQuickMatch({ tematica, dificultad, tiempo })
      .then(setMatch)
      .catch(() => setStartError('No se pudo empezar la partida. Revisá tu conexión y probá de nuevo.'));
  }, [tematica, dificultad, tiempo]);

  const endRound = useCallback((reason: 'basta' | 'tiempo') => {
    clearInterval(intervalRef.current!);
    iaTimeoutRef.current.forEach(clearTimeout);
    setIaRespuestas({ ...iaBuildRef.current });
    setFinishReason(reason);
    setFinished(true);
  }, []);

  // 2) Cronómetro: arranca cuando llega la partida. Se calcula contra la hora de fin (no restando
  // de a 1 segundo) para que no se atrase si el navegador frena la pestaña en segundo plano.
  useEffect(() => {
    if (!match || finished) return;
    if (!deadlineRef.current) deadlineRef.current = Date.now() + match.roundSeconds * 1000;
    const tick = () => {
      const left = secondsLeft(deadlineRef.current, Date.now());
      setTimeLeft(left);
      if (left <= 0) endRound('tiempo');
    };
    tick();
    intervalRef.current = setInterval(tick, 250);
    return () => clearInterval(intervalRef.current!);
  }, [match, finished, endRound]);

  // 3) La máquina "escribe" según el plan que mandó el servidor (se ve el lápiz en su casilla)
  useEffect(() => {
    if (!match || finished) return;
    const timeouts = match.aiPlan
      .filter(item => item.answer)
      .map(item => setTimeout(() => {
        iaBuildRef.current = { ...iaBuildRef.current, [item.category]: item.answer! };
        setIaRespuestas({ ...iaBuildRef.current });
      }, item.delayMs));
    iaTimeoutRef.current = timeouts;
    return () => timeouts.forEach(clearTimeout);
  }, [match, finished]);

  // Como en el juego de verdad: ¡Basta! sólo con todas las categorías completas
  const faltan = missingCategories(categorias, respuestas).length;

  const handleBasta = () => {
    if (faltan > 0) return;
    endRound('basta');
  };

  // 4) Al terminar, el servidor valida y decide el resultado oficial
  const enviarResultado = useCallback(() => {
    if (!match) return;
    setIsLoading(true);
    setApiError(null);
    finishQuickMatch(
      match.matchId,
      match.categories.map(cat => ({ category: cat, answer: respuestas[cat]?.trim() || null })),
    )
      .then(res => {
        setResultado(res);
        // Las respuestas de la máquina que cuentan son las que calculó el servidor
        setIaRespuestas(res.aiAnswers);
      })
      .catch(err => {
        const status = err?.response?.status;
        const serverMessage = err?.response?.data?.message;
        setApiError(status === 409
          ? 'Esta partida ya se había terminado.'
          : (status === 400 || status === 410) && typeof serverMessage === 'string'
          ? serverMessage
          : 'No se pudo conectar con el servidor. Probá de nuevo.');
      })
      .finally(() => setIsLoading(false));
  }, [match, respuestas]);

  const sentRef = useRef(false);
  useEffect(() => {
    if (!finished || sentRef.current) return;
    sentRef.current = true;
    enviarResultado();
  }, [finished, enviarResultado]);

  const handleChange = (cat: string, val: string) => {
    if (finished) return;
    setRespuestas(r => ({ ...r, [cat]: val }));
  };

  const duracion = match?.roundSeconds ?? tiempo;
  const timerPct = ((duracion - timeLeft) / duracion) * 100;
  const timerColor = timeLeft > 30 ? '#39ff8c' : timeLeft > 10 ? '#fbbf24' : '#ef4444';
  const ayuda = comoJugarDe('tutti_frutti');

  if (!tematica) return <Navigate to={'/juego/tutti_frutti'} replace />;

  if (!match) {
    return (
      <PantallaJuego salir={{ to: '/juego/tutti_frutti' }} ayuda={ayuda}>
        <div className="card ui-centro">
          {startError ? (
            <>
              <p className="error">{startError}</p>
              <button className="ui-boton" style={{ marginTop: '12px' }} onClick={() => navigate('/juego/tutti_frutti')}>Volver al menú</button>
            </>
          ) : (
            <>
              <div className="spinner" />
              <p className="ui-texto">Preparando la partida...</p>
            </>
          )}
        </div>
      </PantallaJuego>
    );
  }

  return (
    // Volver: en medio de la ronda pregunta antes (la partida queda como abandonada = perdida)
    <PantallaJuego
      salir={{ to: '/juego/tutti_frutti', confirm: !finished ? ABANDONAR : null }}
      ayuda={ayuda}
      barra={finished ? (
        <button className="ui-boton" onClick={() => navigate('/juego/tutti_frutti')}>Volver al menú</button>
      ) : (
        <>
          {faltan > 0 && (
            <p className="ui-barra-nota">
              Para cantar ¡Basta! completá todas las categorías ({faltan === 1 ? 'falta 1' : `faltan ${faltan}`}).
            </p>
          )}
          <button className="ui-boton" data-testid="basta" onClick={handleBasta} disabled={faltan > 0}>
            <StopCircle size={20} strokeWidth={2} />
            ¡Basta!
          </button>
        </>
      )}
    >
      <style>{TF_CSS}</style>

      {/* Modo, letra y reloj */}
      <div className="tf-cabecera">
        <div>
          <p className="kicker">Modo IA · {dificultad}</p>
          <p className="tf-dato" style={{ marginTop: '2px' }}>{tematica.replace('_', ' ')}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="tf-letra" data-testid="letra">{letra}</div>
          <p className="tf-dato">Letra</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="tf-dato">Tiempo</p>
          <p className="tf-reloj" data-testid="reloj" style={{
            color: timerColor, textShadow: `0 0 18px ${timerColor}`, animation: timeLeft <= 10 ? 'timerWarn 0.5s ease infinite' : 'none',
          }}>{timeLeft}</p>
          <p className="tf-dato">seg</p>
        </div>
      </div>

      {/* Barra de tiempo */}
      <div className="tf-barra-tiempo">
        <div style={{
          height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: '2px',
          transition: 'width 1s linear, background 0.5s ease', boxShadow: `0 0 8px ${timerColor}`,
        }}/>
      </div>

      {/* GRILLA: una tarjeta por categoría con tu respuesta y lo de la máquina */}
      <div className="ui-ancho tf-grilla" data-testid="grilla-tutti" style={{ '--ancho': '860px' } as CSSProperties}>
        {categorias.map(cat => (
          <label key={cat} className="tf-celda">
            <span className="tf-cat">{cat}</span>
            <input
              className="ui-campo"
              placeholder={`${letra}...`}
              value={respuestas[cat] || ''}
              onChange={e => handleChange(cat, e.target.value)}
              disabled={finished}
              autoComplete="off"
            />
            <span className="tf-ia">
              <Bot size={13} strokeWidth={1.8} color="#ef4444" aria-label="IA" />
              {finished ? (
                iaRespuestas[cat]
                  ? <strong style={{ color: '#f87171', textTransform: 'uppercase', fontFamily: "'Oswald', sans-serif", letterSpacing: '1px' }}>{iaRespuestas[cat]}</strong>
                  : '—'
              ) : iaRespuestas[cat] ? (
                <><PenLine size={13} strokeWidth={1.8} color="rgba(57,255,140,0.7)" /> Ya escribió</>
              ) : (
                <><Hourglass size={12} strokeWidth={1.8} color="rgba(255,255,255,0.35)" /> Pensando…</>
              )}
            </span>
          </label>
        ))}
      </div>

      {/* RESULTADO */}
      {finished && (() => {
        const puntajeJugador = resultado?.playerPoints ?? 0;
        const puntajeIA = resultado?.aiPoints ?? 0;
        const gano = resultado?.outcome === 'win';
        const empate = !resultado || resultado.outcome === 'draw';

        const resultColor = gano ? '#39ff8c' : empate ? '#fbbf24' : '#ef4444';
        const resultBorder = gano ? 'rgba(57,255,140,0.35)' : empate ? 'rgba(251,191,36,0.35)' : 'rgba(239,68,68,0.35)';

        return (
          <div className="card tf-aparece" style={{ textAlign: 'center', borderColor: resultBorder, borderTopColor: resultColor }}>
            {/* ¡BASTA! o ¡TIEMPO!, según cómo terminó la ronda */}
            <div data-testid="fin-de-ronda" style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 700, color: '#eafff2', letterSpacing: '3px',
              margin: '0 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase',
            }}>
              {finishReason === 'basta'
                ? <><StopCircle size={20} strokeWidth={2} color="#39ff8c" /> ¡Basta!</>
                : <><Timer size={20} strokeWidth={2} color="#39ff8c" /> ¡Tiempo!</>}
            </div>

            {/* Marcador */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '14px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="tf-dato" style={{ color: '#39ff8c', marginBottom: '4px' }}>Vos</div>
                <div style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '44px', fontWeight: 700, color: '#39ff8c', lineHeight: 1,
                  textShadow: '0 0 20px rgba(57,255,140,0.6)',
                }}>{isLoading ? '...' : puntajeJugador}</div>
              </div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div className="tf-dato" style={{ color: '#ef4444', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Bot size={12} strokeWidth={1.5} /> IA
                </div>
                <div style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '44px', fontWeight: 700, color: '#ef4444', lineHeight: 1,
                  textShadow: '0 0 20px rgba(239,68,68,0.5)',
                }}>{isLoading ? '...' : puntajeIA}</div>
              </div>
            </div>

            {/* Badge resultado (sólo cuando el servidor respondió) */}
            {resultado && <div style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '17px', fontWeight: 700, letterSpacing: '3px', color: resultColor,
              marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              textTransform: 'uppercase', textShadow: `0 0 16px ${resultColor}`,
            }}>
              {gano
                ? <><Trophy size={20} strokeWidth={2} /> ¡Ganaste!</>
                : empate
                ? <><Handshake size={20} strokeWidth={2} /> ¡Empate!</>
                : <><Skull size={20} strokeWidth={2} /> Perdiste</>
              }
            </div>}

            {resultado && resultado.newAchievements.length > 0 && (
              <div role="status" className="tf-aparece" style={{
                margin: '0 0 14px', padding: '10px 12px', borderRadius: '10px',
                background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.45)',
              }}>
                <p className="kicker" style={{ color: '#fde047', marginBottom: '6px' }}>
                  {resultado.newAchievements.length === 1 ? '¡Logro desbloqueado!' : '¡Logros desbloqueados!'}
                </p>
                {resultado.newAchievements.map(a => {
                  const Icon = achievementIcon(a.id);
                  return (
                    <p key={a.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      fontSize: '13px', color: '#fef9c3', margin: '2px 0',
                    }}>
                      <Icon size={15} color="#fde047" /> <strong>{a.name}</strong>
                      <span style={{ color: 'rgba(254,249,195,0.7)' }}>· {a.description}</span>
                    </p>
                  );
                })}
              </div>
            )}

            {resultado?.validationIncomplete && (
              <div role="alert" className="notice" style={{ margin: '0 0 14px', textAlign: 'left' }}>
                <strong>No pudimos validar algunas respuestas.</strong> La inteligencia artificial que revisa las
                respuestas no respondió, así que las marcadas "Sin validar" no suman puntos. Esta partida no cuenta
                para tus estadísticas ni el ranking. Probá jugar otra en un rato.
              </div>
            )}

            {resultado?.elo && (
              <p data-testid="cambio-elo" style={{ fontSize: '12px', color: 'rgba(180,255,205,0.75)', margin: '-6px 0 12px' }}>
                ELO {resultado.elo.before} → <strong>{resultado.elo.after}</strong>{' '}
                ({resultado.elo.after >= resultado.elo.before ? '+' : ''}{resultado.elo.after - resultado.elo.before})
              </p>
            )}

            {resultado?.stats && resultado.stats.currentStreak > 1 && (
              <p style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                color: '#fdba74', fontSize: '13px', margin: '-6px 0 14px',
              }}>
                <Flame size={15} /> ¡Racha de {resultado.stats?.currentStreak} victorias!
              </p>
            )}

            {/* Detalle por categoría */}
            <div style={{ minHeight: 40, textAlign: 'left' }}>
              {isLoading ? (
                <div className="spinner" />
              ) : apiError ? (
                <div style={{ textAlign: 'center' }}>
                  <p className="error" style={{ marginBottom: '10px' }}>{apiError}</p>
                  <button className="ui-chico" onClick={enviarResultado}>Reintentar</button>
                </div>
              ) : resultado?.results ? (
                <RoundResults results={resultado.results} />
              ) : null}
            </div>
            {/* Entre partidas: sólo cuando ya está el resultado (apagado salvo VITE_ADS_ENABLED=true) */}
            {resultado && <AdSlot placement="resultado" />}
          </div>
        );
      })()}
    </PantallaJuego>
  );
}
