import { useEffect, useRef } from 'react';
import { CaptchaToken, loadTurnstile, TURNSTILE_SITE_KEY } from '../auth/turnstile';

// Widget de Cloudflare Turnstile (invisible: sólo aparece si Cloudflare necesita que la persona haga algo).
// Sin site key no dibuja nada. El token queda en `captcha` (ver CaptchaToken).
export default function TurnstileWidget({ captcha, siteKey = TURNSTILE_SITE_KEY }: { captcha: CaptchaToken; siteKey?: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    let widgetId: string | null = null;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId = turnstile.render(container.current, {
          sitekey: siteKey,
          action: 'register',
          appearance: 'interaction-only',
          language: 'es',
          theme: 'dark',
          size: 'flexible',
          callback: (token) => captcha.set(token),
          'error-callback': () => captcha.fail(),
          'expired-callback': () => captcha.expire(),
          'timeout-callback': () => captcha.expire(),
        });
        captcha.onReset = () => {
          if (widgetId) turnstile.reset(widgetId);
        };
      })
      .catch(() => captcha.fail());

    return () => {
      cancelled = true;
      captcha.onReset = undefined;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [captcha, siteKey]);

  if (!siteKey) return null;
  return <div ref={container} data-testid="turnstile" style={{ display: 'flex', justifyContent: 'center' }} />;
}
