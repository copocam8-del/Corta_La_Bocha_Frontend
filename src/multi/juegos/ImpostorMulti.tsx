import { useState } from 'react';
import { Check, Eye, EyeOff, Fingerprint, Send, Users, VenetianMask, Vote } from 'lucide-react';
import type { RoomApi } from '../useRoom';
import type { RoomSnapshot } from '../types';
import type { ImpostorView } from '../gameViews';
import { secondsUntil } from '../clock';
import { useNow } from '../useNow';
import { Countdown, MultiFinal, MultiHeader, Notices, Scoreboard } from '../MultiParts';
import { colorOf, nameOf } from '../players';
import { avisoAntesDeEnviar } from './impostorAviso';
import { AMARILLO, CELESTE, COMO_JUGAR_ONLINE, ROJO, VERDE } from '../../games/impostor/estilo';
import { BarraFija, BotonAyuda, EstilosImpostor, FondoImpostor } from '../../games/impostor/ImpostorUI';

// El Impostor multijugador. Todos ven la palabra secreta menos el impostor (el servidor ni se la
// manda). Por turnos se dan pistas (dos vueltas), después se vota y, si descubren al impostor,
// tiene unos segundos para adivinar la palabra. El servidor decide todo: acá sólo se muestra lo
// que llega y se manda lo que hace el jugador. Pensado primero para el celular, con el mismo estilo
// que "En persona" (games/impostor/estilo.ts): bloques redondeados, colores de rol (impostor en rojo,
// hinchas en celeste), el botón principal fijo abajo y "Cómo jugar" en el "?".

const ESTILOS = `
  .imp-secreto { text-align: center; padding: 20px 18px; display: flex; flex-direction: column; gap: 8px; }
  .imp-palabra { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; line-height: 1.05;
    font-size: clamp(32px, 10vw, 50px); color: #eefff4; overflow-wrap: anywhere; }
  .imp-palabra.impostor { color: ${ROJO}; }
  .imp-tapada { filter: blur(14px); user-select: none; }
  .imp-pista { display: inline-block; padding: 5px 12px; border-radius: 999px; font-size: 15px; background: rgba(94,203,255,0.1);
    border: 1px solid rgba(94,203,255,0.3); overflow-wrap: anywhere; }
  .imp-pista.vacia { font-style: italic; opacity: 0.5; }
  .imp-voto { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 58px; padding: 12px 16px; border-radius: 18px; cursor: pointer;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #eefff4; font-size: 17px; text-align: left; }
  .imp-voto:disabled { cursor: default; opacity: 0.55; }
  .imp-voto.elegido { border-color: ${AMARILLO}; background: rgba(251,191,36,0.12); opacity: 1; }
  .imp-input { width: 100%; min-height: 54px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06);
    color: #eefff4; padding: 0 16px; font-size: 17px; outline: none; }
  .imp-input:focus { border-color: ${VERDE}; }
`;

// Lo común de cada pantalla online: estilos, el fondo oscuro y el "?" de Cómo jugar
const Comun = () => (
  <>
    <EstilosImpostor />
    <FondoImpostor />
    <style>{ESTILOS}</style>
    <BotonAyuda pasos={COMO_JUGAR_ONLINE} />
  </>
);

// Lugar abajo para que la barra fija no tape lo último
const EspacioBarra = () => <div aria-hidden="true" style={{ height: '96px' }} />;

