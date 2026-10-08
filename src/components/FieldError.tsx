// Mensaje de error que va debajo de un input del formulario
export default function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      style={{ color: '#fca5a5', fontSize: '11px', margin: '-4px 0 0 4px', animation: 'fadeIn 0.3s ease' }}
    >
      {message}
    </p>
  );
}
