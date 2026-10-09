import { Link } from 'react-router-dom';

// Links a las páginas legales para el pie de Login, Register y Dashboard.
// variant "dark": pantallas con fondo de cancha; "light": pantallas con fondo claro.
export default function LegalFooter({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const color = variant === 'dark' ? 'rgba(180,255,205,0.55)' : '#6b7280';
  const linkStyle = { color, textDecoration: 'underline', textUnderlineOffset: '2px' };
  return (
    <nav
      aria-label="Información legal"
      style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '14px', fontSize: '11px', color }}
    >
      <Link to="/privacidad" style={linkStyle}>Privacidad</Link>
      <Link to="/terminos" style={linkStyle}>Términos</Link>
      <Link to="/cookies" style={linkStyle}>Cookies</Link>
    </nav>
  );
}