export default function ImpostorMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const v = state.view as ImpostorView;
  const phase = state.phase;
  const now = useNow(phase !== 'finished' && phase !== 'lobby', 250);
  const offset = room.offset();
  const [error, setError] = useState<string | null>(null);

  const jugar = async (type: string, payload: object) => {
    // Filtro de malas palabras: se avisa antes de enviar (el backend igual lo revisa)
    const aviso = avisoAntesDeEnviar(type, payload);
    if (aviso) {
      setError(aviso);
      return false;
    }
    const r = await room.action(type, payload);
    setError(r.ok ? null : r.error);
    return r.ok;
  };

  const header = <MultiHeader room={room} state={state} detail={`El Impostor${v.categoria ? ` · ${v.categoria}` : ''}`} />;

  if (phase === 'finished') {
    return (
      <>
        <Comun />
        {header}
        <MultiFinal room={room} state={state}>
          {v.revelada && <Revelacion state={state} v={v} />}
        </MultiFinal>
      </>
    );
  }
  if (phase === 'results' && v.revelada) {
    return (
      <>
        <Comun />
        {header}
        <Revelacion state={state} v={v} siguienteEn={secondsUntil(state.nextAt, offset, now)} />
        <Pistas state={state} v={v} />
        <Notices room={room} state={state} local={error} />
        <Scoreboard state={state} />
      </>
    );
  }
  if (phase !== 'playing' || !v.etapa) {
    return (
      <>
        <Comun />
        {header}
        <Countdown state={state} now={now} offset={offset} />
        <Scoreboard state={state} />
      </>
    );
  }

  const miTurno = v.etapa === 'pistas' && v.turno === state.me;
  const adivino = v.etapa === 'adivinanza' && v.descubierto === state.me;
  return (
    <>
      <Comun />
      {header}
      <Secreto v={v} />
      <Etapa state={state} v={v} restantes={secondsUntil(v.etapa === 'pistas' ? v.turnoHasta : v.hasta, offset, now)} />
      {miTurno && <DarPista max={v.maxPista} jugar={jugar} />}
      {v.etapa === 'votacion' && <Votacion state={state} v={v} jugar={jugar} />}
      {v.etapa === 'adivinanza' && <Adivinanza state={state} v={v} jugar={jugar} />}
      <Notices room={room} state={state} local={error} />
      <Pistas state={state} v={v} />
      <Scoreboard state={state} />
      {(miTurno || adivino) && <EspacioBarra />}
    </>
  );
}

// Tu rol y tu palabra bien grandes (el impostor en rojo y sin palabra). Se puede tapar por si alguien mira tu pantalla.
function Secreto({ v }: { v: ImpostorView }) {
  const [tapada, setTapada] = useState(false);
  const impostor = v.rol === 'impostor';
  const color = impostor ? ROJO : CELESTE;
  return (
    <div className="imp-bloque imp-secreto" data-testid="secreto" style={{ borderColor: `${color}66` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color, fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {impostor ? <VenetianMask size={22} /> : <Users size={22} />} {impostor ? 'Impostor' : 'Hincha'}
        </span>
        <button className="imp-chico" onClick={() => setTapada(!tapada)} aria-label={tapada ? 'Mostrar' : 'Tapar'}>
          {tapada ? <Eye size={16} /> : <EyeOff size={16} />} {tapada ? 'Mostrar' : 'Tapar'}
        </button>
      </div>
      <div className={tapada ? 'imp-tapada' : undefined} aria-hidden={tapada}>
        {impostor ? (
          <>
            <p className="imp-palabra impostor" style={{ margin: '6px 0' }}>Sos el impostor</p>
            <p className="imp-texto" style={{ fontSize: '15px' }}>
              No tenés palabra. Categoría: <strong style={{ color: AMARILLO }}>{v.categoria}</strong>. Escuchá las pistas y que no te descubran.
            </p>
          </>
        ) : (
          <>
            <p className="imp-texto" style={{ fontSize: '15px' }}>Tu palabra es:</p>
            <p className="imp-palabra" style={{ margin: '4px 0' }}>{v.palabra}</p>
            <p className="imp-texto" style={{ fontSize: '14px' }}>{v.categoria} · Da pistas sin decirla. Uno de ustedes no la sabe…</p>
          </>
        )}
      </div>
    </div>
  );
}

// Qué está pasando ahora (a quién le toca, votación, adivinanza) y el reloj
function Etapa({ state, v, restantes }: { state: RoomSnapshot; v: ImpostorView; restantes: number }) {
  let texto;
  if (v.etapa === 'pistas') {
    texto = v.turno === state.me
      ? <strong style={{ color: VERDE }}>¡Te toca dar una pista!</strong>
      : <>Pista de <strong style={{ color: colorOf(state, v.turno) }}>{nameOf(state, v.turno)}</strong></>;
  } else if (v.etapa === 'votacion') {
    texto = <strong style={{ color: AMARILLO }}>¡A votar! ¿Quién es el impostor?</strong>;
  } else {
    texto = <strong style={{ color: ROJO }}>¡Descubrieron a {nameOf(state, v.descubierto)}!</strong>;
  }
  return (
    <div className="imp-bloque" role="status" data-testid="etapa"
      style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
      <span style={{ fontSize: '16px', lineHeight: 1.4 }}>
        {v.etapa === 'pistas' && v.vuelta && <span className="imp-chiquito" style={{ marginRight: 8, fontSize: '12px' }}>Vuelta {v.vuelta}/{v.vueltas}</span>}
        {texto}
      </span>
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '30px', fontWeight: 700, color: restantes <= 5 ? ROJO : VERDE }}>{restantes}</span>
    </div>
  );
}

