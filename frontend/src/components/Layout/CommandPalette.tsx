import React, { useEffect, useState, useRef } from 'react';
import { Search, ChevronRight, CornerDownLeft } from 'lucide-react';

interface RouteItem {
  title: string;
  path: string;
}

const ALL_ROUTES: RouteItem[] = [
  { title: 'Dashboard', path: '/' },
  { title: 'Customer CRM', path: '/customers' },
  { title: 'Products Inventory', path: '/products' },
  { title: 'Stock Movements', path: '/stock-movements' },
  { title: 'Low Stock Alerts', path: '/low-stock' },
  { title: 'Sales Challans', path: '/challans' },
  { title: 'Staff Accounts', path: '/users' }
];

interface CommandPaletteProps {
  navigate: (path: string) => void;
  hasRole: (roles: any[]) => boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ navigate, hasRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableRoutes = ALL_ROUTES.filter(route => {
    if (route.path === '/users' && !hasRole(['ADMIN'])) return false;
    if (route.path === '/low-stock' && !hasRole(['ADMIN', 'WAREHOUSE'])) return false;
    return true;
  });

  const filteredRoutes = availableRoutes.filter(route =>
    route.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleExecute = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredRoutes.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredRoutes[selectedIndex]) {
        handleExecute(filteredRoutes[selectedIndex].path);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 9, 20, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: 0,
          border: '1px solid var(--border-focus)',
          boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.4), var(--shadow-lg), 0 0 60px rgba(99, 102, 241, 0.2)',
          animation: 'cardIn 0.2s ease-out forwards',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
      >
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={20} style={{ color: 'var(--color-primary)' }} />
          <input
            ref={inputRef}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontFamily: 'inherit'
            }}
            placeholder="Type a command or search module..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>Ctrl</kbd>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>K</kbd>
          </div>
        </div>
        
        <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {filteredRoutes.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No modules found.
            </div>
          ) : (
            filteredRoutes.map((route, index) => (
              <div
                key={route.path}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: index === selectedIndex ? 'var(--color-primary-glow)' : 'transparent',
                  color: index === selectedIndex ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'background-color 0.1s'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => handleExecute(route.path)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ChevronRight size={16} style={{ opacity: index === selectedIndex ? 1 : 0 }} />
                  <span style={{ fontWeight: index === selectedIndex ? 600 : 400 }}>{route.title}</span>
                </div>
                {index === selectedIndex && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', opacity: 0.7 }}>
                    <CornerDownLeft size={14} /> Enter
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Search modules & navigation</span>
          <span>Press <strong>Esc</strong> to close</span>
        </div>
      </div>
    </div>
  );
};
