import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ConfirmText } from './abandonar';

// Botón "Volver" (flecha + texto), igual en todas las pantallas: fijo arriba a la izquierda.
// Lleva a la pantalla anterior LÓGICA ("to"), no al historial del navegador: menú del juego →
// Dashboard, juego → menú de ese juego, sala → menú del juego…
//
// Si "confirm" está, antes de salir pregunta (ej. en medio de una partida). "onLeave" corre antes de
// navegar (ej. avisar al servidor que abandonaste o rendirte).


export const CSS = `
  .back-fixed {
    position: fixed; z-index: 50;
    top: calc(12px + env(safe-area-inset-top, 0px)); left: calc(12px + env(safe-area-inset-left, 0px));
    display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 8px 14px 8px 10px;
    background: rgba(4,20,11,0.72); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(57,255,140,0.3); border-radius: 999px; cursor: pointer;
    color: #7CFFB2; font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; transition: all 0.2s ease; box-shadow: 0 6px 20px -8px rgba(0,0,0,0.7);
  }
  .back-fixed:hover { border-color: #39ff8c; background: rgba(57,255,140,0.1); box-shadow: 0 0 14px rgba(57,255,140,0.25); color: #eafff2; }
  .back-fixed:focus-visible { outline: 2px solid #39ff8c; outline-offset: 2px; }
  .confirm-backdrop {
    position: fixed; inset: 0; z-index: 100; background: rgba(0,4,2,0.72); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .confirm-box {
    width: 100%; max-width: 360px; background: rgba(4,20,11,0.95); border: 1px solid rgba(57,255,140,0.3);
    border-top: 2px solid #fbbf24; border-radius: 16px; padding: 20px; color: #eafff2; font-family: 'Inter', sans-serif;
    box-shadow: 0 30px 60px -20px rgba(0,0,0,0.85); text-align: center;
  }
  .confirm-box h2 { font-family: 'Oswald', sans-serif; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; }
  .confirm-box p { font-size: 14px; color: rgba(180,255,205,0.8); line-height: 1.5; margin: 0 0 16px; }
  .confirm-actions { display: flex; gap: 8px; }
  .confirm-actions button {
    flex: 1; min-height: 44px; border-radius: 10px; cursor: pointer; font-family: 'Oswald', sans-serif;
    font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
  }
  .confirm-stay { background: linear-gradient(135deg, #0fae5d, #39ff8c); color: #04210f; border: none; }
  .confirm-leave { background: rgba(239,68,68,0.12); color: #fca5a5; border: 1px solid rgba(239,68,68,0.5); }
`;

// Ventana "¿Seguro?" con el estilo de la app (sirve también para otros avisos)
export function ConfirmDialog({ text, onConfirm, onCancel, busy = false }: {
  text: ConfirmText;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <div className="confirm-backdrop" role="presentation" onClick={onCancel}>
      <div className="confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-msg"
        onClick={(e) => e.stopPropagation()} data-testid="confirmar-salida">
        <h2 id="confirm-title">{text.title}</h2>
        <p id="confirm-msg">{text.message}</p>
        <div className="confirm-actions">
          <button className="confirm-stay" onClick={onCancel} autoFocus disabled={busy}>Seguir jugando</button>
          <button className="confirm-leave" onClick={onConfirm} disabled={busy} data-testid="confirmar-abandonar">
            {text.confirmLabel ?? 'Salir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BackButton({
  to,
  label = 'Volver',
  confirm,
  onLeave,
  icon,
}: {
  to: string;
  label?: string;
  confirm?: ConfirmText | null;
  onLeave?: () => Promise<unknown> | unknown;
  icon?: ReactNode;
}) {
  const navigate = useNavigate();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  const leave = async () => {
    setBusy(true);
    try {
      await onLeave?.();
    } catch {
      // Si falla el aviso al servidor, igual se sale (el servidor lo resuelve por su cuenta)
    }
    setBusy(false);
    setAsking(false);
    navigate(to);
  };

  const contenido = (
    <>
      <style>{CSS}</style>
      <button type="button" className="back-fixed" data-testid="volver" aria-label={label}
        onClick={() => (confirm ? setAsking(true) : void leave())}>
        {icon ?? <ArrowLeft size={16} strokeWidth={2.2} />} {label}
      </button>
      {asking && confirm && (
        <ConfirmDialog text={confirm} busy={busy} onConfirm={() => void leave()} onCancel={() => setAsking(false)} />
      )}
    </>
  );
  // Va directo al <body>: si quedara adentro de un contenedor con animación (transform), "fixed" se
  // ubicaría respecto de ese contenedor y no arriba a la izquierda de la pantalla
  return typeof document === 'undefined' ? contenido : createPortal(contenido, document.body);
}
