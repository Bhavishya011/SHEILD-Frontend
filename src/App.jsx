import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import GuestSOS from './pages/GuestSOS';
import StaffDashboard from './pages/StaffDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import { logoutUser } from './lib/firebase';

function ProtectedRoute({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'manager' ? '/manager' : '/staff'} replace />;
  }
  return children;
}

function AppRoutes() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shield_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('shield_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    localStorage.removeItem('shield_user');
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/sos" element={<GuestSOS />} />
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'manager' ? '/manager' : '/staff'} replace /> : <Login onLogin={handleLogin} />
      } />

      {/* Protected — Staff */}
      <Route path="/staff" element={
        <ProtectedRoute user={user} role="staff">
          <StaffDashboard user={user} />
        </ProtectedRoute>
      } />

      {/* Protected — Manager */}
      <Route path="/manager" element={
        <ProtectedRoute user={user} role="manager">
          <ManagerDashboard user={user} onLogout={handleLogout} />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={user ? (user.role === 'manager' ? '/manager' : '/staff') : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
