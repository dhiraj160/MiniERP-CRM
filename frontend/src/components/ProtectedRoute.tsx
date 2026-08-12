import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#080c10',
        color: '#00f2fe'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '1px',
          animation: 'pulse 1.5s infinite'
        }}>
          LOADING ERP SYSTEM...
        </div>
      </div>
    );
  }

  if (!user) {
    // If not authenticated, redirect to login
    window.history.pushState(null, '', '/login');
    // Dispatch popstate event to trigger route changes in state router
    window.dispatchEvent(new PopStateEvent('popstate'));
    return null;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div style={{
        padding: '40px',
        maxWidth: '600px',
        margin: '100px auto',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Access Denied</h2>
        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
          Your user profile role (<strong>{user.role}</strong>) does not have permission to view this panel.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => {
            window.history.pushState(null, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
