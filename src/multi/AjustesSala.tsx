import { Gauge, Repeat, Shapes, Timer } from 'lucide-react';
import { AjusteElegible } from '../games/ui/JuegoUI';
import { tiempoLabel, type MultiConfig } from '../games/multiConfig';

// Opciones de una sala como lista de ajustes (temática, dificultad, rondas y tiempo; cada juego tiene las suyas en
// multiConfig). Las usan "Crear sala" y la sala de espera. "deshabilitado": sólo muestra los valores (no sos el anfitrión).
export interface AjustesDeSala {
  tematica: string;
  dificultad?: string;
  rounds: number;
  seconds: number;
}

export default function AjustesSala({ config, ajustes, onCambiar, deshabilitado = false }: {
  config: MultiConfig;
  ajustes: AjustesDeSala;
  onCambiar: (cambio: Partial<AjustesDeSala>) => void;
  deshabilitado?: boolean;
}) {
  return (
    <>
      {config.tematicas && (
        <AjusteElegible icono={Shapes} titulo={config.tematicas.titulo} opciones={config.tematicas.opciones} valor={ajustes.tematica}
          deshabilitado={deshabilitado} onElegir={(tematica) => onCambiar({ tematica })} testid="ajuste-tematica" />
      )}
      {config.dificultades && (
        <AjusteElegible icono={Gauge} titulo="Dificultad" opciones={config.dificultades} valor={ajustes.dificultad ?? ''}
          deshabilitado={deshabilitado} onElegir={(dificultad) => onCambiar({ dificultad })} testid="ajuste-dificultad" />
      )}
      <AjusteElegible icono={Repeat} titulo={config.rondas.titulo} valor={String(ajustes.rounds)} deshabilitado={deshabilitado}
        opciones={config.rondas.opciones.map((r) => ({ id: String(r), label: String(r) }))}
        onElegir={(r) => onCambiar({ rounds: Number(r) })} testid="ajuste-rondas" />
      <AjusteElegible icono={Timer} titulo={config.tiempos.titulo} valor={String(ajustes.seconds)} deshabilitado={deshabilitado}
        opciones={config.tiempos.opciones.map((t) => ({ id: String(t), label: tiempoLabel(t) }))}
        onElegir={(t) => onCambiar({ seconds: Number(t) })} testid="ajuste-tiempo" />
    </>
  );
}
