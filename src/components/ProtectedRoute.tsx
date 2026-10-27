import { Navigate } from 'react-router-dom';
import { useEffect, useState, type ReactElement } from 'react';
import { isAxiosError } from 'axios';
import { clearSession, getToken, isTokenExpired } from '../auth/session';
import { consultarTerminos, marcarTerminosAlDia, terminosAlDia } from '../auth/terminos';
import MultiShell from '../multi/MultiShell';
import AceptarTerminos from './AceptarTerminos';

interface ProtectedRouteProps {
  children: ReactElement;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // El token existe pero ya venció (o no se puede leer): limpiamos y avisamos en el login
  if (isTokenExpired(token)) {
    clearSession();
    return <Navigate to="/login?expired=1" replace />;
  }

  // key: con otro token (otro login) se vuelve a preguntar desde cero
  return <ConTerminos key={token} token={token}>{children}</ConTerminos>;
}

type Estado = { tipo: 'cargando' } | { tipo: 'al-dia' } | { tipo: 'pendientes'; version: string } | { tipo: 'error' };

// Términos y Política de privacidad: si GET /users/me dice terminosPendientes, en lugar de la pantalla va la de
// aceptarlos. Ninguna pantalla privada (ni los juegos ni las salas) se muestra hasta aceptar. Se pregunta una vez
// por sesión (auth/terminos.ts lo recuerda). Un 401 lo maneja el interceptor de axios (vuelve al login).
function ConTerminos({ token, children }: { token: string; children: ReactElement }) {
  const [estado, setEstado] = useState<Estado>(() => (terminosAlDia(token) ? { tipo: 'al-dia' } : { tipo: 'cargando' }));
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (terminosAlDia(token)) return;
    let vigente = true;
    consultarTerminos()
      .then(({ pendientes, version }) => {
        if (!vigente) return;
        if (pendientes) {
          setEstado({ tipo: 'pendientes', version });
        } else {
          marcarTerminosAlDia(token);
          setEstado({ tipo: 'al-dia' });
        }
      })
      .catch((e) => {
        if (vigente && !(isAxiosError(e) && e.response?.status === 401)) setEstado({ tipo: 'error' });
      });
    return () => {
      vigente = false;
    };
  }, [token, intento]);

  if (estado.tipo === 'al-dia') return children;
  if (estado.tipo === 'pendientes') {
    return (
      <AceptarTerminos
        version={estado.version}
        onAceptado={() => {
          marcarTerminosAlDia(token);
          setEstado({ tipo: 'al-dia' });
        }}
      />
    );
  }
  return (
    <MultiShell maxWidth={480}>
      <div className="card" style={{ textAlign: 'center' }} data-testid={estado.tipo === 'error' ? 'terminos-error' : 'terminos-cargando'}>
        {estado.tipo === 'error' ? (
          <>
            <p className="error">No se pudo conectar con el servidor. Puede estar iniciando: probá de nuevo en unos segundos.</p>
            <button type="button" className="ghost-btn" style={{ marginTop: '12px' }}
              onClick={() => { setEstado({ tipo: 'cargando' }); setIntento((n) => n + 1); }}>
              Reintentar
            </button>
          </>
        ) : (
          <div className="spinner" />
        )}
      </div>
    </MultiShell>
  );
}
