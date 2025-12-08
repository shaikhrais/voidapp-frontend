import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Dialer from './pages/Dialer';
import MyNumbers from './pages/MyNumbers';
import BuyNumber from './pages/BuyNumber';
import CallLogs from './pages/CallLogs';
import SMSLogs from './pages/SMSLogs';
import Settings from './pages/Settings';
import LoadingSplash from './components/LoadingSplash';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSplash />;

  if (!user) return <Navigate to="/login" replace />;
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dialer" element={<Dialer />} />
            <Route path="numbers" element={<MyNumbers />} />
            <Route path="numbers/buy" element={<BuyNumber />} />
            <Route path="calls" element={<CallLogs />} />
            <Route path="sms" element={<SMSLogs />} />
            <Route path="settings" element={<Settings />} />
            {/* Add other routes here later */}
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
