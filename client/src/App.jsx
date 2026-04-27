import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';

// --- PROTECTED ROUTE COMPONENT ---
// This wrapper checks if the user is logged in.
// If not, it redirects them to the login page automatically.
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- ADMIN ROUTE COMPONENT ---
// This wrapper checks if the user is logged in AND is an ADMIN.
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// --- MAIN APP ROUTES ---
function AppRoutes() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public routes - anyone can visit */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes - only logged-in users can visit */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <AdminRoute>
              <AdminTransactionsPage />
            </AdminRoute>
          }
        />

        {/* Default redirect: "/" goes to "/dashboard" */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

// --- ROOT APP ---
// AuthProvider wraps everything so all components can access auth state
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
