import { useEffect, useRef, useState } from 'react';
import { CircleUserRound, Flag, Landmark, Shield, Tag, type LucideIcon } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import BackButton from '../components/BackButton';
import { ABANDONAR } from '../components/abandonar';
import { menuPath } from '../games/multiConfig';
import GameResult from '../games/GameResult';
import { useNow } from '../multi/useNow';
import { secondsLeft } from '../game/round';
import {
  columnasMemotest, empezarMemotest, rendirseMemotest, TEMAS_MEMOTEST, voltearCarta,
  type CartaVista, type IconoCarta, type NivelMemotest, type PartidaMemotest,
} from '../api/memotest';

// Memotest futbolero: cartas de texto con íconos propios (sin escudos ni logos reales). El servidor
// revela cada carta al darla vuelta y decide si es par.

const ICONOS: Record<IconoCarta, LucideIcon> = { escudo: Shield, apodo: Tag, jugador: CircleUserRound, bandera: Flag, estadio: Landmark };
const ESPERA_MS = 900; // cuánto se ven dos cartas que no son par antes de taparse
const mensajeError = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo conectar con el servidor. Probá de nuevo.';

export default function Memotest() {
  const [tema, setTema] = useState('clubes_apodos');
  const [nivel, setNivel] = useState<NivelMemotest>('facil');
  const [partida, setPartida] = useState<PartidaMemotest | null>(null);
  const [visibles, setVisibles] = useState<Record<number, CartaVista>>({}); // dadas vuelta (no descubiertas)
  const [fin, setFin] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const ocupado = useRef(false);
  const now = useNow(!!partida && !partida.terminada, 500);

  const empezar = async () => {
    setError(null);
    try {
      const p = await empezarMemotest(tema, nivel);
      setPartida(p);
      setVisibles({});
      setFin(Date.now() + p.restantes * 1000);
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  useEffect(() => {
    if (!partida || partida.terminada) return;
    const t = setTimeout(() => void rendirseMemotest(partida.matchId).then(setPartida).catch((e) => setError(mensajeError(e))),
      Math.max(0, fin - Date.now()));
    return () => clearTimeout(t);
  }, [partida, fin]);

  const tocar = async (i: number) => {
    if (!partida || partida.terminada || ocupado.current) return;
    if (visibles[i] || partida.descubiertas.some((d) => d.indice === i)) return;
    ocupado.current = true;
    try {
      const r = await voltearCarta(partida.matchId, i);
      if (r.carta) setVisibles((v) => ({ ...v, [r.carta!.indice]: r.carta! }));
      if (r.primera && r.par === false) {
        // No es par: se ven un momento y se tapan
        setVisibles((v) => ({ ...v, [r.primera!.indice]: r.primera! }));
        setTimeout(() => { setVisibles({}); setPartida(r); ocupado.current = false; }, ESPERA_MS);
        return;
      }
      if (r.primera) setVisibles({});
      setPartida(r);
    } catch (e) {
      setError(mensajeError(e));
    }
    ocupado.current = false;
  };

  if (!partida) {
    return (
      <MultiShell maxWidth={480}>
        <BackButton to={menuPath('memotest')} />
        <div style={{ textAlign: 'center' }}>
          <p className="kicker">Memotest</p>
          <h1 className="neon-title" style={{ fontSize: '28px', marginTop: '6px' }}>Encontrá los pares</h1>
          <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.7)', marginTop: '8px' }}>
            Da vuelta dos cartas: si van juntas (un club y su apodo, un jugador y su selección…) quedan a la vista.
          </p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p className="section-label">Tema</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {TEMAS_MEMOTEST.map((t) => (
                <button key={t.id} className={`option-btn${tema === t.id ? ' active' : ''}`} style={{ flex: 'none' }} onClick={() => setTema(t.id)}>{t.nombre}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label">Nivel</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {([['facil', 'Fácil · 12'], ['medio', 'Medio · 16'], ['dificil', 'Difícil · 20']] as const).map(([id, label]) => (
                <button key={id} className={`option-btn${nivel === id ? ' active' : ''}`} onClick={() => setNivel(id)}>{label}</button>
              ))}
            </div>
          </div>
          <button className="main-btn" data-testid="empezar-memotest" onClick={() => void empezar()}>¡Arrancar!</button>
        </div>
        {error && <div className="error">{error}</div>}
      </MultiShell>
    );
  }

  const restantes = partida.terminada ? 0 : Math.min(partida.segundos, secondsLeft(fin, now));
  const descubiertas = new Map(partida.descubiertas.map((d) => [d.indice, d]));
  return (
    <MultiShell maxWidth={560}>
      {/* En medio de la partida, salir = rendirse (cuenta como perdida) */}
      <BackButton to={menuPath('memotest')} confirm={partida.terminada ? null : ABANDONAR}
        onLeave={() => (partida.terminada ? undefined : rendirseMemotest(partida.matchId))} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="kicker">{partida.tema}</span>
        <span className="kicker" data-testid="estado-memotest">
          {partida.encontrados}/{partida.pares} pares · {partida.movimientos} mov. · {Math.floor(restantes / 60)}:{String(restantes % 60).padStart(2, '0')}
        </span>
      </div>

      <div data-testid="mesa" style={{ display: 'grid', gridTemplateColumns: `repeat(${columnasMemotest(partida.cartas)}, 1fr)`, gap: '8px' }}>
        {Array.from({ length: partida.cartas }, (_, i) => {
          const d = descubiertas.get(i);
          const v = d ?? visibles[i];
          const Icon = v ? ICONOS[v.icono] : null;
          return (
            <button key={i} data-carta={i} onClick={() => void tocar(i)} aria-label={v ? v.texto : 'Carta boca abajo'}
              style={{
                aspectRatio: '3 / 4', borderRadius: '10px', cursor: v ? 'default' : 'pointer', padding: '6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                border: `1px solid ${d ? '#39ff8c' : v ? 'rgba(251,191,36,0.7)' : 'rgba(57,255,140,0.3)'}`,
                background: d ? 'rgba(57,255,140,0.16)' : v ? 'rgba(251,191,36,0.12)' : 'repeating-linear-gradient(135deg, #052e16 0 10px, #064a22 10px 20px)',
                color: '#eafff2', transition: 'background 0.25s ease, transform 0.25s ease', transform: v ? 'rotateY(0deg)' : 'none',
              }}>
              {v && Icon ? (
                <>
                  <Icon size={20} color={d ? '#39ff8c' : '#fbbf24'} />
                  <span style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.2, textAlign: 'center' }}>{v.texto}</span>
                </>
              ) : (
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', color: 'rgba(124,255,178,0.35)' }}>?</span>
              )}
            </button>
          );
        })}
      </div>

      {partida.terminada ? (
        <GameResult titulo={partida.gano ? '¡Memoria de crack!' : 'Se terminó el tiempo'} gano={!!partida.gano} puntos={partida.puntos ?? 0}
          logros={partida.logros} onJugarOtra={() => setPartida(null)}>
          <p style={{ fontSize: '14px', color: 'rgba(180,255,205,0.85)' }}>{partida.encontrados} pares en {partida.movimientos} movimientos</p>
        </GameResult>
      ) : (
        <button className="ghost-btn" onClick={() => void rendirseMemotest(partida.matchId).then(setPartida).catch((e) => setError(mensajeError(e)))}>
          <Flag size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Rendirme
        </button>
      )}
      {error && <div className="error">{error}</div>}
    </MultiShell>
  );
}
