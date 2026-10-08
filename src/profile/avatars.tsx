import { AVATARS, getAvatar } from './avatarData';

// Componentes de avatar (los datos del set están en avatarData.tsx)

// Muestra el avatar elegido, o la inicial del nombre si no eligió ninguno
export function Avatar({ id, fallback, size = 84 }: { id?: string | null; fallback: string; size?: number }) {
  const avatar = getAvatar(id);
  const base = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  } as const;

  if (!avatar) {
    return (
      <div aria-hidden="true" style={{
        ...base, background: 'rgba(57,255,140,0.1)', color: '#39ff8c',
        fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: size * 0.4,
      }}>
        {fallback.charAt(0).toUpperCase()}
      </div>
    );
  }
  const { Icon } = avatar;
  return (
    <div role="img" aria-label={`Avatar: ${avatar.label}`} style={{
      ...base, background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`,
    }}>
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} color="#ffffff" />
    </div>
  );
}

// Grilla para elegir avatar
export function AvatarPicker({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Elegí tu avatar" style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: '8px',
    }}>
      {AVATARS.map((a) => {
        const selected = a.id === value;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={selected}
            title={a.label}
            onClick={() => onChange(a.id)}
            style={{
              background: 'transparent', cursor: 'pointer', padding: '3px', borderRadius: '50%',
              border: selected ? '2px solid #39ff8c' : '2px solid transparent',
              boxShadow: selected ? '0 0 12px rgba(57,255,140,0.55)' : 'none',
              display: 'flex', justifyContent: 'center',
            }}
          >
            <Avatar id={a.id} fallback={a.label} size={42} />
          </button>
        );
      })}
    </div>
  );
}
