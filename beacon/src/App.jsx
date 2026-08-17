import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { isSupabaseConfigured } from './lib/supabase';
import ConfigGate from './components/ConfigGate';
import AppShell from './components/AppShell';
import Auth from './pages/Auth';
import Today from './pages/Today';
import Upcoming from './pages/Upcoming';
import Inbox from './pages/Inbox';
import AllTasks from './pages/AllTasks';
import ProjectView from './pages/ProjectView';
import { BeaconMark } from './components/Icons';

function LoadingScreen() {
  return (
    <div className="auth-screen">
      <BeaconMark className="icon" style={{ color: 'var(--signal-amber)', width: 34, height: 34, opacity: 0.85 }} />
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        element={
          <RequireAuth>
            <DataProvider>
              <AppShell />
            </DataProvider>
          </RequireAuth>
        }
      >
        <Route path="/today" element={<Today />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/all" element={<AllTasks />} />
        <Route path="/projects/:id" element={<ProjectView />} />
      </Route>
      <Route path="/" element={<Navigate to="/today" replace />} />
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  );
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigGate />;

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
