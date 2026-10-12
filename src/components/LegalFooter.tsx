import { Link, useLocation } from 'react-router-dom';

// Links a las páginas legales para el pie de Login, Register y Dashboard.
// variant "dark": pantallas con fondo de cancha; "light": pantallas con fondo claro.
export default function LegalFooter({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const color = variant === 'dark' ? 'rgba(180,255,205,0.55)' : '#6b7280';
  const linkStyle = { color, textDecoration: 'underline', textUnderlineOffset: '2px' };
  // Para que el botón "Volver" de la página legal traiga de vuelta acá
  const state = { from: useLocation().pathname };
  return (
    <nav
      aria-label="Información legal"
      style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '14px', fontSize: '11px', color }}
    >
      <Link to="/privacidad" state={state} style={linkStyle}>Privacidad</Link>
      <Link to="/terminos" state={state} style={linkStyle}>Términos</Link>
      <Link to="/cookies" state={state} style={linkStyle}>Cookies</Link>
    </nav>
  );
}
