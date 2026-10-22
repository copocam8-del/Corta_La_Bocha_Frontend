import { useState } from 'react';
import { Check, Eye, EyeOff, Fingerprint, Send, VenetianMask, Vote } from 'lucide-react';
import type { RoomApi } from '../useRoom';
import type { RoomSnapshot } from '../types';
import type { ImpostorView } from '../gameViews';
import { secondsUntil } from '../clock';
import { useNow } from '../useNow';
import { Countdown, MultiFinal, MultiHeader, Notices, Scoreboard } from '../MultiParts';
import { colorOf, nameOf } from '../players';

// El Impostor multijugador. Todos ven la palabra secreta menos el impostor (el servidor ni se la
// manda). Por turnos se dan pistas (dos vueltas), después se vota y, si descubren al impostor,
// tiene unos segundos para adivinar la palabra. El servidor decide todo: acá sólo se muestra lo
// que llega y se manda lo que hace el jugador. Pensado primero para el celular.

const ROJO = '#f87171';

const ESTILOS = `
  .imp-secreto { text-align: center; padding: 18px 16px; }
  .imp-palabra { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; line-height: 1.05;
    font-size: clamp(30px, 9vw, 48px); color: #eafff2; text-shadow: 0 0 18px rgba(57,255,140,0.55); overflow-wrap: anywhere; }
  .imp-palabra.impostor { color: ${ROJO}; text-shadow: 0 0 18px rgba(248,113,113,0.55); }
  .imp-tapada { filter: blur(14px); user-select: none; }
  .imp-pista { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 13px; background: rgba(57,255,140,0.08);
    border: 1px solid rgba(57,255,140,0.25); overflow-wrap: anywhere; }
  .imp-pista.vacia { font-style: italic; opacity: 0.5; }
  .imp-voto { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border-radius: 10px; cursor: pointer;
    background: rgba(4,20,11,0.6); border: 1px solid rgba(57,255,140,0.25); color: #eafff2; font-size: 15px; text-align: left; }
  .imp-voto:disabled { cursor: default; opacity: 0.55; }
  .imp-voto.elegido { border-color: #fbbf24; background: rgba(251,191,36,0.12); opacity: 1; }
  .imp-revela { animation: impRevela 0.9s cubic-bezier(.2,1.4,.4,1) both; }
  .imp-revela-2 { animation: impRevela 0.7s ease 0.6s both; }
  @keyframes impRevela { from { opacity: 0; transform: scale(0.6) rotateX(70deg); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .imp-revela, .imp-revela-2 { animation: none; } }
  @media (min-width: 700px) { .imp-columnas { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; } }
`;

export default function ImpostorMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const v = state.view as ImpostorView;
  const phase = state.phase;
  const now = useNow(phase !== 'finished' && phase !== 'lobby', 250);
  const offset = room.offset();
  const [error, setError] = useState<string | null>(null);

  const jugar = async (type: string, payload: object) => {
    const r = await room.action(type, payload);
    setError(r.ok ? null : r.error);
    return r.ok;
  };

  const header = <MultiHeader room={room} state={state} detail={`El Impostor${v.categoria ? ` · ${v.categoria}` : ''}`} />;

  if (phase === 'finished') {
    return (
      <>
        <style>{ESTILOS}</style>
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
        <style>{ESTILOS}</style>
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
        {header}
        <Countdown state={state} now={now} offset={offset} />
        <Scoreboard state={state} />
      </>
    );
  }

  return (
    <>
      <style>{ESTILOS}</style>
      {header}
      <Secreto v={v} />
      <Etapa state={state} v={v} restantes={secondsUntil(v.etapa === 'pistas' ? v.turnoHasta : v.hasta, offset, now)} />
      <div className="imp-columnas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {v.etapa === 'pistas' && v.turno === state.me && <DarPista max={v.maxPista} jugar={jugar} />}
          {v.etapa === 'votacion' && <Votacion state={state} v={v} jugar={jugar} />}
          {v.etapa === 'adivinanza' && <Adivinanza state={state} v={v} jugar={jugar} />}
          <Notices room={room} state={state} local={error} />
        </div>
        <Pistas state={state} v={v} />
      </div>
      <Scoreboard state={state} />
    </>
  );
}

