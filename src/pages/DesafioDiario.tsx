import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarCheck, Copy, Flame, Share2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import MultiShell from '../multi/MultiShell';
import QuestionCard from '../games/QuestionCard';
import { useNow } from '../multi/useNow';
import { secondsLeft } from '../game/round';
import { achievementIcon } from '../profile/achievementIcons';
import {
  cuadraditos, cuentaRegresiva, empezarDesafio, getDesafioHoy, getTablaDesafio, responderDesafio,
  type DesafioHoy, type JugadaDesafio, type PreguntaDesafio, type TablaDesafio,
} from '../api/desafio';

// Desafío del día: 5 preguntas iguales para todos, una vez por día. Racha de días seguidos, resultado
// para compartir sin spoilers y tabla del día. El servidor corrige y mide el tiempo.

const PAUSA_MS = 1300;
const mensajeError = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo conectar con el servidor. Probá de nuevo.';

export default function DesafioDiario() {
  const [hoy, setHoy] = useState<DesafioHoy | null>(null);
  const [tabla, setTabla] = useState<TablaDesafio | null>(null);
  const [jugada, setJugada] = useState<JugadaDesafio | null>(null);
  const [pregunta, setPregunta] = useState<PreguntaDesafio | null>(null);
  const [finPregunta, setFinPregunta] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [revelada, setRevelada] = useState<{ correcta: number } | null>(null);
  const [final, setFinal] = useState<JugadaDesafio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [cargadoEn] = useState(() => Date.now());
  const enviando = useRef(false);
  const now = useNow(true, pregunta && !revelada ? 250 : 1000);

  const cargar = useCallback(() => {
    getDesafioHoy().then(setHoy).catch((e) => setError(mensajeError(e)));
    getTablaDesafio().then(setTabla).catch(() => setTabla(null));
  }, []);
  useEffect(cargar, [cargar]);

  const mostrar = (p: PreguntaDesafio) => {
    setPregunta(p);
    setElegida(null);
    setRevelada(null);
    setFinPregunta(Date.now() + p.restantes * 1000);
    enviando.current = false;
  };

  const jugar = async () => {
    setError(null);
    try {
      const r = await empezarDesafio();
      setJugada(r);
      if (r.terminada) setFinal(r);
      else if (r.pregunta) mostrar(r.pregunta);
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  const responder = useCallback(async (opcion: number | null) => {
    if (!jugada || enviando.current) return;
    enviando.current = true;
    setElegida(opcion);
    try {
      const r = await responderDesafio(jugada.matchId, opcion);
      setRevelada({ correcta: r.opcionCorrecta ?? -1 });
      setJugada((j) => (j ? { ...j, puntos: r.puntos, aciertos: r.aciertos } : j));
      setTimeout(() => {
        if (r.terminada) {
          setPregunta(null);
          setFinal(r);
          cargar();
        } else if (r.pregunta) mostrar(r.pregunta);
      }, PAUSA_MS);
    } catch (e) {
      setError(mensajeError(e));
      enviando.current = false;
    }
  }, [jugada, cargar]);

  useEffect(() => {
    if (!pregunta || revelada) return;
    const t = setTimeout(() => void responder(null), Math.max(0, finPregunta - Date.now()));
    return () => clearTimeout(t);
  }, [pregunta, revelada, finPregunta, responder]);

  const compartir = async (texto: string) => {
    const conLink = `${texto}\n${window.location.origin}/desafio-diario`;
    try {
      if (navigator.share) await navigator.share({ text: conLink });
      else {
        await navigator.clipboard.writeText(conLink);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch { /* el usuario canceló */ }
  };

  // El desafío del día no tiene menú: "Volver" lleva a los juegos
  const volver = <BackButton to="/dashboard" />;

  // ── Jugando ───────────────────────────────────────────────────────────────────────────────
  if (pregunta && jugada) {
    const restantes = Math.min(pregunta.segundos, secondsLeft(finPregunta, now));
    return (
      <MultiShell maxWidth={560}>
        <BackButton to="/dashboard" confirm={{
          title: '¿Seguro que querés salir?',
          message: 'Podés volver hoy y seguir donde quedaste, pero el reloj sigue corriendo: las preguntas que se venzan cuentan como sin responder.',
          confirmLabel: 'Salir',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="kicker">Desafío del día · {pregunta.numero} de {jugada.total}</span>
          <span className="kicker">{jugada.aciertos} ✓</span>
        </div>
        <QuestionCard pregunta={pregunta} segundosRestantes={revelada ? 0 : restantes} elegida={elegida}
          revelada={revelada} bloqueada={!!revelada || elegida !== null} onElegir={(i) => void responder(i)} />
        {error && <div className="error">{error}</div>}
      </MultiShell>
    );
  }

  // ── Resultado de hoy (recién terminado o ya jugado) ───────────────────────────────────────
  const res = final
    ? { aciertos: final.aciertos, puntos: final.puntos, marcas: final.marcas ?? '', racha: final.racha ?? 1, compartir: final.compartir ?? '' }
    : hoy?.jugado && hoy.resultado
      ? { ...hoy.resultado, racha: hoy.racha, compartir: hoy.compartir ?? '' }
      : null;
  const proximo = hoy ? hoy.proximoEnMs - (now - cargadoEn) : 0;

  return (
    <MultiShell maxWidth={520}>
      {volver}
      <div style={{ textAlign: 'center' }}>
        <p className="kicker">Igual para todos · una vez por día</p>
        <h1 className="neon-title" style={{ fontSize: '28px', marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <CalendarCheck size={24} /> Desafío del día
        </h1>
      </div>

      {res ? (
        <div className="card pulse" style={{ textAlign: 'center' }} data-testid="resultado-diario">
          <p style={{ fontSize: '34px', letterSpacing: '4px' }}>{cuadraditos(res.marcas)}</p>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', marginTop: '6px' }}>
            {res.aciertos}/{res.marcas.length} · {res.puntos} pts
          </p>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fdba74', marginTop: '6px' }} data-testid="racha">
            <Flame size={16} /> Racha: {res.racha} {res.racha === 1 ? 'día' : 'días'}
          </p>
          {final?.logros && final.logros.length > 0 && (
            <div role="status" style={{ marginTop: '10px', padding: '8px', borderRadius: '10px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.45)' }}>
              {final.logros.map((a) => {
                const Icon = achievementIcon(a.id);
                return <p key={a.id} style={{ fontSize: '13px', color: '#fef9c3' }}><Icon size={14} color="#fde047" /> <strong>{a.name}</strong> · {a.description}</p>;
              })}
            </div>
          )}
          <pre data-testid="texto-compartir" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '12px', color: 'rgba(180,255,205,0.75)', margin: '12px 0', textAlign: 'left', background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px' }}>
            {res.compartir}
          </pre>
          <button className="main-btn" onClick={() => void compartir(res.compartir)}>
            {copiado ? <><Copy size={16} /> ¡Copiado!</> : <><Share2 size={16} /> Compartir</>}
          </button>
          <p style={{ fontSize: '12px', color: 'rgba(180,255,205,0.6)', marginTop: '10px' }}>
            Próximo desafío en <strong data-testid="proximo">{cuentaRegresiva(proximo)}</strong>
          </p>
        </div>
      ) : hoy ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'rgba(180,255,205,0.8)', lineHeight: 1.5 }}>
            {hoy.preguntas} preguntas, de fácil a difícil, 20 segundos cada una. Todos juegan las mismas: comparalo con tus amigos.
          </p>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fdba74', margin: '10px 0' }}>
            <Flame size={16} /> Tu racha: {hoy.racha} {hoy.racha === 1 ? 'día' : 'días'}
          </p>
          <button className="main-btn" data-testid="jugar-diario" onClick={() => void jugar()}>
            {hoy.enCurso ? 'Seguir el desafío' : 'Jugar el de hoy'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}><div className="spinner" /></div>
      )}

      {error && <div className="error">{error}</div>}

      {tabla && tabla.top.length > 0 && (
        <div className="card" data-testid="tabla-diaria">
          <p className="section-label">Tabla de hoy · {tabla.jugadores} {tabla.jugadores === 1 ? 'jugador' : 'jugadores'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tabla.top.slice(0, 10).map((f) => (
              <div key={f.userId} className="player-row" style={{ padding: '6px 10px', borderColor: f.userId === tabla.yo?.userId ? 'rgba(57,255,140,0.6)' : undefined }}>
                <span style={{ width: '24px', fontFamily: "'Oswald', sans-serif", color: '#7CFFB2' }}>{f.posicion}°</span>
                <span style={{ flex: 1, fontSize: '13px' }}>{f.username}</span>
                <span style={{ fontSize: '12px', color: 'rgba(180,255,205,0.7)' }}>{f.aciertos}/5 · {f.puntos} pts · {f.segundos}s</span>
              </div>
            ))}
          </div>
          {tabla.yo && tabla.yo.posicion > 10 && (
            <p style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(180,255,205,0.7)' }}>Vos: {tabla.yo.posicion}° · {tabla.yo.aciertos}/5 · {tabla.yo.puntos} pts</p>
          )}
        </div>
      )}
    </MultiShell>
  );
}
