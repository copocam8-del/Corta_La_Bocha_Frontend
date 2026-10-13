import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AVATARS, getAvatar } from './avatarData';
import { buscarHinchas, getHincha, HINCHAS, nombresDe, ordenarPorClub } from './hinchas';
import HinchaSvg, { CHICO } from './Hincha';
import type { Hincha } from './hinchas';

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
  if (hincha) return <HinchaAvatar hincha={hincha} size={size} />;

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

// Hinchas ilustrados: una imagen por avatar en public/avatars/hinchas/<id>.webp (384×384, el círculo de color
// toca el borde). Si la imagen no carga, se usa el dibujo SVG de Hincha.tsx como respaldo.
export const hinchaImagen = (id: string) => `/avatars/hinchas/${id}.webp`;
// Chiquito (ranking, salas, marcador): se agranda la imagen y se centra en la cara y el pecho
const ZOOM_CHICO = 1.9;
const CENTRO_CHICO = { x: 0.53, y: 0.31 }; // punto de la imagen (0 a 1) que queda en el centro

function HinchaAvatar({ hincha, size }: { hincha: Hincha; size: number }) {
  const [sinImagen, setSinImagen] = useState(false);
  const lado = size < CHICO ? size * ZOOM_CHICO : size;
  const centro = size < CHICO ? CENTRO_CHICO : { x: 0.5, y: 0.5 };
  return (
    <div
      role="img"
      aria-label={`Avatar: hincha de ${nombresDe(hincha).join(', ')}`}
      data-avatar={hincha.id}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', background: hincha.fondo,
      }}
    >
      {sinImagen ? (
        <HinchaSvg hincha={hincha} size={size} />
      ) : (
        <img
          src={hinchaImagen(hincha.id)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setSinImagen(true)}
          style={{
            position: 'absolute', display: 'block', width: lado, height: lado, maxWidth: 'none',
            left: size / 2 - centro.x * lado, top: size / 2 - centro.y * lado,
          }}
        />
      )}
    </div>
  );
}

const SECCION = {
  fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
  color: 'rgba(124,255,178,0.6)', margin: '4px 0 6px',
} as const;

// Una opción del selector: sólo la miniatura. El nombre (del club y de los otros clubes con la misma
// camiseta) no se dibuja: va en title (al pasar el mouse) y en aria-label (lectores de pantalla).
function Opcion({ id, label, otros, selected, onChange, size }: {
  id: string; label: string; otros?: string[]; selected: boolean; onChange: (id: string) => void; size: number;
}) {
  const nombre = [label, ...(otros ?? [])].join(' · ');
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={nombre}
      title={nombre}
      onClick={() => onChange(id)}
      style={{
        background: 'transparent', cursor: 'pointer', padding: '3px', borderRadius: '50%',
        border: selected ? '2px solid #39ff8c' : '2px solid transparent',
        boxShadow: selected ? '0 0 12px rgba(57,255,140,0.55)' : 'none',
        display: 'flex', justifyContent: 'center', minWidth: 0,
      }}
    >
      <Avatar id={id} fallback={label} size={size} />
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
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: '6px',
        maxHeight: '320px', overflowY: 'auto', paddingRight: '2px',
      }}>
        {clubes.map((h) => (
          <Opcion key={h.id} id={h.id} label={h.club} otros={h.otros} selected={h.id === value} onChange={onChange} size={60} />
        ))}
        {clubes.length === 0 && (
          <p style={{ gridColumn: '1 / -1', fontSize: '12px', color: 'rgba(180,255,205,0.6)' }}>No encontramos ese club.</p>
        )}
      </div>
    </div>
  );
}
