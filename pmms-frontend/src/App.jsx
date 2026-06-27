import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import "./components/Dashboard.css"; 
import './index.css';
import Projects from './components/Projects';

// 🏢 UNIFIED INTERFACE LAYOUT
function AppLayout() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; 
  };

  return (
    <div className="dashboard-layout-container">
      {/* Single Clean Sidebar Panel */}
      <aside className="pmms-sidebar-panel">
        <div className="sidebar-brand">
          <span className="brand-dot"></span> TASK MANAGER
        </div>
        
        <nav className="sidebar-menu">
          <Link to="/dashboard" className={`menu-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <span className="menu-icon">📊</span> Dashboard
          </Link>
          
          <Link to="/projects" className={`menu-link ${location.pathname === '/projects' ? 'active' : ''}`}>
            <span className="menu-icon">📁</span> Projects
          </Link>
          
          <Link to="/tasks" className={`menu-link ${location.pathname === '/tasks' ? 'active' : ''}`}>
            <span className="menu-icon">📝</span> Tasks
          </Link>
        </nav>

        <button onClick={handleLogout} className="menu-link logout-btn">
          <span className="menu-icon">🚪</span> Session Exit
        </button>
      </aside>

      {/* Main View Area Viewport */}
      <main className="dashboard-wrapper">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
    </div>
  );
}

// 🌐 GLOBAL ROUTER GUARD ENGINE
function App() {
  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/*" 
          element={isAuthenticated() ? <AppLayout /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;