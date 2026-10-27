import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Bot, Gamepad2, Library, ShieldAlert, Users } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import BackButton from '../components/BackButton';
import { getMyProfile } from '../api/profile';
import {
  esAdmin, getAdminContenido, getAdminIa, getAdminNombres, getAdminPartidas, getAdminUsuarios, PERIODOS_ADMIN,
  type AdminContenido, type AdminIa, type AdminNombres, type AdminPartidas, type AdminUsuarios, type PeriodoAdmin,
} from '../api/admin';
import { TabContenido, TabIa, TabNombres, TabPartidas, TabUsuarios } from '../admin/AdminTabs';

// Panel de administración del equipo (sólo lectura). Quién entra lo decide el BACKEND
// (ADMIN_EMAILS): acá sólo se usa isAdmin de /users/me para no mostrar la pantalla a los demás. Si
// no sos admin, vuelve al Dashboard.

type Tab = 'usuarios' | 'partidas' | 'ia' | 'contenido' | 'nombres';
const TABS: { id: Tab; label: string; Icon: typeof Users }[] = [
  { id: 'usuarios', label: 'Usuarios', Icon: Users },
  { id: 'partidas', label: 'Partidas', Icon: Gamepad2 },
  { id: 'ia', label: 'IA', Icon: Bot },
  { id: 'contenido', label: 'Contenido', Icon: Library },
  { id: 'nombres', label: 'Nombres', Icon: ShieldAlert },
];
type Datos = AdminUsuarios | AdminPartidas | AdminIa | AdminContenido | AdminNombres;
const CARGAR: Record<Tab, (p: PeriodoAdmin) => Promise<Datos>> = {
  usuarios: getAdminUsuarios,
  partidas: getAdminPartidas,
  ia: getAdminIa,
  contenido: getAdminContenido,
  nombres: () => getAdminNombres(), // no depende del período
};

export default function Admin() {
  const navigate = useNavigate();
  const [permitido, setPermitido] = useState(false);
  const [tab, setTab] = useState<Tab>('usuarios');
  const [periodo, setPeriodo] = useState<PeriodoAdmin>('7d');
  const [datos, setDatos] = useState<Record<string, Datos>>({});
  const [errores, setErrores] = useState<Record<string, string>>({}); // por pestaña y período
  const clave = `${tab}|${periodo}`;

  // ¿Es admin? Si no (o si falla), al Dashboard
  useEffect(() => {
    getMyProfile()
      .then((p) => (esAdmin(p) ? setPermitido(true) : navigate('/dashboard', { replace: true })))
      .catch(() => navigate('/dashboard', { replace: true }));
  }, [navigate]);

  useEffect(() => {
    if (!permitido || datos[clave] || errores[clave]) return;
    let vigente = true;
    CARGAR[tab](periodo)
      .then((d) => vigente && setDatos((prev) => ({ ...prev, [clave]: d })))
      .catch((e) => {
        if (!vigente) return;
        // 404 = el backend dice que no sos admin
        if (e?.response?.status === 404) navigate('/dashboard', { replace: true });
        else setErrores((prev) => ({ ...prev, [clave]: e?.response?.status === 429 ? 'Demasiados pedidos. Esperá un minuto.' : 'No se pudieron cargar los datos.' }));
      });
    return () => {
      vigente = false;
    };
  }, [permitido, tab, periodo, clave, datos, errores, navigate]);

  const d = datos[clave];
  const error = errores[clave];
  return (
    <MultiShell maxWidth={900}>
      {/* Que los buscadores no indexen el panel (React lo sube al <head>) */}
      <meta name="robots" content="noindex, nofollow" />
      <title>Panel · Corta La Bocha</title>
      <BackButton to="/dashboard" />
      <div>
        <p className="kicker">Sólo lectura · equipo</p>
        <h1 className="neon-title" style={{ fontSize: '26px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={24} /> Panel
        </h1>
      </div>

      {!permitido ? (
        <div className="card" style={{ textAlign: 'center' }} data-testid="verificando"><div className="spinner" /></div>
      ) : (
        <>
          {/* 4 en la PC, 2 × 2 en el celular */}
          <div role="tablist" aria-label="Secciones del panel"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} role="tab" aria-selected={tab === id} className={`option-btn ${tab === id ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                onClick={() => setTab(id)}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          <div aria-label="Período" style={{ display: 'flex', gap: '6px' }}>
            {PERIODOS_ADMIN.map((p) => (
              <button key={p.id} className={`option-btn ${periodo === p.id ? 'active' : ''}`} aria-pressed={periodo === p.id}
                onClick={() => setPeriodo(p.id)}>
                {p.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              {error}
              <button className="option-btn" style={{ flex: 'none' }}
                onClick={() => setErrores((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== clave)))}>
                Reintentar
              </button>
            </div>
          )}
          {!d && !error && <div className="card" style={{ textAlign: 'center' }}><div className="spinner" /></div>}
          {d && tab === 'usuarios' && <TabUsuarios d={d as AdminUsuarios} />}
          {d && tab === 'partidas' && <TabPartidas d={d as AdminPartidas} />}
          {d && tab === 'ia' && <TabIa d={d as AdminIa} />}
          {d && tab === 'contenido' && <TabContenido d={d as AdminContenido} />}
          {d && tab === 'nombres' && <TabNombres d={d as AdminNombres} />}
        </>
      )}
    </MultiShell>
  );
}
