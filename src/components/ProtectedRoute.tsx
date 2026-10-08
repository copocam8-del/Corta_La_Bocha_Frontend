import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { clearSession, getToken, isTokenExpired } from '../auth/session';

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

  return children;
}
