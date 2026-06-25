import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';

// 🏢 UNIFIED INTERFACE LAYOUT (Your existing layout structure wrapped for protected views)
function AppLayout() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; // Clear token and force redirect to login
  };

  return (
    <div className="app-layout">
      {/* Your Sidebar - Kept exactly as you designed it, updated with React Router Links */}
      <aside className="sidebar">
        <div className="logo">PMMS Panel</div>
        <nav className="nav-menu">
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>📊 Dashboard</Link>
          <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>📁 Projects</Link>
          <Link to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}>📝 Tasks</Link>
          <button onClick={handleLogout} className="logout-btn">🚪 Session Exit</button>
        </nav>
      </aside>

      {/* Main content dynamically switches between your internal dashboard modules */}
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Fallback routing for internal modules */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<div className="glass-card">Coming Soon...</div>} />
        </Routes>
      </main>
    </div>
  );
}

// 🌐 GLOBAL ROUTER GUARDENGINE
function App() {
  // Checks if a token exists dynamically on every single route change
  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Public Gateway Entrypoint */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routing Guard - Sends non-logged in users automatically to /login */}
        <Route 
          path="/*" 
          element={isAuthenticated() ? <AppLayout /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;