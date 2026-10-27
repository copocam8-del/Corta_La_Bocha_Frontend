import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BarChart3, Medal, Trash2, Trophy, UserRound } from 'lucide-react';
import { EstilosJuego, Hoja } from '../games/ui/JuegoUI';
import { borrarMiCuenta } from '../api/profile';
import { clearSession } from '../auth/session';
import { confirmacionCompleta, cuerpoBorrar, errorAlBorrar } from './reglasBorrarCuenta';

// "Borrar mi cuenta" (lo exige Google Play): al final del perfil, separado y en rojo. Abre una hoja que explica qué se
// borra y pide confirmar con la contraseña o, si la cuenta es de Google (no tiene contraseña), escribiendo el nombre de
// usuario. Si sale bien, se cierra la sesión y va al login con "Tu cuenta se borró.".

const ROJO = '#ff6b6b';

const CSS = `
  .borrar-zona { margin-top: 18px; border-radius: 14px; padding: 18px 20px; background: rgba(40,6,8,0.55);
    backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255,107,107,0.35); border-top: 2px solid rgba(255,107,107,0.7); box-shadow: 0 25px 50px -15px rgba(0,0,0,0.75); }
  .borrar-kicker { font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,160,160,0.75); }
  .borrar-abrir { margin-top: 12px; width: 100%; min-height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;
    border: 1px solid rgba(255,107,107,0.55); background: rgba(255,107,107,0.08); color: ${ROJO}; font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
  .borrar-boton { width: 100%; min-height: 54px; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #b91c1c, #ff5a5a); color: #fff5f5; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px;
    cursor: pointer; box-shadow: 0 0 20px rgba(255,90,90,0.4), 0 10px 24px -8px rgba(185,28,28,0.6); transition: transform 0.18s ease, filter 0.18s ease; }
  .borrar-boton:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
  .borrar-cancelar { width: 100%; min-height: 48px; margin-top: 10px; border-radius: 10px; cursor: pointer; font-family: 'Inter', sans-serif;
    font-size: 15px; font-weight: 600; background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.3); color: #ecfff3; }
  .borrar-abrir:focus-visible, .borrar-boton:focus-visible { outline: 2px solid ${ROJO}; outline-offset: 2px; }
  .borrar-cancelar:focus-visible { outline: 2px solid #39ff8c; outline-offset: 2px; }
  .borrar-lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .borrar-lista li { display: flex; align-items: center; gap: 12px; font-size: 15px; color: #ffe4e4; }
  .borrar-lista-icono { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(255,107,107,0.12); border: 1px solid rgba(255,107,107,0.4); color: ${ROJO}; }
  .borrar-aviso { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 10px; font-size: 14px; line-height: 1.45;
    background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.35); color: #fecaca; }
  .borrar-campo { width: 100%; min-height: 50px; padding: 0 16px; border-radius: 10px; font-size: 16px; font-family: 'Inter', sans-serif; outline: none;
    background: rgba(10,30,18,0.5); border: 1px solid rgba(255,107,107,0.35); color: #ecfff3; }
  .borrar-campo:focus { border-color: ${ROJO}; box-shadow: 0 0 0 3px rgba(255,107,107,0.18); }
  /* El título de la hoja: el .neon-title de la app (Perfil no carga MultiShell), en rojo */
  .ui-hoja .ui-titulo { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; color: #ffe4e4;
    text-shadow: 0 0 18px rgba(255,107,107,0.45); animation: none; }
  @media (hover: hover) {
    .borrar-abrir:hover { border-color: ${ROJO}; background: rgba(255,107,107,0.14); box-shadow: 0 0 16px rgba(255,107,107,0.3); }
    .borrar-boton:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
  }
`;

const QUE_SE_BORRA = [
  { icono: UserRound, texto: 'Tu perfil y tus datos' },
  { icono: BarChart3, texto: 'Tus estadísticas y partidas' },
  { icono: Medal, texto: 'Tu lugar en el ranking y las ligas' },
  { icono: Trophy, texto: 'Tus logros' },
];