// Tu palabra (o "Sos el impostor") bien grande. Se puede tapar por si alguien mira tu pantalla.
function Secreto({ v }: { v: ImpostorView }) {
  const [tapada, setTapada] = useState(false);
  const impostor = v.rol === 'impostor';
  return (
    <div className="card imp-secreto" data-testid="secreto" style={impostor ? { borderColor: 'rgba(248,113,113,0.55)' } : undefined}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="kicker" style={impostor ? { color: ROJO } : undefined}>{impostor ? 'Tu rol' : 'Tu palabra'}</p>
        <button className="ghost-btn" onClick={() => setTapada(!tapada)} aria-label={tapada ? 'Mostrar' : 'Tapar'}
          style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
          {tapada ? <Eye size={13} /> : <EyeOff size={13} />} {tapada ? 'Mostrar' : 'Tapar'}
        </button>
      </div>
      <div className={tapada ? 'imp-tapada' : undefined} aria-hidden={tapada}>
        {impostor ? (
          <>
            <VenetianMask size={34} color={ROJO} style={{ margin: '6px auto 2px', display: 'block' }} />
            <p className="imp-palabra impostor">Sos el impostor</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,220,220,0.85)', marginTop: '8px' }}>
              Categoría: <strong>{v.categoria}</strong>. No sabés la palabra: escuchá las pistas y que no te descubran.
            </p>
          </>
        ) : (
          <>
            <p className="imp-palabra" style={{ margin: '8px 0 4px' }}>{v.palabra}</p>
            <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.7)' }}>
              {v.categoria} · Da pistas sin decirla. Uno de ustedes no la sabe…
            </p>
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
      ? <strong style={{ color: '#39ff8c' }}>¡Te toca dar una pista!</strong>
      : <>Pista de <strong style={{ color: colorOf(state, v.turno) }}>{nameOf(state, v.turno)}</strong></>;
  } else if (v.etapa === 'votacion') {
    texto = <strong style={{ color: '#fbbf24' }}>¡A votar! ¿Quién es el impostor?</strong>;
  } else {
    texto = <strong style={{ color: ROJO }}>¡Descubrieron a {nameOf(state, v.descubierto)}!</strong>;
  }
  return (
    <div className="card" role="status" data-testid="etapa"
      style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
      <span style={{ fontSize: '14px' }}>
        {v.etapa === 'pistas' && v.vuelta && <span className="kicker" style={{ marginRight: 8 }}>Vuelta {v.vuelta}/{v.vueltas}</span>}
        {texto}
      </span>
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', color: restantes <= 5 ? '#ef4444' : '#39ff8c' }}>{restantes}</span>
    </div>
  );
}

