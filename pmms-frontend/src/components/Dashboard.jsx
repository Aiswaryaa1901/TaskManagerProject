import React, { useState, useEffect } from 'react';
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
        const response = await fetch('http://localhost:5000/api/projects/analytics/dashboard', {
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

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Syncing with PMMS Core Engine...</p></div>;
  if (error) return <div className="error-panel">⚠️ Core Engine Error: {error}</div>;

  // Dynamic Insight Calculations
  const completionRate = stats.total_tasks > 0 
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
    : 0;

  return (
    <div className="dashboard-wrapper">
      {/* Top Glassmorphic Navbar */}
      <header className="dashboard-top-nav">
        <div className="welcome-meta">
          <h1>Analytics Workspace</h1>
          <p>Predictive Memory Management System Engine Active</p>
        </div>
        <div className="system-status-pill">
          <span className="pulse-dot"></span> Core Status: Operational
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="dashboard-content-layout">
        
        {/* Metric Cards Matrix */}
        <section className="metrics-matrix">
          <div className="glass-card stat-box">
            <div className="stat-header">
              <span>Active Clusters</span>
              <div className="icon-wrapper blue-bg">📁</div>
            </div>
            <h2>{stats.total_projects}</h2>
            <p className="stat-footer">Total Allocated Projects</p>
          </div>

          <div className="glass-card stat-box">
            <div className="stat-header">
              <span>Memory Instructions</span>
              <div className="icon-wrapper purple-bg">📝</div>
            </div>
            <h2>{stats.total_tasks}</h2>
            <p className="stat-footer">Total Registered Tasks</p>
          </div>

          <div className="glass-card stat-box">
            <div className="stat-header">
              <span>Optimized Blocks</span>
              <div className="icon-wrapper green-bg">✅</div>
            </div>
            <h2 className="text-success">{stats.completed_tasks}</h2>
            <p className="stat-footer">Completed Processes</p>
          </div>

          <div className="glass-card stat-box">
            <div className="stat-header">
              <span>Pending Allocations</span>
              <div className="icon-wrapper amber-bg">⏳</div>
            </div>
            <h2 className="text-warning">{stats.pending_tasks}</h2>
            <p className="stat-footer">Awaiting Execution</p>
          </div>
        </section>

        {/* New Analytics & Insights Rows */}
        <section className="insights-row">
          {/* Progress Insight */}
          <div className="glass-card insight-panel large">
            <h3>System Optimization Progress</h3>
            <div className="progress-container-box">
              <div className="progress-percentage-label">{completionRate}%</div>
              <div className="progress-track-bar">
                <div className="progress-fill-bar" style={{ width: `${completionRate}%` }}></div>
              </div>
            </div>
            <p className="insight-desc">
              Current process execution ratio based on total task allocations in relational memory schemas.
            </p>
          </div>

          {/* Predictive Warnings Banner */}
          <div className="glass-card insight-panel warning-banner-card">
            <h3>⚠️ Predictive Engine Warning</h3>
            <div className="alert-content">
              <p><strong>High Backlog Detected:</strong> You have <strong>{stats.pending_tasks}</strong> unexecuted memory instructions pending allocation.</p>
              <span className="recommedation-tag">Action Advised: Clear outstanding pending tasks to balance system loads.</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;