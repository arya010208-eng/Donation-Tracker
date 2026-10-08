import React from 'react';

export default function Navbar({ activePage, setActivePage, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand" onClick={() => setActivePage('campaigns')}>
          <div className="brand-icon">🌱</div>
          <span>Donation Tracker</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activePage === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActivePage('campaigns')}
          >
            Campaigns
          </button>
          <button
            className={`nav-btn ${activePage === 'donations' ? 'active' : ''}`}
            onClick={() => setActivePage('donations')}
          >
            Make a Donation
          </button>

          {user ? (
            <div className="user-badge">
              <span>👤 {user.name}</span>
              <button className="logout-btn" onClick={onLogout} title="Log Out">
                ✕
              </button>
            </div>
          ) : (
            <button
              className={`nav-btn ${activePage === 'auth' ? 'active' : ''}`}
              onClick={() => setActivePage('auth')}
            >
              Sign In / OTP
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

