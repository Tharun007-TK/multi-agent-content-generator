import React from 'react';

export default function Logo({ size = 36, showWordmark = true }) {
  const box = size;
  return (
    <div className="logo" aria-label="Outboundly logo" style={{ gap: showWordmark ? 10 : 0 }}>
      <svg
        width={box}
        height={box}
        viewBox="0 0 64 64"
        role="img"
        aria-hidden={!showWordmark}
      >
        <rect x="6" y="6" width="52" height="52" rx="14" fill="var(--accent)" />
        <path
          d="M22 26c0-3 2.4-5.5 5.4-5.5H42a2 2 0 0 1 0 4H28.8c-.8 0-1.3.6-1.3 1.5V32c0 .9.5 1.5 1.3 1.5H40a2 2 0 0 1 0 4H28.8C24.4 37.5 22 35 22 32V26Z"
          fill="#0b1020"
          opacity="0.9"
        />
        <path
          d="M34 29.5a2 2 0 0 1 2-2h5.5a2 2 0 0 1 0 4H36a2 2 0 0 1-2-2Z"
          fill="#0b1020"
        />
        <circle cx="26" cy="40" r="3" fill="#0b1020" />
      </svg>
      {showWordmark && (
        <div className="logo-wordmark">
          <span className="logo-name">Outboundly</span>
          <span className="logo-tag">Pipeline copilot</span>
        </div>
      )}
    </div>
  );
}
