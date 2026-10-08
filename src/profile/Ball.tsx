// Pelota dibujada a mano (lucide no tiene una de fútbol)
export default function Ball({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4" />
      <polygon points="32,19 44.4,28 39.6,42.5 24.4,42.5 19.6,28" fill={color} />
      <g stroke={color} strokeWidth="3.5">
        <line x1="32" y1="19" x2="32" y2="6" />
        <line x1="44.4" y1="28" x2="56.7" y2="24" />
        <line x1="39.6" y1="42.5" x2="47.2" y2="53" />
        <line x1="24.4" y1="42.5" x2="16.8" y2="53" />
        <line x1="19.6" y1="28" x2="7.3" y2="24" />
      </g>
    </svg>
  );
}
