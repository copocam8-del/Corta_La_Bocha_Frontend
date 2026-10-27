import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ExternalLink, FileCheck2, FileText, LogOut, ShieldCheck } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import { BarraAbajo, Encabezado, EstilosJuego } from '../games/ui/JuegoUI';
import { clearSession } from '../auth/session';
import { aceptarTerminos } from '../auth/terminos';

// Pantalla que aparece en cualquier pantalla privada si GET /users/me dice terminosPendientes (usuarios de antes,
// los que entraron con Google y todos cuando cambia la versión). No deja jugar ni ir a otro lado hasta aceptar.
// Las páginas legales se abren en otra pestaña para no perder esta. Estilo de la app: vidrio verde y botón fijo abajo.

const CSS = `
  .terminos-link { text-decoration: none; }
  .terminos-casilla { cursor: pointer; user-select: none; }
  .terminos-casilla input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .terminos-tilde { width: 26px; height: 26px; flex-shrink: 0; border-radius: 7px; display: flex; align-items: center; justify-content: center;
    border: 1.5px solid rgba(57,255,140,0.55); background: rgba(10,30,18,0.6); color: #04210f; transition: all 0.15s ease; }
  .terminos-casilla input:checked + .terminos-tilde { background: #39ff8c; border-color: #39ff8c; box-shadow: 0 0 12px rgba(57,255,140,0.5); }
  .terminos-casilla input:focus-visible + .terminos-tilde { outline: 2px solid #39ff8c; outline-offset: 2px; }
`;

export default function AceptarTerminos({ version, onAceptado }: { version: string; onAceptado: () => void }) {
  const navigate = useNavigate();
  const [acepto, setAcepto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aceptar = async () => {
    if (!acepto || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      await aceptarTerminos(version);
      onAceptado();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      setError(typeof msg === 'string' && msg !== 'Datos inválidos' ? msg : 'No se pudo guardar. Revisá tu conexión y probá de nuevo.');
      setEnviando(false);
    }
  };

  const cerrarSesion = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <MultiShell maxWidth={480}>
      <EstilosJuego />
      <style>{CSS}</style>
      <div data-testid="aceptar-terminos" style={{ display: 'contents' }}>
        <Encabezado icono={FileCheck2} kicker="Corta La Bocha" titulo="Actualizamos los Términos y la Política de privacidad"
          texto="Para seguir jugando, leelos y aceptalos. Se abren en otra pestaña, así no perdés esta." />

        <div className="card ui-filas">
          <a className="ui-fila terminos-link" href="/terminos" target="_blank" rel="noopener noreferrer" data-testid="link-terminos">
            <span className="ui-fila-icono"><FileText size={19} /></span>
            <span className="ui-fila-nombre">Términos y condiciones<span className="ui-fila-sub">Se abre en otra pestaña</span></span>
            <span className="ui-fila-valor"><ExternalLink size={18} /></span>
          </a>
          <a className="ui-fila terminos-link" href="/privacidad" target="_blank" rel="noopener noreferrer" data-testid="link-privacidad">
            <span className="ui-fila-icono"><ShieldCheck size={19} /></span>
            <span className="ui-fila-nombre">Política de privacidad<span className="ui-fila-sub">Se abre en otra pestaña</span></span>
            <span className="ui-fila-valor"><ExternalLink size={18} /></span>
          </a>
          <label className="ui-fila terminos-casilla">
            <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} data-testid="casilla-terminos" />
            <span className="terminos-tilde" aria-hidden="true">{acepto && <Check size={18} strokeWidth={3} />}</span>
            <span className="ui-fila-nombre" style={{ fontSize: '15px' }}>Leí y acepto los Términos y la Política de privacidad</span>
          </label>
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="button" className="ghost-btn" onClick={cerrarSesion} data-testid="cerrar-sesion">
          <LogOut size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Cerrar sesión
        </button>

        <BarraAbajo>
          {!acepto && <p className="ui-barra-nota">Marcá la casilla para seguir.</p>}
          <button type="button" className="ui-boton" data-testid="aceptar-y-seguir" disabled={!acepto || enviando} onClick={() => void aceptar()}>
            <Check size={20} strokeWidth={2.5} /> {enviando ? 'Guardando…' : 'Aceptar y seguir'}
          </button>
        </BarraAbajo>
      </div>
    </MultiShell>
  );
}
