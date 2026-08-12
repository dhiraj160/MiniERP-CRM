import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  Settings,
  LogOut,
  TrendingDown,
  Warehouse
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate, isCollapsed, onToggle }) => {
  const { user, logout, hasRole } = useAuth();

  if (!user) return null;

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/',
      visible: true
    },
    {
      name: 'Customers CRM',
      icon: <Users size={20} />,
      path: '/customers',
      visible: true
    },
    {
      name: 'Products Inventory',
      icon: <Package size={20} />,
      path: '/products',
      visible: true
    },
    {
      name: 'Stock Movements',
      icon: <Warehouse size={20} />,
      path: '/stock-movements',
      visible: true
    },
    {
      name: 'Low Stock Alerts',
      icon: <TrendingDown size={20} />,
      path: '/low-stock',
      visible: hasRole(['ADMIN', 'WAREHOUSE'])
    },
    {
      name: 'Sales Challans',
      icon: <FileSpreadsheet size={20} />,
      path: '/challans',
      visible: true
    },
    {
      name: 'Staff Accounts',
      icon: <Settings size={20} />,
      path: '/users',
      visible: hasRole(['ADMIN'])
    }
  ];

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '0' : '0 24px' }}>
          <div className="sidebar-logo" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%' }}>
            <FileSpreadsheet size={24} className="text-primary" />
            {!isCollapsed && <span>MiniERP+CRM</span>}
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems
            .filter((item) => item.visible)
            .map((item) => (
              <div
                key={item.path}
                className={`sidebar-link ${currentPath === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.name : undefined}
                style={{ 
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '12px' : '10px 14px' 
                }}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </div>
            ))}
        </nav>

        <div className="sidebar-footer" style={{ justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '16px 0' : '16px' }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '160px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {user.role}
              </div>
            </div>
          )}
          <button 
            type="button" 
            className="btn btn-link" 
            onClick={logout}
            title={isCollapsed ? 'Log out' : undefined}
            style={{ padding: isCollapsed ? '8px' : '0' }}
          >
            <LogOut size={18} />
          </button>
        </div>
        
        {/* Toggle Button */}
        {onToggle && (
          <button 
            className="sidebar-toggle-btn"
            onClick={onToggle}
            aria-label="Toggle Sidebar"
          >
            <div className={`hamburger-icon ${isCollapsed ? 'collapsed' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        )}
      </aside>

      {/* Mobile Tab Bar */}
      <nav className="mobile-tab-bar">
        {menuItems
          .filter((item) => item.visible && ['/', '/customers', '/products', '/challans'].includes(item.path))
          .map((item) => (
            <div
              key={item.path}
              className={`mobile-tab-link ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.name.split(' ')[0]}</span>
            </div>
          ))}
      </nav>
    </>
  );
};
