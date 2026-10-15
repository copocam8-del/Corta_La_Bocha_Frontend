// Captcha de Cloudflare Turnstile en el registro (frena bots que crean cuentas en masa).
// Docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
// Si VITE_TURNSTILE_SITE_KEY no está definida, no se carga nada y el registro funciona como siempre.

interface TurnstileOptions {
  sitekey: string;
  action?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<TurnstileApi> | null = null;

// Carga el script una sola vez
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile no cargó')));
    script.onerror = () => {
      loading = null; // permitir reintentar
      reject(new Error('No se pudo cargar Turnstile'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

// Site Key del widget (es pública). Si no está definida, no hay captcha.
export const TURNSTILE_SITE_KEY: string | undefined = import.meta.env.VITE_TURNSTILE_SITE_KEY || undefined;

export const CAPTCHA_ERROR = 'No pudimos verificar que seas una persona. Recargá la página y probá de nuevo.';
export const CAPTCHA_TIMEOUT_MS = 20_000;

// Guarda el token que da el widget. Cada token sirve UNA sola vez: después de mandar el formulario (salga bien
// o mal) hay que llamar a reset() para que el widget genere otro.
export class CaptchaToken {
  private token: string | null = null;
  private waiting: ((token: string | null) => void)[] = [];
  onReset?: () => void; // lo pone el widget: reinicia el captcha de Cloudflare

  set(token: string) {
    this.token = token;
    this.flush(token);
  }

  // Error del widget o no cargó el script: quien estaba esperando recibe null
  fail() {
    this.token = null;
    this.flush(null);
  }

  // El token venció (el widget pide otro solo)
  expire() {
    this.token = null;
  }

  // Devuelve el token; si todavía no llegó, lo espera (null si no llega a tiempo o hubo error)
  get(timeoutMs = CAPTCHA_TIMEOUT_MS): Promise<string | null> {
    if (this.token) return Promise.resolve(this.token);
    return new Promise((resolve) => {
      const done = (token: string | null) => {
        clearTimeout(timer);
        resolve(token);
      };
      const timer = setTimeout(() => {
        this.waiting = this.waiting.filter((w) => w !== done);
        resolve(null);
      }, timeoutMs);
      this.waiting.push(done);
    });
  }

  reset() {
    this.token = null;
    this.onReset?.();
  }

  private flush(token: string | null) {
    const waiting = this.waiting;
    this.waiting = [];
    for (const w of waiting) w(token);
  }
}