// El campo va en un bloque y el botón "Mandar pista", en la barra fija de abajo (mismo formulario)
function DarPista({ max, jugar }: { max: number; jugar: (type: string, payload: object) => Promise<boolean> }) {
  const [pista, setPista] = useState('');
  const enviar = async () => {
    if (!pista.trim()) return;
    if (await jugar('pista', { pista })) setPista('');
  };
  return (
    <form id="imp-pista-form" className="imp-bloque" onSubmit={(e) => { e.preventDefault(); void enviar(); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label className="imp-chiquito" htmlFor="imp-pista" style={{ textAlign: 'left' }}>Tu pista (una palabra o algo corto)</label>
      <input id="imp-pista" className="imp-input" autoFocus autoComplete="off" value={pista} maxLength={max}
        onChange={(e) => setPista(e.target.value)} placeholder="Ej.: zurdo" />
      <span style={{ fontSize: '13px', color: 'rgba(200,255,220,0.5)', textAlign: 'right' }}>{pista.length}/{max}</span>
      <BarraFija>
        <button className="imp-boton" type="submit" form="imp-pista-form" disabled={!pista.trim()}>
          <Send size={20} /> Mandar pista
        </button>
      </BarraFija>
    </form>
  );
}

// Las pistas de cada jugador, en el orden de los turnos
function Pistas({ state, v }: { state: RoomSnapshot; v: ImpostorView }) {
  const orden = v.orden.length ? v.orden : [...new Set(v.pistas.map((p) => p.userId))];
  if (!orden.length) return null;
  return (
    <div className="imp-bloque" data-testid="pistas" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p className="imp-chiquito" style={{ textAlign: 'left' }}>Pistas</p>
      {orden.map((uid) => {
        const suyas = v.pistas.filter((p) => p.userId === uid);
        const leToca = v.etapa === 'pistas' && v.turno === uid;
        const voto = v.etapa === 'votacion' && v.votaron.includes(uid);
        return (
          <div key={uid} style={{
            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '8px 10px', borderRadius: '14px',
            background: leToca ? 'rgba(57,255,140,0.08)' : 'transparent', border: `1px solid ${leToca ? 'rgba(57,255,140,0.45)' : 'transparent'}`,
          }}>
            <span className="dot" style={{ background: colorOf(state, uid), width: 10, height: 10 }} />
            <strong style={{ fontSize: '16px', minWidth: '70px' }}>{nameOf(state, uid)}</strong>
            {suyas.map((p, i) => (
              <span key={i} className={`imp-pista${p.texto === null ? ' vacia' : ''}`}>{p.texto ?? 'sin pista'}</span>
            ))}
            {leToca && <span className="waiting-dot" aria-label="Escribiendo" />}
            {voto && <Check size={16} color={VERDE} aria-label="Ya votó" />}
          </div>
        );
      })}
    </div>
  );
}

function Votacion({ state, v, jugar }: { state: RoomSnapshot; v: ImpostorView; jugar: (type: string, payload: object) => Promise<boolean> }) {
  const candidatos = v.orden.filter((uid) => uid !== state.me && state.players.some((p) => p.userId === uid && !p.left));
  return (
    <div className="imp-bloque" data-testid="votacion" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p className="imp-chiquito" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Vote size={15} /> Tu voto</p>
      {candidatos.map((uid) => (
        <button key={uid} className={`imp-voto${v.miVoto === uid ? ' elegido' : ''}`} disabled={!!v.miVoto}
          onClick={() => void jugar('voto', { userId: uid })}>
          <span className="dot" style={{ background: colorOf(state, uid), width: 14, height: 14 }} />
          <span style={{ flex: 1 }}>{nameOf(state, uid)}</span>
          {v.miVoto === uid && <Check size={18} color={AMARILLO} />}
        </button>
      ))}
      <p style={{ fontSize: '14px', color: 'rgba(200,255,220,0.65)' }}>
        {v.miVoto ? `Votaste a ${nameOf(state, v.miVoto)}. Esperando a los demás (${v.votaron.length}/${v.orden.length})…` : 'Si hay empate, el impostor zafa.'}
      </p>
    </div>
  );
}

function Adivinanza({ state, v, jugar }: { state: RoomSnapshot; v: ImpostorView; jugar: (type: string, payload: object) => Promise<boolean> }) {
  const [intento, setIntento] = useState('');
  if (v.descubierto !== state.me) {
    return (
      <div className="imp-bloque imp-revela" style={{ textAlign: 'center', borderColor: 'rgba(248,113,113,0.45)' }}>
        <VenetianMask size={40} color={ROJO} style={{ margin: '0 auto', display: 'block' }} />
        <p className="imp-texto" style={{ marginTop: '6px', color: '#eefff4' }}>
          <strong>{nameOf(state, v.descubierto)}</strong> era el impostor… pero si adivina la palabra, gana igual.
        </p>
      </div>
    );
  }
  return (
    <form id="imp-adivinar-form" className="imp-bloque imp-revela" onSubmit={(e) => { e.preventDefault(); if (intento.trim()) void jugar('adivinar', { respuesta: intento }); }}
      style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderColor: 'rgba(248,113,113,0.55)' }}>
      <p className="imp-texto" style={{ color: '#eefff4' }}><strong style={{ color: ROJO }}>¡Te descubrieron!</strong> Adiviná la palabra y ganás igual (un solo intento).</p>
      <input className="imp-input" autoFocus autoComplete="off" value={intento} maxLength={60} placeholder={`${v.categoria ?? ''}…`}
        onChange={(e) => setIntento(e.target.value)} aria-label="Tu respuesta" />
      <BarraFija>
        <button className="imp-boton" type="submit" form="imp-adivinar-form" disabled={!intento.trim()}>
          <Send size={20} /> Arriesgar
        </button>
      </BarraFija>
    </form>
  );
}

