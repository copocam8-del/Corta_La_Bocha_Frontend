import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { saveSession } from '../auth/session';
import { parseAuthError } from '../auth/apiErrors';
import { GOOGLE_CLIENT_ID, loadGoogleIdentity, type GoogleCredentialResponse } from '../auth/googleIdentity';

interface GoogleButtonProps {
  // "signin" en Login ("Continuar con Google"), "signup" en Register ("Registrarte con Google")
  mode?: 'signin' | 'signup';
  // Se puede pasar para tests; por defecto sale de VITE_GOOGLE_CLIENT_ID
  clientId?: string;
}

// Botón oficial de Google. Si no hay Client ID configurado no se muestra nada (y nada se rompe).
export default function GoogleButton({ mode = 'signin', clientId = GOOGLE_CLIENT_ID }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    const onCredential = async ({ credential }: GoogleCredentialResponse) => {
      setError('');
      setLoading(true);
      try {
        const res = await api.post('/auth/google', { credential });
        saveSession(res.data);
        navigate('/welcome');
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 503) setError('El inicio de sesión con Google no está disponible por ahora.');
        else if (status === 401) setError('No se pudo verificar tu cuenta de Google. Probá de nuevo.');
        else {
          const parsed = parseAuthError(err);
          setError(parsed.message || Object.values(parsed.fieldErrors)[0] || 'No se pudo entrar con Google.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadGoogleIdentity()
      .then((gis) => {
        if (cancelled || !containerRef.current) return;
        gis.initialize({ client_id: clientId, callback: onCredential, cancel_on_tap_outside: true });
        gis.renderButton(containerRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
          locale: 'es',
          width: Math.min(containerRef.current.offsetWidth || 320, 400),
        });
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar el botón de Google.');
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, mode, navigate]);

  if (!clientId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(180,255,205,0.45)', fontSize: '11px' }}>
        <span style={{ flex: 1, height: '1px', background: 'rgba(57,255,140,0.18)' }} />
        o
        <span style={{ flex: 1, height: '1px', background: 'rgba(57,255,140,0.18)' }} />
      </div>
      <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '44px', opacity: loading ? 0.5 : 1 }} />
      {loading && <p role="status" style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(180,255,205,0.7)' }}>Entrando con Google...</p>}
      {error && <p role="alert" style={{ textAlign: 'center', fontSize: '12px', color: '#fca5a5' }}>{error}</p>}
    </div>
  );
}
