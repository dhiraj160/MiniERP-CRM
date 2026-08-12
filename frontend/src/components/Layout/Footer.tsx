export const Footer = () => {
  return (
    <footer style={{ 
      padding: '24px 32px',
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      color: 'var(--text-muted)',
      fontSize: '13px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <strong>MiniERP+CRM Portal</strong> &copy; {new Date().getFullYear()}
      </div>
      <div>
        <span style={{ marginRight: '16px' }}>Secure Session</span>
        <span>Version 2.0.0</span>
      </div>
    </footer>
  );
};
