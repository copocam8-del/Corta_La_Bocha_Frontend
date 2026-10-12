import { useEffect, useState, type CSSProperties } from 'react';
import { FRASE_MS, FRASES, fraseActual, siguienteFrase } from './frases';

// Frase futbolera que cambia sola cada unos segundos, con un fundido suave. Recibe el mismo estilo
// que tenía el texto al que reemplaza (el viejo cartel de la temporada).
export default function FraseRotativa({ style }: { style?: CSSProperties }) {
  const [i, setI] = useState(fraseActual);

  useEffect(() => {
    const id = setInterval(() => setI((n) => siguienteFrase(n)), FRASE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fraseIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        .frase-rotativa { animation: fraseIn 0.5s ease both; }
        @media (prefers-reduced-motion: reduce) { .frase-rotativa { animation: none; } }
      `}</style>
      {/* key: al cambiar la frase se vuelve a animar. aria-live off: es decorativa, no la lee a cada rato */}
      {/* Alto fijo de dos renglones: en el celular las largas ocupan dos y así la pantalla no salta al cambiar */}
      <p key={i} className="frase-rotativa" data-testid="frase-rotativa" aria-live="off" style={{
        ...style, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center',
        lineHeight: 1.35, minHeight: '2.7em',
      }}>
        {FRASES[i]}
      </p>
    </>
  );
}
