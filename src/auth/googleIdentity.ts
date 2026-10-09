// Carga del script de Google Identity Services (el botón "Continuar con Google").
// Docs: https://developers.google.com/identity/gsi/web

export interface GoogleCredentialResponse {
  credential: string; // ID token (JWT) que se manda al backend: POST /auth/google
}

interface GoogleAccountsId {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
    cancel_on_tap_outside?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with';
      shape?: 'rectangular' | 'pill';
      width?: number;
      locale?: string;
    },
  ): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let loading: Promise<GoogleAccountsId> | null = null;

// Carga el script una sola vez (aunque haya dos botones en pantalla)
export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error('Google no cargó'));
    script.onerror = () => {
      loading = null; // permitir reintentar
      reject(new Error('No se pudo cargar Google'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

// Client ID de Google para el frontend. Si no está definido, el botón no se muestra.
export const GOOGLE_CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;
