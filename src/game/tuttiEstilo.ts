// Estilo propio de la partida de Tutti Frutti (solo y multijugador): la letra, el reloj y la grilla de categorías. Lo
// demás es el formato común de los juegos (games/ui). La grilla es una tarjeta por categoría que se acomoda al ancho:
// en el celular van de a dos (nunca hay scroll horizontal) y en la compu entran todas en una o dos filas (.ui-ancho).
export const TF_CSS = `
  .tf-cabecera { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .tf-dato { font-family: 'Oswald', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(180,255,205,0.6); }
  .tf-letra { width: 72px; height: 72px; margin: 0 auto 4px; display: flex; align-items: center; justify-content: center; border-radius: 16px;
    background: rgba(4,20,11,0.85); border: 2px solid rgba(57,255,140,0.6); box-shadow: 0 0 24px rgba(57,255,140,0.3);
    font-family: 'Oswald', sans-serif; font-size: 48px; font-weight: 700; color: #eafff2; text-shadow: 0 0 20px rgba(57,255,140,0.8);
    animation: letterPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
  .tf-reloj { font-family: 'Oswald', sans-serif; font-size: 42px; font-weight: 700; line-height: 1; }
  .tf-barra-tiempo { height: 4px; background: rgba(57,255,140,0.1); border-radius: 2px; overflow: hidden; }
  .tf-grilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 10px; }
  .tf-celda { display: flex; flex-direction: column; gap: 8px; min-width: 0; padding: 12px; border-radius: 14px;
    background: rgba(4,20,11,0.66); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(57,255,140,0.25); border-top: 2px solid rgba(57,255,140,0.6); }
  .tf-cat { font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    color: #7CFFB2; line-height: 1.2; min-height: 2.4em; display: flex; align-items: flex-end; overflow-wrap: anywhere; }
  .tf-celda .ui-campo { min-height: 46px; padding: 0 12px; }
  .tf-celda .ui-campo:disabled { opacity: 0.6; }
  .tf-ia { display: flex; align-items: center; gap: 6px; min-height: 18px; font-size: 12px; color: rgba(255,255,255,0.5); overflow-wrap: anywhere; }
  @keyframes tfAparece { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  .tf-aparece { animation: tfAparece 0.4s ease both; }
  @media (prefers-reduced-motion: reduce) { .tf-letra, .tf-aparece { animation: none; } }
`;
