import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    total_projects: 0,
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token'); 
const response = await fetch(`${API_BASE_URL}/api/projects/analytics/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch live database analytics');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading Dashboard...</p></div>;
  if (error) return <div className="error-panel">⚠️ Error: {error}</div>;

  const completionRate = stats.total_tasks > 0 
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
    : 0;

  return (
    <div className="dashboard-content-wrapper">
      {/* Top Navbar */}
      <header className="dashboard-top-nav">
        <div className="welcome-meta">
          <h1>Analytics Workspace</h1>
          <p>Task Manager System Overview</p>
        </div>
        <div className="system-status-pill">
          <span className="pulse-dot"></span> Active Session
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="dashboard-content-layout">
        
        {/* Metric Cards Matrix */}
        <section className="metrics-matrix">
          <div className="theme-card">
            <div className="stat-header">
              <span>Total Projects</span>
              <span className="icon">📁</span>
            </div>
            <h2>{stats.total_projects}</h2>
          </div>

          <div className="theme-card">
            <div className="stat-header">
              <span>Total Tasks</span>
              <span className="icon">📝</span>
            </div>
            <h2>{stats.total_tasks}</h2>
          </div>

          <div className="theme-card">
            <div className="stat-header">
              <span>Completed Tasks</span>
              <span className="icon">✅</span>
            </div>
            <h2 className="text-lime">{stats.completed_tasks}</h2>
          </div>

          <div className="theme-card">
            <div className="stat-header">
              <span>Pending Tasks</span>
              <span className="icon">⏳</span>
            </div>
            <h2 className="text-amber">{stats.pending_tasks}</h2>
          </div>
        </section>

        {/* Analytics & Insights Rows */}
        <section className="insights-row">
          {/* Progress Insight */}
          <div className="theme-card large-panel">
            <h3>Task Completion Progress</h3>
            <div className="progress-container-box">
              <div className="progress-percentage-label">{completionRate}%</div>
              <div className="progress-track-bar">
                <div className="progress-fill-bar" style={{ width: `${completionRate}%` }}></div>
              </div>
            </div>
          </div>

          {/* Predictive Warnings Banner */}
          <div className="theme-card warning-banner-card">
            <h3>⚠️ Backlog Warning</h3>
            <div className="alert-content">
              <p>You have <strong>{stats.pending_tasks}</strong> pending tasks remaining.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;