function DarPista({ max, jugar }: { max: number; jugar: (type: string, payload: object) => Promise<boolean> }) {
  const [pista, setPista] = useState('');
  const enviar = async () => {
    if (!pista.trim()) return;
    if (await jugar('pista', { pista })) setPista('');
  };
  return (
    <form className="card" onSubmit={(e) => { e.preventDefault(); void enviar(); }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label className="section-label" htmlFor="imp-pista" style={{ marginBottom: 0 }}>Tu pista (una palabra o algo corto)</label>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input id="imp-pista" className="grid-input" autoFocus autoComplete="off" value={pista} maxLength={max}
          onChange={(e) => setPista(e.target.value)} placeholder="Ej.: zurdo" style={{ textTransform: 'none', fontSize: '16px' }} />
        <button className="option-btn" style={{ flex: 'none' }} type="submit" disabled={!pista.trim()} aria-label="Mandar pista">
          <Send size={16} />
        </button>
      </div>
      <span style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', textAlign: 'right' }}>{pista.length}/{max}</span>
    </form>
  );
}

// Las pistas de cada jugador, en el orden de los turnos
function Pistas({ state, v }: { state: RoomSnapshot; v: ImpostorView }) {
  const orden = v.orden.length ? v.orden : [...new Set(v.pistas.map((p) => p.userId))];
  if (!orden.length) return null;
  return (
    <div className="card" data-testid="pistas" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p className="section-label" style={{ marginBottom: 0 }}>Pistas</p>
      {orden.map((uid) => {
        const suyas = v.pistas.filter((p) => p.userId === uid);
        const leToca = v.etapa === 'pistas' && v.turno === uid;
        const voto = v.etapa === 'votacion' && v.votaron.includes(uid);
        return (
          <div key={uid} style={{
            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '6px 8px', borderRadius: '8px',
            background: leToca ? 'rgba(57,255,140,0.08)' : 'transparent', border: `1px solid ${leToca ? 'rgba(57,255,140,0.45)' : 'transparent'}`,
          }}>
            <span className="dot" style={{ background: colorOf(state, uid), width: 10, height: 10 }} />
            <strong style={{ fontSize: '13px', minWidth: '64px' }}>{nameOf(state, uid)}</strong>
            {suyas.map((p, i) => (
              <span key={i} className={`imp-pista${p.texto === null ? ' vacia' : ''}`}>{p.texto ?? 'sin pista'}</span>
            ))}
            {leToca && <span className="waiting-dot" aria-label="Escribiendo" />}
            {voto && <Check size={14} color="#39ff8c" aria-label="Ya votó" />}
          </div>
        );
      })}
    </div>
  );
}

function Votacion({ state, v, jugar }: { state: RoomSnapshot; v: ImpostorView; jugar: (type: string, payload: object) => Promise<boolean> }) {
  const candidatos = v.orden.filter((uid) => uid !== state.me && state.players.some((p) => p.userId === uid && !p.left));
  return (
    <div className="card" data-testid="votacion" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p className="section-label" style={{ marginBottom: 0 }}><Vote size={11} /> Tu voto</p>
      {candidatos.map((uid) => (
        <button key={uid} className={`imp-voto${v.miVoto === uid ? ' elegido' : ''}`} disabled={!!v.miVoto}
          onClick={() => void jugar('voto', { userId: uid })}>
          <span className="dot" style={{ background: colorOf(state, uid), width: 12, height: 12 }} />
          <span style={{ flex: 1 }}>{nameOf(state, uid)}</span>
          {v.miVoto === uid && <Check size={16} color="#fbbf24" />}
        </button>
      ))}
      <p style={{ fontSize: '12px', color: 'rgba(180,255,205,0.6)' }}>
        {v.miVoto ? `Votaste a ${nameOf(state, v.miVoto)}. Esperando a los demás (${v.votaron.length}/${v.orden.length})…` : 'Si hay empate, el impostor zafa.'}
      </p>
    </div>
  );
}

function Adivinanza({ state, v, jugar }: { state: RoomSnapshot; v: ImpostorView; jugar: (type: string, payload: object) => Promise<boolean> }) {
  const [intento, setIntento] = useState('');
  if (v.descubierto !== state.me) {
    return (
      <div className="card imp-revela" style={{ textAlign: 'center' }}>
        <VenetianMask size={30} color={ROJO} style={{ margin: '0 auto', display: 'block' }} />
        <p style={{ fontSize: '15px', marginTop: '6px' }}>
          <strong>{nameOf(state, v.descubierto)}</strong> era el impostor… pero si adivina la palabra, gana igual.
        </p>
      </div>
    );
  }
  return (
    <form className="card imp-revela" onSubmit={(e) => { e.preventDefault(); if (intento.trim()) void jugar('adivinar', { respuesta: intento }); }}
      style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderColor: 'rgba(248,113,113,0.55)' }}>
      <p style={{ fontSize: '15px' }}><strong style={{ color: ROJO }}>¡Te descubrieron!</strong> Adiviná la palabra y ganás igual (un solo intento).</p>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input className="grid-input" autoFocus autoComplete="off" value={intento} maxLength={60} placeholder={`${v.categoria ?? ''}…`}
          onChange={(e) => setIntento(e.target.value)} style={{ textTransform: 'none', fontSize: '16px' }} aria-label="Tu respuesta" />
        <button className="option-btn" style={{ flex: 'none' }} type="submit" disabled={!intento.trim()} aria-label="Arriesgar">
          <Send size={16} />
        </button>
      </div>
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
    <div className="card" data-testid="revelacion" style={{ textAlign: 'center', perspective: '600px' }}>
      <p className="kicker">Ronda {r.numero} · El impostor era…</p>
      <div className="imp-revela" style={{ margin: '10px 0' }}>
        <VenetianMask size={36} color={ROJO} style={{ margin: '0 auto', display: 'block' }} />
        <p className="imp-palabra impostor" style={{ fontSize: 'clamp(26px, 8vw, 40px)' }}>{yoEra ? '¡Vos!' : nameOf(state, r.impostor)}</p>
      </div>
      <div className="imp-revela-2">
        <p style={{ fontSize: '14px', color: 'rgba(220,255,232,0.85)' }}>
          La palabra era <strong style={{ color: '#39ff8c' }}>{r.palabra}</strong> ({r.categoria})
          {r.adivinanza && <> · arriesgó “{r.adivinanza}”</>}
        </p>
        <p style={{ fontSize: '15px', margin: '8px 0', color: gane ? '#39ff8c' : '#fca5a5', fontWeight: 600 }}>
          {MOTIVOS[r.motivo]} {gane ? '¡Ganaste la ronda!' : 'Perdiste la ronda.'}
        </p>
        {r.votos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', margin: '6px 0' }} data-testid="votos">
            {r.votos.map((x) => (
              <span key={x.de} className="imp-pista" style={x.a === r.impostor ? { borderColor: 'rgba(248,113,113,0.6)' } : undefined}>
                <Fingerprint size={11} style={{ verticalAlign: 'middle' }} /> {nameOf(state, x.de)} → {nameOf(state, x.a)}
              </span>
            ))}
          </div>
        )}
        {Object.keys(r.puntos).length > 0 && (
          <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.75)' }}>
            {Object.entries(r.puntos).map(([uid, pts]) => `${nameOf(state, uid)} +${pts}`).join(' · ')}
          </p>
        )}
        {siguienteEn !== undefined && <p style={{ fontSize: '12px', color: 'rgba(180,255,205,0.5)', marginTop: '6px' }}>Siguiente ronda en {siguienteEn} s</p>}
      </div>
    </div>
  );
}
