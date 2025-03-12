import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = () => {
    return !!localStorage.getItem('token'); // Vérifie si un token est présent dans le localStorage
  };

  return isAuthenticated() ? children : <Navigate to="/app" />;
};

export default ProtectedRoute;
