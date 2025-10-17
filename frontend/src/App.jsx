import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { CallProvider } from './context/CallContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { initSocket } from './services/socket.js';
import { Navbar } from './components/Common/Navbar.jsx';
import { Login } from './components/Auth/Login.jsx';
import { Register } from './components/Auth/Register.jsx';
import { ForgotPassword } from './components/Auth/ForgotPassword.jsx';
import { ResetPassword } from './components/Auth/ResetPassword.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { UserProfile } from './components/Profile/UserProfile.jsx';
import { EditProfile } from './components/Profile/EditProfile.jsx';
import { Toaster } from 'react-hot-toast';
import './styles/globals.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      initSocket(token);
    }
  }, [user]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <CallProvider>
            <AppContent />
          </CallProvider>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;