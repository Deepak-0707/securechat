import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { Login } from './components/Auth/Login.jsx';
import { Register } from './components/Auth/Register.jsx';
import { ForgotPassword } from './components/Auth/ForgotPassword.jsx';
import { ResetPassword } from './components/Auth/ResetPassword.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { UserProfile } from './components/Profile/UserProfile.jsx';
import { EditProfile } from './components/Profile/EditProfile.jsx';
import { NotFound } from './pages/NotFound.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      } />

      {/* Protected Routes */}
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

      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}