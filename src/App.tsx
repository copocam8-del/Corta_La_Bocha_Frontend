import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Welcome from './pages/Welcome';
import GameSetup from './pages/GameSetup';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import CreateRoom from './pages/CreateRoom';
import RoomCode from './pages/RoomCode';
import Room from './pages/Room';
import PublicSetup from './pages/PublicSetup';
import PublicQueue from './pages/PublicQueue';
import GlobalRanking from './pages/GlobalRanking';
import ProtectedRoute from './components/ProtectedRoute';
import Privacidad from './pages/legal/Privacidad';
import Terminos from './pages/legal/Terminos';
import Cookies from './pages/legal/Cookies';

// La partida multijugador vive en /room/:code (lobby y juego en la misma pantalla)
function RedirectToRoom() {
  const { code } = useParams();
  return <Navigate to={`/room/${code}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/game-setup" element={<GameSetup />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        {/* Multijugador: necesita sesión (el socket se autentica con el token) */}
        <Route path="/create-room" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
        <Route path="/room-code" element={<ProtectedRoute><RoomCode /></ProtectedRoute>} />
        <Route path="/room/:code" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/game-multi/:code" element={<RedirectToRoom />} />
        <Route path="/game-multi" element={<Navigate to="/lobby" replace />} />
        <Route path="/public-setup" element={<ProtectedRoute><PublicSetup /></ProtectedRoute>} />
        <Route path="/public-queue" element={<ProtectedRoute><PublicQueue /></ProtectedRoute>} />
        <Route path="/global-ranking" element={<ProtectedRoute><GlobalRanking /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><GlobalRanking /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}