import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Moon, ShieldCheck, Sun, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <header className="header">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{title}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          padding: '6px 12px',
          borderRadius: '20px'
        }}>
          <ShieldCheck size={16} className="text-primary" />
          <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
            ROLE: {user.role}
          </span>
        </div>

        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-glow)',
          border: '1px solid var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)'
        }}>
          <UserIcon size={18} />
        </div>
      </div>
    </header>
  );
};
