import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Marco común de las páginas legales (/privacidad, /terminos, /cookies),
// con el mismo estilo de cancha nocturna del Login.

const LEGAL_LAST_UPDATE = '8 de octubre de 2026';

const LEGAL_LINKS = [
  { to: '/privacidad', label: 'Privacidad' },
  { to: '/terminos', label: 'Términos' },
  { to: '/cookies', label: 'Cookies' },
];

// Marca un dato que el equipo todavía tiene que completar, ej. <Falta>EMAIL DE CONTACTO</Falta>
export function Falta({ children }: { children: ReactNode }) {
  return (
    <mark style={{
      background: 'rgba(250,204,21,0.18)', color: '#fde68a',
      border: '1px dashed rgba(250,204,21,0.6)', borderRadius: '4px', padding: '0 4px',
    }}>[{children}]</mark>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: '26px' }}>
      <h2 style={{
        fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 600,
        letterSpacing: '0.5px', color: '#7CFFB2', margin: '0 0 10px', textTransform: 'uppercase',
      }}>{title}</h2>
      {children}
    </section>
  );
}

export default function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        .legal-body p, .legal-body li { font-size: 14px; line-height: 1.65; color: rgba(225,255,236,0.86); }
        .legal-body p { margin: 0 0 10px; }
        .legal-body ul { margin: 0 0 10px; padding-left: 20px; }
        .legal-body li { margin-bottom: 6px; }
        .legal-body strong { color: #eafff2; }
        .legal-body a { color: #7CFFB2; }
        .legal-body table { width: 100%; border-collapse: collapse; margin: 6px 0 12px; font-size: 13px; }
        .legal-body th, .legal-body td {
          text-align: left; padding: 8px 10px; vertical-align: top;
          border-bottom: 1px solid rgba(57,255,140,0.18); color: rgba(225,255,236,0.86);
        }
        .legal-body th { color: #7CFFB2; font-weight: 600; }
        .legal-nav a { color: rgba(180,255,205,0.7); text-decoration: none; font-size: 13px; padding: 4px 10px; border-radius: 999px; }
        .legal-nav a.active { color: #04210f; background: #39ff8c; font-weight: 600; }
      `}</style>

      <div style={{
        minHeight: '100vh', padding: '32px 16px 48px',
        background: `
          radial-gradient(ellipse 90% 50% at 50% 0%, rgba(57,255,140,0.18) 0%, transparent 60%),
          repeating-linear-gradient(115deg, #031c0e 0px, #031c0e 80px, #042a15 80px, #042a15 160px)`,
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#7CFFB2', textDecoration: 'none', fontSize: '13px',
            }}>
              <ArrowLeft size={15} /> Corta la bocha
            </Link>
            <nav className="legal-nav" aria-label="Páginas legales" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {LEGAL_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
            </nav>
          </div>

          <article className="legal-body" style={{
            marginTop: '18px',
            background: 'rgba(4,20,11,0.72)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(57,255,140,0.3)', borderTop: '2px solid rgba(57,255,140,0.7)',
            borderRadius: '16px', padding: 'clamp(20px, 4vw, 36px)',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
          }}>
            <h1 style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700,
              color: '#eafff2', textTransform: 'uppercase', letterSpacing: '1px', margin: 0,
              textShadow: '0 0 18px rgba(57,255,140,0.45)',
            }}>{title}</h1>
            <p style={{ fontSize: '12px', color: 'rgba(180,255,205,0.6)', marginTop: '6px' }}>
              Última actualización: {LEGAL_LAST_UPDATE}
            </p>
            {children}
          </article>
        </div>
      </div>
    </>
  );
}
