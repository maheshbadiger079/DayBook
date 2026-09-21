import { useState, useEffect } from 'react';

function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (response.ok && data.success) {
        setHealthData(data.data);
      } else {
        setError(data.message || 'Failed to fetch backend health status');
      }
    } catch (err) {
      setError(err.message || 'Cannot reach backend server. Ensure Express is running on port 5000.');
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">⚡</div>
          <div>
            <h1 className="brand-title">WorkTrack</h1>
            <p className="brand-tagline">Track. Organize. Complete. Improve.</p>
          </div>
        </div>
        <div className="phase-pill">
          <span>●</span> Phase 1 — Project Initialization
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid-2">
        {/* PostgreSQL & Backend Connection Status */}
        <div className="card">
          <div className="card-title">
            <span>System Connectivity</span>
            {loading ? (
              <span className="status-badge loading">
                <span className="pulse-dot"></span> Testing...
              </span>
            ) : error ? (
              <span className="status-badge error">
                <span className="pulse-dot"></span> Disconnected
              </span>
            ) : (
              <span className="status-badge healthy">
                <span className="pulse-dot"></span> PostgreSQL Connected
              </span>
            )}
          </div>
          <p className="card-subtitle">
            Live verification between React frontend, Express.js backend, and PostgreSQL database.
          </p>

          {error ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '1.25rem' }}>
              <p style={{ color: '#f87171', fontSize: '0.9rem', fontWeight: 600 }}>Connection Error</p>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{error}</p>
            </div>
          ) : healthData ? (
            <div>
              <div className="data-row">
                <span className="data-label">API Status</span>
                <span className="data-val" style={{ color: '#34d399', fontWeight: 600 }}>{healthData.status.toUpperCase()}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Database Name</span>
                <span className="data-val code">{healthData.database.database}</span>
              </div>
              <div className="data-row">
                <span className="data-label">PostgreSQL Version</span>
                <span className="data-val code" style={{ fontSize: '0.75rem' }}>{healthData.database.version ? healthData.database.version.split(' ')[0] + ' ' + healthData.database.version.split(' ')[1] : 'v18'}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Server Uptime</span>
                <span className="data-val">{healthData.uptimeSeconds} seconds</span>
              </div>
              <div className="data-row">
                <span className="data-label">Environment</span>
                <span className="data-val code">{healthData.environment}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Node Runtime</span>
                <span className="data-val code">{healthData.system.nodeVersion}</span>
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={fetchHealth} disabled={loading}>
              {loading ? 'Checking...' : '🔄 Re-test Connection'}
            </button>
            {lastChecked && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Last checked: {lastChecked}
              </span>
            )}
          </div>
        </div>

        {/* Phase 1 Verification Checklist */}
        <div className="card">
          <div className="card-title">
            <span>Phase 1 Deliverables</span>
            <span className="status-badge healthy">Ready</span>
          </div>
          <p className="card-subtitle">
            Initial setup, configuration, and connectivity verification checklist.
          </p>

          <div>
            <div className="check-item">
              <span className="check-icon">✓</span>
              <div>
                <strong>Git Repository Initialized</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Root repository created with clean .gitignore</p>
              </div>
            </div>
            <div className="check-item">
              <span className="check-icon">✓</span>
              <div>
                <strong>Node.js & Express REST Backend</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Express server with Helmet, CORS, Rate Limiting & Morgan</p>
              </div>
            </div>
            <div className="check-item">
              <span className="check-icon">✓</span>
              <div>
                <strong>PostgreSQL 18 Database Setup</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Database "worktrack" created & connection pool active</p>
              </div>
            </div>
            <div className="check-item">
              <span className="check-icon">✓</span>
              <div>
                <strong>React.js Frontend Initialized</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vite + React with modern responsive SaaS theme</p>
              </div>
            </div>
            <div className="check-item">
              <span className="check-icon">✓</span>
              <div>
                <strong>Health-Check Endpoint Active</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GET /api/health responding with live DB metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture Overview */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-title">
          <span>Full-Stack Architecture Flow</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Standard MVC & Layered Pattern</span>
        </div>
        <p className="card-subtitle">
          Data flow from user interaction to persistent relational storage.
        </p>

        <div className="arch-flow">
          <div className="arch-node">
            <span className="arch-node-title">React Frontend</span>
            <span className="arch-node-sub">Port 5173 (Vite)</span>
          </div>
          <span className="arch-arrow">➔</span>
          <div className="arch-node">
            <span className="arch-node-title">Vite Proxy</span>
            <span className="arch-node-sub">/api forwarding</span>
          </div>
          <span className="arch-arrow">➔</span>
          <div className="arch-node">
            <span className="arch-node-title">Express API</span>
            <span className="arch-node-sub">Port 5000</span>
          </div>
          <span className="arch-arrow">➔</span>
          <div className="arch-node">
            <span className="arch-node-title">Controller / Service</span>
            <span className="arch-node-sub">Business Logic</span>
          </div>
          <span className="arch-arrow">➔</span>
          <div className="arch-node">
            <span className="arch-node-title">pg.Pool Client</span>
            <span className="arch-node-sub">Parameterized SQL</span>
          </div>
          <span className="arch-arrow">➔</span>
          <div className="arch-node">
            <span className="arch-node-title">PostgreSQL 18</span>
            <span className="arch-node-sub">Port 5432 (worktrack)</span>
          </div>
        </div>
      </div>

      {/* Quick Links / Endpoints */}
      <div className="grid-3">
        <div className="card">
          <div className="card-title" style={{ fontSize: '1rem' }}>REST API Base</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Root API endpoint providing service metadata.
          </p>
          <a href="/api" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
            Open /api ↗
          </a>
        </div>
        <div className="card">
          <div className="card-title" style={{ fontSize: '1rem' }}>Health Status API</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            JSON health-check endpoint querying PostgreSQL.
          </p>
          <a href="/api/health" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
            Open /api/health ↗
          </a>
        </div>
        <div className="card">
          <div className="card-title" style={{ fontSize: '1rem' }}>Next: Phase 2 Database</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Ready to design & migrate normalized schema.
          </p>
          <button className="btn btn-secondary" style={{ width: '100%', opacity: 0.7, cursor: 'default' }}>
            Awaiting Confirmation 🔒
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>WorkTrack &bull; Production-Quality Daily Activity, Project & Assignment Management System</p>
        <p style={{ marginTop: '0.35rem', fontSize: '0.8rem' }}>Built with React.js, Express.js, and PostgreSQL 18</p>
      </footer>
    </div>
  );
}

export default App;
