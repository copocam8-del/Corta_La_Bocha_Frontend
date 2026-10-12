import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import BackButton from '../components/BackButton';
import FieldError from '../components/FieldError';
import { restablecerContrasena } from '../api/password';
import { validateNewPassword, type FieldErrors } from '../auth/rules';
import { parseAuthError } from '../auth/apiErrors';

// Pantalla del link del mail: elegir la contraseña nueva (mismas reglas que el registro).
export default function RestablecerContrasena() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errores, setErrores] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validateNewPassword(password, confirm);
    setErrores(v);
    if (Object.keys(v).length) return;
    setCargando(true);
    try {
      setListo((await restablecerContrasena(token, password)).message);
    } catch (err) {
      const p = parseAuthError(err);
      setErrores(p.fieldErrors);
      if (!Object.keys(p.fieldErrors).length) setError(p.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <MultiShell maxWidth={420}>
      <BackButton to="/login" />
      <div style={{ textAlign: 'center' }}>
        <p className="kicker">Corta La Bocha</p>
        <h1 className="neon-title" style={{ fontSize: '24px', marginTop: '6px' }}>Elegí tu contraseña nueva</h1>
      </div>
      <div className="card">
        {!token ? (
          <div className="error">El link no es válido. Pedí uno nuevo desde "¿Olvidaste tu contraseña?".</div>
        ) : listo ? (
          <>
            <p role="status" data-testid="contrasena-cambiada" style={{ fontSize: '14px', color: 'rgba(180,255,205,0.9)' }}>{listo}</p>
            <Link to="/login" className="main-btn" style={{ marginTop: '12px', textDecoration: 'none' }}>Iniciar sesión</Link>
          </>
        ) : (
          <form onSubmit={(e) => void enviar(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#7CFFB2" />
              <input className="grid-input" style={{ textTransform: 'none' }} type="password" placeholder="Contraseña nueva (8 a 72 caracteres)"
                autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errores.password}
                aria-describedby="nueva-error" />
            </label>
            <FieldError id="nueva-error" message={errores.password} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#7CFFB2" />
              <input className="grid-input" style={{ textTransform: 'none' }} type="password" placeholder="Repetila"
                autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={!!errores.confirm}
                aria-describedby="confirm-error" />
            </label>
            <FieldError id="confirm-error" message={errores.confirm} />
            <button className="main-btn" type="submit" disabled={cargando}>{cargando ? 'Guardando…' : 'Guardar contraseña'}</button>
          </form>
        )}
        {error && (
          <div className="error" style={{ marginTop: '10px' }}>
            {error} <Link to="/olvide-contrasena" style={{ color: '#fca5a5' }}>Pedir otro link</Link>
          </div>
        )}
      </div>
    </MultiShell>
  );
}
