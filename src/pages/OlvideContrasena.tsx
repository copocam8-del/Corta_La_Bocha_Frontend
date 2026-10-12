import { useState } from 'react';
import { Mail } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import FieldError from '../components/FieldError';
import BackButton from '../components/BackButton';
import { pedirLinkRecuperacion } from '../api/password';
import { parseAuthError } from '../auth/apiErrors';

// "¿Olvidaste tu contraseña?": se pide el email y el servidor manda un link (vence en 1 hora).
// El mensaje es el mismo exista o no la cuenta.
export default function OlvideContrasena() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(undefined);
    if (!email.trim()) { setFieldError('Ingresá tu email'); return; }
    setCargando(true);
    try {
      setEnviado((await pedirLinkRecuperacion(email.trim())).message);
    } catch (err) {
      const p = parseAuthError(err);
      setFieldError(p.fieldErrors.email);
      if (!p.fieldErrors.email) setError(p.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <MultiShell maxWidth={420}>
      <BackButton to="/login" />
      <div style={{ textAlign: 'center' }}>
        <p className="kicker">Corta La Bocha</p>
        <h1 className="neon-title" style={{ fontSize: '24px', marginTop: '6px' }}>¿Olvidaste tu contraseña?</h1>
      </div>
      <div className="card">
        {enviado ? (
          <p role="status" data-testid="mensaje-enviado" style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(180,255,205,0.9)' }}>{enviado}</p>
        ) : (
          <form onSubmit={(e) => void enviar(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.75)' }}>
              Escribí el email de tu cuenta y te mandamos un link para elegir una contraseña nueva.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#7CFFB2" />
              <input className="grid-input" style={{ textTransform: 'none' }} type="email" placeholder="Email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!fieldError} aria-describedby="olvide-email-error" />
            </label>
            <FieldError id="olvide-email-error" message={fieldError} />
            <button className="main-btn" type="submit" disabled={cargando}>{cargando ? 'Enviando…' : 'Mandame el link'}</button>
          </form>
        )}
        {error && <div className="error" style={{ marginTop: '10px' }}>{error}</div>}
      </div>
    </MultiShell>
  );
}
