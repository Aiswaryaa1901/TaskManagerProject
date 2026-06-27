import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('https://task-manager-app-fggc.onrender.com/api/projects', { method: 'GET', headers });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error('Failed to load project directories.');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('https://task-manager-app-fggc.onrender.com/api/projects', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc
        })
      });

      if (!response.ok) throw new Error('Could not create new workspace cluster.');
      
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  // 🗑️ Handle Deleting a Project Cluster
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to completely wipe this project cluster? All attached tasks might be lost!")) return;

    try {
      const response = await fetch(`https://task-manager-app-fggc.onrender.com/api/projects/${projectId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) throw new Error('Failed to remove this project workspace.');

      // Instantly remove from local state matrix array layout
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Syncing Project Matrix...</p></div>;
  if (error) return <div className="error-panel">⚠️ Error: {error}</div>;

  return (
    <div className="dashboard-content-wrapper">
      <header className="dashboard-top-nav">
        <div className="welcome-meta">
          <h1>Project Clusters</h1>
          <p>Configure workspace environments and architectural roots</p>
        </div>
      </header>

      <div className="projects-workspace-layout">
        <div className="projects-grid-matrix">
          {projects.length === 0 ? (
            <div className="theme-card empty-state">
              <p>No active project environments found. Initialize one on the right panel.</p>
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} className="theme-card project-matrix-card">
                <div className="project-card-identity">
                  <div className="project-status-cluster">
                    <span className="cluster-indicator-node"></span>
                    <span className="cluster-meta-tag">Active Root</span>
                  </div>
                  <h3 className="project-card-title">{proj.name || proj.title}</h3>
                  <p className="project-card-desc">
                    {proj.description || "No supplemental description provided for this development workspace."}
                  </p>
                </div>

                <div className="project-card-footer">
                  <span className="project-id-badge">📁 ID: {proj.id.substring(0, 8)}...</span>
                  
                  {/* 🚨 Red Action Trash Control */}
                  <button 
                    className="project-delete-btn"
                    onClick={() => handleDeleteProject(proj.id)}
                    title="Delete Project Cluster"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="theme-card quick-add-task-panel project-creator-sidebar">
          <h3>Initialize Cluster</h3>
          <form onSubmit={handleCreateProject} className="quick-task-form">
            <div className="form-group-block">
              <label>Project Name</label>
              <input 
                type="text" 
                placeholder="e.g., Premium Interface System" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
            </div>

            <div className="form-group-block">
              <label>Description / Scope</label>
              <textarea 
                className="theme-textarea"
                rows="4"
                placeholder="Detail the architecture or purpose of this cluster..." 
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
              />
            </div>

            <button type="submit" className="cyber-pill-btn">⚡ Deploy Cluster</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Projects;