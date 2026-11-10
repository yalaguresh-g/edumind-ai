
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getHealth } from '../services/api';
import { FileText, Sun, Moon, Menu } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/assistant': 'AI Study Assistant',
  '/materials': 'My Materials',
  '/quiz': 'Quiz Generator',
  '/about': 'About Project',
};

export default function Header({
  activeMaterial,
  theme,
  onToggleTheme,
  onToggleSidebar
}) {
  const location = useLocation();
  const [health, setHealth] = useState(null);

  const title = PAGE_TITLES[location.pathname] || 'EduMind AI';

  useEffect(() => {
    let isMounted = true;

    const fetchHealth = async () => {
      try {
        const data = await getHealth();

        if (isMounted) {
          setHealth(data);
        }
      } catch (err) {
        if (isMounted) {
          setHealth({
            status: 'offline',
            groq_configured: false,
            groq_ready: false,
            model: 'unknown',
          });
        }
      }
    };

    fetchHealth();

    const interval = setInterval(fetchHealth, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">

        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <h1 className="header-page-title">{title}</h1>

        {activeMaterial && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.775rem',
              fontWeight: 600
            }}
          >
            <FileText size={14} />

            <span
              style={{
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {activeMaterial.original_name}
            </span>
          </div>
        )}
      </div>

      <div className="header-right">

        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light'
            ? <Moon size={17} />
            : <Sun size={17} />
          }

          <span>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </span>
        </button>

        {health && (
          <div
            className={`api-status-badge ${
              health.groq_ready ? 'active' : 'missing'
            }`}
          >
            <span
              className={`status-dot ${
                health.groq_ready ? 'active' : 'missing'
              }`}
            />

            {health.groq_ready ? (
              <span title={`Configured model: ${health.model}`}>
                Groq AI Active
              </span>
            ) : (
              <span title="Check GROQ_API_KEY in backend/.env">
                API Key Required
              </span>
            )}
          </div>
        )}

        <div className="user-profile">
          <div className="avatar">EM</div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Student Mode
            </span>

            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)'
              }}
            >
              Demo Session
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}