export default function BorrarCuenta({ username, tieneContrasena }: { username: string; tieneContrasena: boolean }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <>
      <EstilosJuego />
      <style>{CSS}</style>
      <section className="borrar-zona perfil-borrar" aria-labelledby="borrar-cuenta-titulo" data-testid="zona-borrar-cuenta">
        <p className="borrar-kicker">Zona peligrosa</p>
        <h2 id="borrar-cuenta-titulo" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 700, color: '#ffe4e4', textTransform: 'uppercase', marginTop: '4px' }}>
          Borrar mi cuenta
        </h2>
        <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'rgba(255,210,210,0.75)', marginTop: '6px' }}>
          Se borra todo lo tuyo, para siempre: perfil, estadísticas, ranking y logros.
        </p>
        <button type="button" className="borrar-abrir" onClick={() => setAbierta(true)} data-testid="abrir-borrar-cuenta">
          <Trash2 size={16} /> Borrar mi cuenta
        </button>
      </section>

      {abierta && <HojaBorrarCuenta username={username} tieneContrasena={tieneContrasena} onCerrar={() => setAbierta(false)} />}
    </>
  );
}

// La hoja: qué se borra, la confirmación y "Borrar para siempre" (desactivado hasta completar) / "Cancelar"
export function HojaBorrarCuenta({ username, tieneContrasena, onCerrar }: { username: string; tieneContrasena: boolean; onCerrar: () => void }) {
  const navigate = useNavigate();
  const [valor, setValor] = useState('');
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState('');
  const completo = confirmacionCompleta(tieneContrasena, username, valor);

  const cerrar = () => {
    if (!borrando) onCerrar();
  };

  const borrar = async () => {
    if (!completo || borrando) return;
    setBorrando(true);
    setError('');
    try {
      await borrarMiCuenta(cuerpoBorrar(tieneContrasena, valor));
      clearSession();
      navigate('/login?borrada=1', { replace: true });
    } catch (err) {
      setError(errorAlBorrar(err));
      setBorrando(false);
    }
  };

  return (
    <Hoja
      titulo="¿Borrar tu cuenta?"
      onCerrar={cerrar}
      pie={
        <>
          <button type="button" className="borrar-boton" disabled={!completo || borrando} onClick={borrar} data-testid="borrar-para-siempre">
            <Trash2 size={18} /> {borrando ? 'Borrando…' : 'Borrar para siempre'}
          </button>
          <button type="button" className="borrar-cancelar" disabled={borrando} onClick={cerrar}>Cancelar</button>
        </>
      }
    >
      <p className="ui-texto" style={{ textAlign: 'left' }}>Si borrás tu cuenta, se borra:</p>
      <ul className="borrar-lista">
        {QUE_SE_BORRA.map(({ icono: Icono, texto }) => (
          <li key={texto}><span className="borrar-lista-icono"><Icono size={18} /></span>{texto}</li>
        ))}
      </ul>
      <p className="borrar-aviso" role="note">
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
        <span><strong>Es para siempre:</strong> no se puede deshacer ni recuperar. Los resultados de los demás en las partidas que jugaron con vos no cambian.</span>
      </p>
      <form onSubmit={(e) => { e.preventDefault(); void borrar(); }} noValidate>
        {tieneContrasena ? (
          <>
            <label className="field-label" htmlFor="borrar-password" style={{ color: '#fecaca', fontSize: '13px' }}>Escribí tu contraseña para confirmar</label>
            <input id="borrar-password" className="borrar-campo" type="password" autoComplete="current-password" value={valor}
              onChange={(e) => setValor(e.target.value)} maxLength={200} aria-invalid={!!error} aria-describedby="borrar-error" />
          </>
        ) : (
          <>
            <label className="field-label" htmlFor="borrar-confirmacion" style={{ color: '#fecaca', fontSize: '13px' }}>
              Tu cuenta es de Google: escribí tu nombre de usuario (<strong>{username}</strong>) para confirmar
            </label>
            <input id="borrar-confirmacion" className="borrar-campo" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false}
              value={valor} onChange={(e) => setValor(e.target.value)} maxLength={60} aria-invalid={!!error} aria-describedby="borrar-error" />
          </>
        )}
        <p id="borrar-error" role="alert" style={{ color: '#fca5a5', fontSize: '13px', marginTop: error ? '8px' : 0 }}>{error}</p>
      </form>
    </Hoja>
  );
}