const MOTIVOS: Record<NonNullable<ImpostorView['revelada']>['motivo'], string> = {
  zafo: 'Nadie lo descubrió: ¡el impostor zafó!',
  adivino: 'Lo descubrieron, pero adivinó la palabra.',
  descubierto: '¡Lo descubrieron y no adivinó la palabra!',
  abandono: 'El impostor abandonó la partida.',
};

// Revelación de la ronda: quién era el impostor (con animación), la palabra, los votos y los puntos
function Revelacion({ state, v, siguienteEn }: { state: RoomSnapshot; v: ImpostorView; siguienteEn?: number }) {
  const r = v.revelada!;
  const ganoImpostor = r.ganador === 'impostor';
  const yoEra = r.impostor === state.me;
  const gane = ganoImpostor === yoEra;
  return (
    <div className="imp-bloque" data-testid="revelacion" style={{ textAlign: 'center', perspective: '600px' }}>
      <p className="imp-chiquito">Ronda {r.numero} · El impostor era…</p>
      <div className="imp-revela" style={{ margin: '10px 0' }}>
        <VenetianMask size={44} color={ROJO} style={{ margin: '0 auto', display: 'block' }} />
        <p className="imp-palabra impostor" style={{ fontSize: 'clamp(28px, 9vw, 42px)' }}>{yoEra ? '¡Vos!' : nameOf(state, r.impostor)}</p>
      </div>
      <div className="imp-revela-2">
        <p className="imp-texto" style={{ fontSize: '15px' }}>
          La palabra era <strong style={{ color: CELESTE }}>{r.palabra}</strong> ({r.categoria})
          {r.adivinanza && <> · arriesgó “{r.adivinanza}”</>}
        </p>
        <p style={{ fontSize: '17px', margin: '10px 0', color: gane ? VERDE : '#fca5a5', fontWeight: 600 }}>
          {MOTIVOS[r.motivo]} {gane ? '¡Ganaste la ronda!' : 'Perdiste la ronda.'}
        </p>
        {r.votos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', margin: '6px 0' }} data-testid="votos">
            {r.votos.map((x) => (
              <span key={x.de} className="imp-pista" style={x.a === r.impostor ? { borderColor: 'rgba(248,113,113,0.6)' } : undefined}>
                <Fingerprint size={12} style={{ verticalAlign: 'middle' }} /> {nameOf(state, x.de)} → {nameOf(state, x.a)}
              </span>
            ))}
          </div>
        )}
        {Object.keys(r.puntos).length > 0 && (
          <p style={{ fontSize: '14px', color: 'rgba(200,255,220,0.75)' }}>
            {Object.entries(r.puntos).map(([uid, pts]) => `${nameOf(state, uid)} +${pts}`).join(' · ')}
          </p>
        )}
        {siguienteEn !== undefined && <p style={{ fontSize: '13px', color: 'rgba(200,255,220,0.5)', marginTop: '6px' }}>Siguiente ronda en {siguienteEn} s</p>}
      </div>
    </div>
  );
}
