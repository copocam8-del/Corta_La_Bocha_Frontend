import { gameName } from '../games/gameIcons';
import type { AdminContenido, AdminIa, AdminPartidas, AdminUsuarios } from '../api/admin';
import { BarrasHorizontales, BarrasPorDia, Grilla, Leyenda, Seccion, SinDatos, Tabla, Tarjeta } from './AdminParts';
import { numero, plata } from './adminFormat';

// Contenido de cada pestaña del panel. Sólo muestran lo que calculó el servidor.

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });

export function TabUsuarios({ d }: { d: AdminUsuarios }) {
  return (
    <>
      <Grilla>
        <Tarjeta titulo="Usuarios" valor={numero(d.total)} detalle="en total" />
        <Tarjeta titulo="Nuevos" valor={numero(d.nuevos)} detalle="en el período" />
        <Tarjeta titulo="Con Google" valor={numero(d.conGoogle)} detalle="nuevos del período" color="#60a5fa" />
        <Tarjeta titulo="Con contraseña" valor={numero(d.conContrasena)} detalle="nuevos del período" color="#fbbf24" />
      </Grilla>
      <Seccion titulo="Activos (jugaron)" nota="Empezaron una partida solo o terminaron una que contó.">
        <Grilla>
          <Tarjeta titulo="Hoy" valor={numero(d.activos.hoy)} />
          <Tarjeta titulo="7 días" valor={numero(d.activos.semana)} />
          <Tarjeta titulo="30 días" valor={numero(d.activos.mes)} />
        </Grilla>
      </Seccion>
      <Seccion titulo="Nuevos por día">
        <BarrasPorDia titulo="Usuarios nuevos por día" dias={d.nuevosPorDia.map((x) => ({ dia: x.dia, total: x.cantidad }))} />
      </Seccion>
      <Seccion titulo="Últimos 20 registros">
        <Tabla
          columnas={['Usuario', 'Email', 'Alta', 'Google']}
          filas={d.ultimosRegistros.map((u) => [u.username, u.email ?? '—', fecha(u.creado), u.conGoogle ? 'Sí' : 'No'])}
        />
      </Seccion>
    </>
  );
}

export function TabPartidas({ d }: { d: AdminPartidas }) {
  const juegos = Object.entries(d.porJuego).sort((a, b) => b[1].total - a[1].total);
  const juegosEnGrafico = [...new Set(d.porDia.flatMap((x) => Object.keys(x.juegos)))];
  return (
    <>
      <Seccion titulo="Ahora mismo">
        <Grilla>
          <Tarjeta titulo="Salas activas" valor={numero(d.enVivo.salas)} detalle={`${numero(d.enVivo.jugando)} en partida`} />
          <Tarjeta titulo="Conectados" valor={numero(d.enVivo.conectados)} detalle="en salas" />
          <Tarjeta titulo="En la cola" valor={numero(d.enVivo.enCola)} detalle="buscando partida pública" />
        </Grilla>
      </Seccion>
      <Grilla>
        <Tarjeta titulo="Partidas" valor={numero(d.total)} detalle="en el período" />
        <Tarjeta titulo="Solo" valor={numero(d.solo)} color="#60a5fa" />
        <Tarjeta titulo="Multijugador" valor={numero(d.multijugador)} color="#f472b6" />
        <Tarjeta titulo="Abandonadas" valor={numero(d.abandonadas)} detalle={`solo · ${numero(d.abandonosMultijugador)} abandonos en multi`} color="#ef4444" />
      </Grilla>
      <Seccion titulo="Por día y por juego">
        <BarrasPorDia titulo="Partidas por día y por juego" dias={d.porDia.map((x) => ({ dia: x.dia, total: x.total, partes: x.juegos }))} />
        {juegosEnGrafico.length > 0 && <Leyenda juegos={juegosEnGrafico} />}
      </Seccion>
      <Seccion titulo="Por juego">
        <BarrasHorizontales
          filas={juegos.map(([g, j]) => ({
            id: g, texto: gameName(g), valor: j.total,
            detalle: `${numero(j.solo)} solo · ${numero(j.multijugador)} multi · ${numero(j.abandonadas)} abandonadas`,
          }))}
        />
      </Seccion>
      <Seccion titulo="Top 10 del período">
        <Tabla
          columnas={['#', 'Usuario', 'Puntos', 'Partidas', 'Ganadas']}
          filas={d.top.map((t, i) => [i + 1, t.username, numero(t.puntos), numero(t.partidas), numero(t.ganadas)])}
        />
      </Seccion>
    </>
  );
}

