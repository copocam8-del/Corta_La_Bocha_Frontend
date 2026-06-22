import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import GameMulti from './pages/GameMulti';
import PublicSetup from './pages/PublicSetup';
import PublicQueue from './pages/PublicQueue';
import GlobalRanking from './pages/GlobalRanking';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/game" element={<Game />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/room-code" element={<RoomCode />} />
        <Route path="/room/:code" element={<Room />} />
        <Route path="/game-multi" element={<GameMulti />} />
        <Route path="/public-setup" element={<PublicSetup />} />
        <Route path="/public-queue" element={<PublicQueue />} />
        <Route path="/global-ranking" element={<GlobalRanking />} />
        <Route path="/ranking" element={<GlobalRanking />} />
      </Routes>
    </BrowserRouter>
  );
}