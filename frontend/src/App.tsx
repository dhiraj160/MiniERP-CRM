import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { CommandPalette } from './components/Layout/CommandPalette';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { ChallansPage } from './pages/ChallansPage';
import { StockMovementsPage } from './pages/StockMovementsPage';
import { UsersPage } from './pages/UsersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuth } from './hooks/useAuth';

const routeConfig: Record<
  string,
  {
    title: string;
    component: () => React.ReactNode;
  }
> = {
  '/': { title: 'Dashboard', component: () => <DashboardPage /> },
  '/customers': { title: 'Customer CRM', component: () => <CustomersPage /> },
  '/products': { title: 'Products Inventory', component: () => <ProductsPage /> },
  '/stock-movements': { title: 'Stock Movements', component: () => <StockMovementsPage /> },
  '/low-stock': { title: 'Low stock alerts', component: () => <ProductsPage initialLowStock /> },
  '/challans': { title: 'Sales Challans', component: () => <ChallansPage /> },
  '/users': {
    title: 'Staff accounts',
    component: () => (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
};

const AppContent = () => {
  const { user, loading, hasRole } = useAuth();
  const [path, setPath] = useState(window.location.pathname);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!loading && user && path === '/login') {
      window.history.replaceState(null, '', '/');
      setPath('/');
    }
  }, [loading, user, path]);

  useEffect(() => {
    if (!loading && !user && path !== '/login') {
      window.history.replaceState(null, '', '/login');
      setPath('/login');
    }
  }, [loading, user, path]);

  const navigate = (newPath: string) => {
    window.history.pushState(null, '', newPath);
    setPath(newPath);
  };

  if (loading) {
    return <div className="page-container">Loading application…</div>;
  }

  if (path === '/login') {
    return <LoginPage navigate={navigate} />;
  }

  const route = routeConfig[path] ?? {
    title: 'Not found',
    component: () => <NotFoundPage />,
  };

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CommandPalette navigate={navigate} hasRole={hasRole} />
      <Sidebar 
        currentPath={path} 
        navigate={navigate} 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div className="main-content">
        <Header title={route.title} />
        <div key={path} style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--header-height))' }}>
          {route.component()}
          <Footer />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
