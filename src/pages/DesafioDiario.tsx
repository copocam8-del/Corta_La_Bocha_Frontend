import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarCheck, Copy, Flame, HelpCircle, Play, Share2 } from 'lucide-react';
import QuestionCard from '../games/QuestionCard';
import { comoJugarDe } from '../games/comoJugar';
import { Encabezado, FilaAjuste, PantallaJuego } from '../games/ui/JuegoUI';
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
  const ayuda = comoJugarDe('trivia_diaria');

  // ── Jugando ───────────────────────────────────────────────────────────────────────────────
  if (pregunta && jugada) {
    const restantes = Math.min(pregunta.segundos, secondsLeft(finPregunta, now));
    return (
      <PantallaJuego ayuda={ayuda} salir={{
        to: '/dashboard',
        confirm: {
          title: '¿Seguro que querés salir?',
          message: 'Podés volver hoy y seguir donde quedaste, pero el reloj sigue corriendo: las preguntas que se venzan cuentan como sin responder.',
          confirmLabel: 'Salir',
        },
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="kicker">Desafío del día · {pregunta.numero} de {jugada.total}</span>
          <span className="kicker">{jugada.aciertos} ✓</span>
        </div>
        <QuestionCard pregunta={pregunta} segundosRestantes={revelada ? 0 : restantes} elegida={elegida}
          revelada={revelada} bloqueada={!!revelada || elegida !== null} onElegir={(i) => void responder(i)} />
        {error && <div className="error">{error}</div>}
      </PantallaJuego>
    );
  }

  // ── Resultado de hoy (recién terminado o ya jugado) ───────────────────────────────────────
  const res = final
    ? { aciertos: final.aciertos, puntos: final.puntos, marcas: final.marcas ?? '', racha: final.racha ?? 1, compartir: final.compartir ?? '' }
    : hoy?.jugado && hoy.resultado
      ? { ...hoy.resultado, racha: hoy.racha, compartir: hoy.compartir ?? '' }
      : null;
  const proximo = hoy ? hoy.proximoEnMs - (now - cargadoEn) : 0;

  // Abajo, fijo: compartir el resultado o jugar el de hoy
  const barra = res ? (
    <button className="ui-boton" onClick={() => void compartir(res.compartir)}>
      {copiado ? <><Copy size={18} /> ¡Copiado!</> : <><Share2 size={18} /> Compartir</>}
    </button>
  ) : hoy ? (
    <button className="ui-boton" data-testid="jugar-diario" onClick={() => void jugar()}>
      <Play size={20} fill="currentColor" /> {hoy.enCurso ? 'Seguir el desafío' : 'Jugar el de hoy'}
    </button>
  ) : undefined;

  return (
    <PantallaJuego salir={{ to: '/dashboard' }} ayuda={ayuda} barra={barra}>
      <Encabezado icono={CalendarCheck} kicker="Igual para todos · una vez por día" titulo="Desafío del día" />

      {res ? (
        <div className="card pulse" style={{ textAlign: 'center' }} data-testid="resultado-diario">
          <p style={{ fontSize: '34px', letterSpacing: '4px' }}>{cuadraditos(res.marcas)}</p>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '24px', marginTop: '6px' }}>
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
          <pre data-testid="texto-compartir" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px', color: 'rgba(180,255,205,0.8)', margin: '12px 0 0', textAlign: 'left', background: 'rgba(10,30,18,0.5)', border: '1px solid rgba(57,255,140,0.22)', padding: '10px 12px', borderRadius: '10px' }}>
            {res.compartir}
          </pre>
          <p className="ui-fila-sub" style={{ marginTop: '12px' }}>
            Próximo desafío en <strong data-testid="proximo" style={{ color: '#7CFFB2' }}>{cuentaRegresiva(proximo)}</strong>
          </p>
        </div>
      ) : hoy ? (
        <div className="card ui-filas">
          <FilaAjuste icono={HelpCircle} nombre={`${hoy.preguntas} preguntas`} sub="De fácil a difícil, 20 segundos cada una" />
          <FilaAjuste icono={Flame} nombre="Tu racha" valor={`${hoy.racha} ${hoy.racha === 1 ? 'día' : 'días'}`} />
          <p className="ui-fila-sub" style={{ padding: '0 4px', lineHeight: 1.45 }}>Todos juegan las mismas: comparalo con tus amigos.</p>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}><div className="spinner" /></div>
      )}

      {error && <div className="error">{error}</div>}

      {tabla && tabla.top.length > 0 && (
        <div className="card ui-filas" data-testid="tabla-diaria">
          <p className="kicker">Tabla de hoy · {tabla.jugadores} {tabla.jugadores === 1 ? 'jugador' : 'jugadores'}</p>
          <ol className="ui-filas">
            {tabla.top.slice(0, 10).map((f) => (
              <li key={f.userId} className="ui-fila" style={{ minHeight: '50px', borderColor: f.userId === tabla.yo?.userId ? 'rgba(57,255,140,0.7)' : undefined }}>
                <span className="ui-fila-icono" style={{ width: '32px', height: '32px', fontSize: '14px' }}>{f.posicion}</span>
                <span className="ui-fila-nombre" style={{ fontSize: '15px' }}>{f.username}</span>
                <span className="ui-fila-sub">{f.aciertos}/5 · {f.puntos} pts · {f.segundos}s</span>
              </li>
            ))}
          </ol>
          {tabla.yo && tabla.yo.posicion > 10 && (
            <p className="ui-fila-sub" style={{ padding: '0 4px' }}>Vos: {tabla.yo.posicion}° · {tabla.yo.aciertos}/5 · {tabla.yo.puntos} pts</p>
          )}
        </div>
      )}
    </PantallaJuego>
  );
}
