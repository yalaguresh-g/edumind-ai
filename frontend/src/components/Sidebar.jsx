import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  FolderOpen, 
  HelpCircle, 
  Info,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ open = false, onClose = () => {} }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assistant', label: 'AI Study Assistant', icon: BrainCircuit },
    { to: '/materials', label: 'My Materials', icon: FolderOpen },
    { to: '/quiz', label: 'Quiz Generator', icon: HelpCircle },
    { to: '/about', label: 'About Project', icon: Info },
  ];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <BrainCircuit size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-title">EduMind AI</span>
            <span className="brand-badge">Lite</span>
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Multimodal Study Tutor
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
              onClick={onClose}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles size={14} color="#8b5cf6" />
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Gemini Multimodal
          </span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Supports PDF documents, images, and audio notes.
        </p>
      </div>
    </aside>
  );
}

