import { useState } from 'react';
import { Send } from 'lucide-react';

// Partes del ahorcado que usan el juego solo y el multijugador: la palabra, el teclado en pantalla (con Ñ) y el
// campo para arriesgar. Sólo muestran: las letras las corrige el servidor.

const TECLADO = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];

export const AHORCADO_CSS = `
  .ah-mascara { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 16px 12px; }
  .ah-letra { min-width: 26px; padding: 4px 2px; text-align: center; border-bottom: 2px solid rgba(57,255,140,0.6);
    font-family: 'Oswald', sans-serif; font-size: 26px; font-weight: 700; color: #eafff2; text-shadow: 0 0 12px rgba(57,255,140,0.35); }
  .ah-teclado { display: flex; flex-direction: column; gap: 6px; align-items: center; }
  .ah-fila { display: flex; gap: 4px; width: 100%; justify-content: center; }
  .ah-tecla { flex: 1 1 0; min-width: 0; max-width: 44px; height: 48px; border-radius: 10px; cursor: pointer; padding: 0;
    font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 700; color: #eafff2;
    border: 1px solid rgba(57,255,140,0.28); background: rgba(10,30,18,0.6); transition: all 0.15s ease; }
  .ah-tecla.ok { border-color: #39ff8c; background: rgba(57,255,140,0.2); color: #39ff8c; box-shadow: 0 0 10px rgba(57,255,140,0.3); }
  .ah-tecla.mal { border-color: rgba(239,68,68,0.5); background: rgba(239,68,68,0.12); color: rgba(252,165,165,0.6); }
  .ah-tecla:disabled { cursor: default; }
  .ah-tecla:focus-visible { outline: 2px solid #39ff8c; outline-offset: 2px; }
  .ah-tecla:active:not(:disabled) { transform: scale(0.94); }
  @media (hover: hover) { .ah-tecla:hover:not(:disabled) { border-color: #39ff8c; background: rgba(57,255,140,0.1); } }
`;

// La palabra: "_" es una letra que falta (se ve un puntito transparente) y " " un espacio
export function Mascara({ letras, perdio = false }: { letras: string[]; perdio?: boolean }) {
  return (
    <div data-testid="mascara" aria-label="Palabra a adivinar" className="card ah-mascara">
      {letras.map((c, i) =>
        c === ' ' ? <span key={i} style={{ width: '14px' }} /> : (
          <span key={i} className="ah-letra" style={c === '_' ? { color: 'transparent', textShadow: 'none' } : perdio ? { color: '#fca5a5' } : undefined}>
            {c === '_' ? '·' : c}
          </span>
        ),
      )}
    </div>
  );
}

export function Teclado({ adivinadas, erradas, onLetra, bloqueado = false }: {
  adivinadas: string[];
  erradas: string[];
  onLetra: (l: string) => void;
  bloqueado?: boolean;
}) {
  return (
    <div data-testid="teclado" className="ah-teclado">
      {TECLADO.map((fila) => (
        <div key={fila} className="ah-fila">
          {[...fila].map((l) => {
            const ok = adivinadas.includes(l);
            const mal = erradas.includes(l);
            return (
              <button key={l} type="button" data-letra={l} onClick={() => onLetra(l)} disabled={ok || mal || bloqueado}
                aria-label={`Letra ${l}`} className={`ah-tecla${ok ? ' ok' : mal ? ' mal' : ''}`}>{l}</button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// "¿La sabés?": arriesgar la palabra entera (si le errás, cuenta como un error)
export function Arriesgar({ onArriesgar, bloqueado = false }: { onArriesgar: (texto: string) => void; bloqueado?: boolean }) {
  const [intento, setIntento] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (intento.trim()) onArriesgar(intento); setIntento(''); }}
      style={{ display: 'flex', gap: '8px' }}>
      <input className="ui-campo" placeholder="¿La sabés? Arriesgá" value={intento} aria-label="Arriesgar la respuesta"
        onChange={(e) => setIntento(e.target.value)} maxLength={60} autoComplete="off" style={{ flex: 1 }} />
      <button className="ui-chico" style={{ minWidth: '50px' }} type="submit" disabled={bloqueado || !intento.trim()} aria-label="Arriesgar">
        <Send size={18} />
      </button>
    </form>
  );
}
