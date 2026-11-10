import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ToastProvider } from './components/Toast';

import Dashboard from './pages/Dashboard';
import StudyAssistant from './pages/StudyAssistant';
import Materials from './pages/Materials';
import QuizGenerator from './pages/QuizGenerator';
import About from './pages/About';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('edumind_theme');
    return saved || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('edumind_theme', theme);
  }, [theme]);

  const [activeMaterial, setActiveMaterial] = useState(() => {
    try {
      const saved = sessionStorage.getItem('edumind_active_material');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [quizCount, setQuizCount] = useState(() => {
    try {
      const saved = sessionStorage.getItem('edumind_quiz_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    let alive = true;
    import('./services/api').then(({ getMaterials }) => getMaterials()).then((items) => {
      if (!alive) return;
      const savedId = activeMaterial?.material_id;
      const restored = items.find((item) => item.material_id === savedId) || items[0] || null;
      setActiveMaterial(restored);
    }).catch(() => { if (alive) setActiveMaterial(null); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (activeMaterial) {
      sessionStorage.setItem('edumind_active_material', JSON.stringify(activeMaterial));
    } else {
      sessionStorage.removeItem('edumind_active_material');
    }
  }, [activeMaterial]);

  const handleQuizCompleted = () => {
    setQuizCount((prev) => {
      const next = prev + 1;
      sessionStorage.setItem('edumind_quiz_count', next.toString());
      return next;
    });
  };

  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="main-wrapper">
            <Header activeMaterial={activeMaterial} theme={theme} onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
            {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
            <main className="content-container">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      activeMaterial={activeMaterial}
                      setActiveMaterial={setActiveMaterial}
                      quizCount={quizCount}
                    />
                  }
                />
                <Route
                  path="/assistant"
                  element={
                    <StudyAssistant
                      activeMaterial={activeMaterial}
                      setActiveMaterial={setActiveMaterial}
                      onQuizCompleted={handleQuizCompleted}
                    />
                  }
                />
                <Route
                  path="/materials"
                  element={
                    <Materials
                      activeMaterial={activeMaterial}
                      setActiveMaterial={setActiveMaterial}
                    />
                  }
                />
                <Route
                  path="/quiz"
                  element={
                    <QuizGenerator
                      activeMaterial={activeMaterial}
                      setActiveMaterial={setActiveMaterial}
                      onQuizCompleted={handleQuizCompleted}
                    />
                  }
                />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}

