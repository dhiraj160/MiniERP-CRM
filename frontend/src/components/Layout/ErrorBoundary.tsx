import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="login-screen" style={{ flexDirection: 'column' }}>
          <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', color: 'var(--color-danger)' }}>
              <AlertTriangle size={48} />
            </div>
            <h2 style={{ marginBottom: '16px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              The application encountered an unexpected error. Please try reloading the page.
            </p>
            <button className="btn btn-primary" onClick={this.handleReload} style={{ width: '100%' }}>
              <RefreshCw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
