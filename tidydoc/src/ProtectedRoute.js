// ProtectedRoute.js
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './Login';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(!isAuthenticated);

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  if (!isAuthenticated && showLogin) {
    return (
      <>
        {children} {/* Pour afficher la page en arrière-plan */}
        <Login onClose={handleCloseLogin} />
      </>
    );
  }

  return children;
}

export default ProtectedRoute;