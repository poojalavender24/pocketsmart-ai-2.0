import { useEffect, useState } from 'react'; import { api } from './api';
import Auth from './pages/Auth'; import Dashboard from './pages/Dashboard';
export default function App() {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false);
  useEffect(() => { localStorage.getItem('token') ? api('/auth/me').then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setReady(true)) : setReady(true); }, []);
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  if (!ready) return null;
  return <div className="app">{user ? <Dashboard user={user} setUser={setUser} onLogout={logout} /> : <Auth onLogin={setUser} />}</div>;
}
