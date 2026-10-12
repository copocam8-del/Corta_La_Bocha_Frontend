import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OlvideContrasena from './pages/OlvideContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Welcome from './pages/Welcome';
import GameSetup from './pages/GameSetup';
import GameMenu from './pages/GameMenu';
import Game from './pages/Game';
import CreateRoom from './pages/CreateRoom';
import RoomCode from './pages/RoomCode';
import Room from './pages/Room';
import PublicSetup from './pages/PublicSetup';
import PublicQueue from './pages/PublicQueue';
import GlobalRanking from './pages/GlobalRanking';
import Ahorcado from './pages/Ahorcado';
import Trivia from './pages/Trivia';
import DesafioDiario from './pages/DesafioDiario';
import SopaDeLetras from './pages/SopaDeLetras';
import Memotest from './pages/Memotest';
import ProtectedRoute from './components/ProtectedRoute';
import Privacidad from './pages/legal/Privacidad';
import Terminos from './pages/legal/Terminos';
import Cookies from './pages/legal/Cookies';

// La partida multijugador vive en /room/:code (lobby y juego en la misma pantalla)
function RedirectToRoom() {
  const { code } = useParams();
  return <Navigate to={`/room/${code}`} replace />;
}

// Rutas viejas de Tutti Frutti (antes era el único juego con multijugador): van al menú nuevo
const TF = '/juego/tutti_frutti';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
        {/* Páginas legales: públicas, sin necesidad de iniciar sesión */}
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/game-setup" element={<ProtectedRoute><GameSetup /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        {/* Menú "¿Cómo querés jugar?" de cada juego y multijugador (necesita sesión: el socket se
            autentica con el token) */}
        <Route path="/juego/:game" element={<ProtectedRoute><GameMenu /></ProtectedRoute>} />
        <Route path="/juego/:game/crear-sala" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
        <Route path="/juego/:game/codigo" element={<ProtectedRoute><RoomCode /></ProtectedRoute>} />
        <Route path="/juego/:game/publica" element={<ProtectedRoute><PublicSetup /></ProtectedRoute>} />
        <Route path="/juego/:game/buscando" element={<ProtectedRoute><PublicQueue /></ProtectedRoute>} />
        <Route path="/room/:code" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/game-multi/:code" element={<RedirectToRoom />} />
        <Route path="/game-multi" element={<Navigate to={TF} replace />} />
        <Route path="/lobby" element={<Navigate to={TF} replace />} />
        <Route path="/create-room" element={<Navigate to={`${TF}/crear-sala`} replace />} />
        <Route path="/public-setup" element={<Navigate to={`${TF}/publica`} replace />} />
        <Route path="/room-code" element={<ProtectedRoute><RoomCode /></ProtectedRoute>} />
        <Route path="/public-queue" element={<ProtectedRoute><PublicQueue /></ProtectedRoute>} />
        {/* Juegos */}
        <Route path="/ahorcado" element={<ProtectedRoute><Ahorcado /></ProtectedRoute>} />
        <Route path="/trivia" element={<ProtectedRoute><Trivia /></ProtectedRoute>} />
        <Route path="/desafio-diario" element={<ProtectedRoute><DesafioDiario /></ProtectedRoute>} />
        <Route path="/sopa-de-letras" element={<ProtectedRoute><SopaDeLetras /></ProtectedRoute>} />
        <Route path="/memotest" element={<ProtectedRoute><Memotest /></ProtectedRoute>} />
        <Route path="/global-ranking" element={<ProtectedRoute><GlobalRanking /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><GlobalRanking /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}