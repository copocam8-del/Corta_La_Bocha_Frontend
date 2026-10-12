import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AVATARS, getAvatar } from './avatarData';
import { buscarHinchas, getHincha, HINCHAS, ordenarPorClub } from './hinchas';
import HinchaSvg from './Hincha';

// Componentes de avatar: los clásicos (íconos, avatarData.ts) y los hinchas de clubes (hinchas.ts +
// Hincha.tsx). Los ids de los dos sets tienen que coincidir con AVATAR_IDS del backend.

// Muestra el avatar elegido, o la inicial del nombre si no eligió ninguno.
// Sirve en cualquier tamaño: chiquito (ranking, salas) o grande (perfil).
export function Avatar({ id, fallback, size = 84 }: { id?: string | null; fallback: string; size?: number }) {
  const base = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  } as const;

  const hincha = getHincha(id);
  if (hincha) {
    return (
      <div role="img" aria-label={`Avatar: hincha de ${hincha.club}`} data-avatar={hincha.id} style={{ ...base, background: hincha.fondo }}>
        <HinchaSvg hincha={hincha} size={size} />
      </div>
    );
  }

  const avatar = getAvatar(id);
  if (!avatar) {
    return (
      <div aria-hidden="true" style={{
        ...base, background: 'rgba(57,255,140,0.1)', color: '#39ff8c',
        fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: size * 0.4,
      }}>
        {(fallback || '?').charAt(0).toUpperCase()}
      </div>
    );
  }
  const { Icon } = avatar;
  return (
    <div role="img" aria-label={`Avatar: ${avatar.label}`} data-avatar={avatar.id} style={{
      ...base, background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`,
    }}>
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} color="#ffffff" />
    </div>
  );
}

const SECCION = {
  fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
  color: 'rgba(124,255,178,0.6)', margin: '4px 0 6px',
} as const;

function Opcion({ id, label, selected, onChange, size, conNombre }: {
  id: string; label: string; selected: boolean; onChange: (id: string) => void; size: number; conNombre?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      title={label}
      onClick={() => onChange(id)}
      style={{
        background: selected ? 'rgba(57,255,140,0.08)' : 'transparent', cursor: 'pointer', padding: '4px 2px',
        borderRadius: conNombre ? '12px' : '50%', border: selected ? '2px solid #39ff8c' : '2px solid transparent',
        boxShadow: selected ? '0 0 12px rgba(57,255,140,0.55)' : 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: 0,
      }}
    >
      <Avatar id={id} fallback={label} size={size} />
      {/* El nombre del club va sólo acá, como texto debajo de la miniatura (nunca en el dibujo) */}
      {conNombre && (
        <span style={{
          fontSize: '10px', lineHeight: 1.2, color: selected ? '#39ff8c' : 'rgba(225,255,236,0.8)', textAlign: 'center',
          width: '100%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{label}</span>
      )}
    </button>
  );
}

// Selector de avatar: los clásicos y la sección "Clubes" (hinchas, en orden alfabético, con buscador)
export function AvatarPicker({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  const [busqueda, setBusqueda] = useState('');
  const clubes = useMemo(() => buscarHinchas(busqueda, ordenarPorClub(HINCHAS)), [busqueda]);
  return (
    <div role="radiogroup" aria-label="Elegí tu avatar" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <p style={SECCION}>Clásicos</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: '8px' }}>
        {AVATARS.map((a) => (
          <Opcion key={a.id} id={a.id} label={a.label} selected={a.id === value} onChange={onChange} size={42} />
        ))}
      </div>

      <p style={{ ...SECCION, marginTop: '10px' }}>Clubes</p>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px',
        background: 'rgba(57,255,140,0.04)', border: '1px solid rgba(57,255,140,0.2)',
      }}>
        <Search size={14} color="#7CFFB2" aria-hidden="true" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscá tu club"
          aria-label="Buscar club"
          data-testid="buscar-club"
          style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: '#eafff2', fontSize: '13px' }}
        />
      </label>
      <div data-testid="clubes" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '6px',
        maxHeight: '320px', overflowY: 'auto', paddingRight: '2px',
      }}>
        {clubes.map((h) => (
          <Opcion key={h.id} id={h.id} label={h.club} selected={h.id === value} onChange={onChange} size={60} conNombre />
        ))}
        {clubes.length === 0 && (
          <p style={{ gridColumn: '1 / -1', fontSize: '12px', color: 'rgba(180,255,205,0.6)' }}>No encontramos ese club.</p>
        )}
      </div>
    </div>
  );
}