export function TabIa({ d }: { d: AdminIa }) {
  const total = d.partidasValidadas + d.partidasSinValidar;
  return (
    <>
      <Grilla>
        <Tarjeta titulo="Proveedor" valor={d.proveedor} detalle={d.configurado ? (d.modelo ?? '') : 'sin configurar: todo queda sin validar'}
          color={d.configurado ? '#39ff8c' : '#ef4444'} />
        <Tarjeta titulo="Validadas" valor={numero(d.partidasValidadas)} detalle="partidas de Tutti Frutti" />
        <Tarjeta titulo="Sin validar" valor={numero(d.partidasSinValidar)} detalle={`${numero(d.porcentajeSinValidar)}% del total`} color="#fbbf24" />
        <Tarjeta titulo="Respuestas válidas" valor={`${numero(d.porcentajeValidas)}%`} detalle={`de ${numero(d.respuestasEvaluadas)} evaluadas`} />
      </Grilla>
      <Seccion titulo="Validadas vs sin validar">
        {total === 0 ? <SinDatos /> : (
          <div role="img" aria-label={`${d.partidasValidadas} validadas y ${d.partidasSinValidar} sin validar`}
            style={{ display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden', background: 'rgba(57,255,140,0.08)' }}>
            <div style={{ width: `${(d.partidasValidadas / total) * 100}%`, background: '#39ff8c' }} />
            <div style={{ width: `${(d.partidasSinValidar / total) * 100}%`, background: '#fbbf24' }} />
          </div>
        )}
      </Seccion>
      <Seccion titulo="Gasto de la IA (estimado)" nota={d.notaGasto}>
        <Tarjeta titulo="Estimado" valor={`US$ ${plata(d.gastoEstimadoUsd)}`} detalle="en el período" color="#fbbf24" />
      </Seccion>
    </>
  );
}

export function TabContenido({ d }: { d: AdminContenido }) {
  const pct = (veces: number) => `${numero(veces)} ${veces === 1 ? 'vez' : 'veces'}`;
  const nota = `Sólo lo que se jugó al menos ${d.minimoVeces} veces.`;
  return (
    <>
      <Seccion titulo="Trivia: más falladas" nota={nota}>
        <BarrasHorizontales sufijo="% acierto" color="#ef4444"
          filas={d.trivia.masFalladas.map((p) => ({ id: p.id, texto: p.texto, valor: p.porcentaje, detalle: pct(p.veces) }))} />
      </Seccion>
      <Seccion titulo="Trivia: más acertadas" nota={nota}>
        <BarrasHorizontales sufijo="% acierto"
          filas={d.trivia.masAcertadas.map((p) => ({ id: p.id, texto: p.texto, valor: p.porcentaje, detalle: pct(p.veces) }))} />
      </Seccion>
      <Seccion titulo="Ahorcado: palabras más difíciles" nota={nota}>
        <BarrasHorizontales sufijo="% derrotas" color="#fbbf24"
          filas={d.ahorcado.map((p) => ({ id: p.id, texto: p.texto, valor: p.porcentaje, detalle: pct(p.veces) }))} />
      </Seccion>
      <Seccion titulo="Sopa de letras: temáticas más jugadas">
        <BarrasHorizontales color="#f472b6" filas={d.sopa.map((t) => ({ id: t.id, texto: t.nombre, valor: t.cantidad }))} />
      </Seccion>
      <Seccion titulo="Memotest: temas más jugados">
        <BarrasHorizontales color="#22d3ee" filas={d.memotest.map((t) => ({ id: t.id, texto: t.nombre, valor: t.cantidad }))} />
      </Seccion>
      <Seccion titulo="Tutti Frutti: letras más sorteadas">
        <BarrasHorizontales filas={d.letras.map((l) => ({ id: l.letra, texto: l.letra, valor: l.cantidad }))} />
      </Seccion>
      {d.sinDatos.length > 0 && (
        <div className="notice" data-testid="no-se-guarda">
          <strong>No se guarda (por eso no aparece):</strong>
          <ul style={{ margin: '6px 0 0 18px' }}>
            {d.sinDatos.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}
    </>
  );
}
