
export const LiquidLoader = ({ text = 'Loading...' }: { text?: string }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '20px'
    }}>
      <div className="liquid-loader" style={{ animation: 'cardIn 0.5s ease-out' }}>
        <svg viewBox="0 0 100 100" style={{ width: '64px', height: '64px', animation: 'spin 2s linear infinite' }}>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-secondary)" />
            </linearGradient>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
          <g filter="url(#goo)">
            <circle cx="50" cy="50" r="20" fill="none" stroke="url(#gradient)" strokeWidth="6" strokeLinecap="round" strokeDasharray="30 100" />
            <circle cx="50" cy="15" r="8" fill="url(#gradient)" />
            <circle cx="50" cy="85" r="5" fill="var(--color-accent)" />
          </g>
        </svg>
      </div>
      <div style={{
        color: 'var(--text-secondary)',
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '1px',
        animation: 'pulse 2s infinite'
      }}>
        {text}
      </div>
    </div>
  );
};
