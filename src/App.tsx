import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GameSetup from './pages/GameSetup';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import CreateRoom from './pages/CreateRoom';
import RoomCode from './pages/RoomCode';
import Room from './pages/Room';
import GameMulti from './pages/GameMulti';
import PublicSetup from './pages/PublicSetup';
import PublicQueue from './pages/PublicQueue';
// CAMBIO ACÁ: Cambiamos './components/GlobalRanking' por './pages/GlobalRanking'
import GlobalRanking from './pages/GlobalRanking'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
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