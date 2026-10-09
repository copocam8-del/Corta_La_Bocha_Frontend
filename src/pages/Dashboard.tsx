import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { clearSession } from '../auth/session';
import LegalFooter from '../components/LegalFooter';

// Datos públicos que devuelve GET /users (sin email, fecha de nacimiento ni nombre real)
interface PublicUser {
  id: string;
  username: string;
  country: string | null;
  profile: { total_points: number; matches_played: number } | null;
}

export default function Dashboard() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<PublicUser[]>('/users').then((res) => setUsers(res.data)).catch(() => {
      navigate('/login');
    });
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <Link to="/profile" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Mi perfil
            </Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Cerrar sesión
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Jugadores registrados</h2>
          {users.length === 0 && <p className="text-gray-500">Todavía no hay jugadores.</p>}
          {users.map((user) => (
            <div key={user.id} className="border-b py-3 flex justify-between">
              <span className="font-medium">
                {user.username}
                {user.country && <span className="text-gray-400 font-normal"> · {user.country}</span>}
              </span>
              <span className="text-gray-500">{user.profile?.total_points ?? 0} pts</span>
            </div>
          ))}
        </div>
        <LegalFooter variant="light" />
      </div>
    </div>
  );
}
