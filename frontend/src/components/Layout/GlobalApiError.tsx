import React from 'react';
import { AlertCircle, AlertTriangle, XOctagon } from 'lucide-react';

interface GlobalApiErrorProps {
  error: any;
  onRetry?: () => void;
}

export const GlobalApiError: React.FC<GlobalApiErrorProps> = ({ error, onRetry }) => {
  if (!error) return null;

  const getErrorDetails = () => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message = data?.message || error?.message || 'An unexpected error occurred';

    if (status === 400) {
      return {
        title: 'Validation Failed',
        icon: <AlertCircle size={32} className="text-warning" style={{ color: 'var(--color-warning)' }} />,
        description: message,
        color: 'var(--color-warning-bg)',
        borderColor: 'var(--color-warning)'
      };
    }
    if (status === 401 || status === 403) {
      return {
        title: 'Access Denied',
        icon: <XOctagon size={32} className="text-danger" style={{ color: 'var(--color-danger)' }} />,
        description: 'You do not have permission to perform this action. Your session may have expired.',
        color: 'var(--color-danger-bg)',
        borderColor: 'var(--color-danger)'
      };
    }
    if (status === 404) {
      return {
        title: 'Resource Not Found',
        icon: <AlertCircle size={32} className="text-muted" style={{ color: 'var(--text-muted)' }} />,
        description: message,
        color: 'var(--bg-input)',
        borderColor: 'var(--border-color)'
      };
    }
    if (status >= 500) {
      return {
        title: 'System Error',
        icon: <AlertTriangle size={32} className="text-danger" style={{ color: 'var(--color-danger)' }} />,
        description: 'The server encountered an error processing your request. Please try again later.',
        color: 'var(--color-danger-bg)',
        borderColor: 'var(--color-danger)'
      };
    }

    // Default error
    return {
      title: 'Operation Failed',
      icon: <AlertCircle size={32} style={{ color: 'var(--color-danger)' }} />,
      description: typeof error === 'string' ? error : message,
      color: 'var(--color-danger-bg)',
      borderColor: 'var(--color-danger)'
    };
  };

  const details = getErrorDetails();

  return (
    <div 
      className="glass-card mb-20" 
      style={{ 
        backgroundColor: details.color, 
        borderLeft: `4px solid ${details.borderColor}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '16px 20px',
        animation: 'cardIn 0.3s ease-out forwards'
      }}
    >
      <div>{details.icon}</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {details.title}
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
          {details.description}
        </p>
        
        {/* Special case for detailed stock errors from Challans API */}
        {error?.response?.data?.details?.length > 0 && (
          <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '14px' }}>
            {error.response.data.details.map((detail: string, index: number) => (
              <li key={index} style={{ marginBottom: '4px' }}>{detail}</li>
            ))}
          </ul>
        )}

        {onRetry && (
          <button 
            className="btn btn-secondary mt-10" 
            onClick={onRetry}
            style={{ padding: '4px 12px', fontSize: '13px' }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
