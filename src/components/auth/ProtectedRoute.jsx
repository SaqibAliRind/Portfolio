import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute
 *
 * Wraps routes that require an authenticated admin.
 * Displays a loading indicator while the initial authentication state
 * is being verified (prevents a flash of redirect).
 */
const ProtectedRoute = () => {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="auth-loading-screen" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--color-text)'
      }}>
        <div className="spinner"></div>
        <p style={{ marginLeft: '1rem' }}>Verifying session...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
