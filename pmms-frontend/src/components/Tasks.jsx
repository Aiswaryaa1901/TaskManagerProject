import React, { useState, useEffect } from 'react';
import './Tasks.css'; 

function Tasks() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // Form State
  const [newTaskName, setNewTaskName] = useState(''); 
  const [formProjectId, setFormProjectId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      window.location.href = '/login';
      return true;
    }
    return false;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects', { 
          method: 'GET', 
          headers: getAuthHeaders()
        });
        
        if (handleAuthError(response)) return;
        if (!response.ok) throw new Error('Failed to load projects.');
        const data = await response.json();
        setProjects(data);
        
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
          setFormProjectId(data[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchTasksForProject = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/projects/${selectedProjectId}/tasks`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        
        if (handleAuthError(response)) return;
        if (!response.ok) throw new Error('Failed to fetch tasks.');
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchTasksForProject();
  }, [selectedProjectId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim() || !formProjectId) return;

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newTaskName,
          project_id: formProjectId,
          status: 'Pending'
        })
      });

      if (handleAuthError(response)) return;
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Could not create task.');
      }
      
      const freshlyCreatedTask = await response.json();

      if (formProjectId === selectedProjectId) {
        setTasks((prev) => [...prev, freshlyCreatedTask]);
      }
      
      setNewTaskName('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (task) => {
    const updatedStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: updatedStatus })
      });

      if (handleAuthError(response)) return;
      if (!response.ok) throw new Error('Failed to update task.');
      
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: updatedStatus } : t))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // New Feature: Delete Task Frontend Connection
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to permanently clear this task row?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (handleAuthError(response)) return;
      if (!response.ok) throw new Error('Failed to remove task from ledger.');

      // Instantly remove from UI state
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'Pending';
    if (filter === 'completed') return task.status === 'Completed';
    return true;
  });

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading Workspace...</p></div>;
  if (error) return <div className="error-panel">⚠️ Error: {error}</div>;

  return (
    <div className="workspace-view-container">
      <div className="workspace-hero-bar">
        <div className="hero-meta">
          <h1>Tasks Focus Desk</h1>
          <p>Monitor and commit task operations across clusters</p>
        </div>
        
        <div className="project-dropdown-pill">
          <label>Project Scope:</label>
          <select 
            value={selectedProjectId} 
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setFormProjectId(e.target.value);
            }}
          >
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.name || proj.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="workspace-command-center">
        <div className="command-card inline-form-wrapper">
          <form onSubmit={handleAddTask} className="inline-quick-add-form">
            <input 
              type="text" 
              placeholder="⚡ Type a task description and strike Enter..." 
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              required
            />
            <button type="submit" className="add-task-submit-pill">Add Task</button>
          </form>
        </div>
      </div>

      <div className="workspace-filter-tabs-row">
        <button className={`tab-pill-item ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All Tracked ({tasks.length})
        </button>
        <button className={`tab-pill-item ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          Pending ⏳ ({tasks.filter(t => t.status === 'Pending').length})
        </button>
        <button className={`tab-pill-item ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          Completed ✅ ({tasks.filter(t => t.status === 'Completed').length})
        </button>
      </div>

      <div className="workspace-feed-stream">
        {filteredTasks.length === 0 ? (
          <div className="empty-stream-card">
            <p>Clear view. No execution blocks found inside this filter context.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className={`stream-item-card-row ${task.status === 'Completed' ? 'item-finished' : ''}`}>
              <div className="item-card-left-meta">
                <span className={`status-dot-indicator ${task.status}`}></span>
                <p className="item-card-text-title">{task.title || task.name}</p>
              </div>
              
              <div className="item-card-right-actions">
                <button 
                  className={`item-status-pill-toggle ${task.status === 'Completed' ? 'is-complete' : 'is-pending'}`}
                  onClick={() => handleToggleStatus(task)}
                >
                  {task.status === 'Completed' ? '✓ Completed' : 'Commit Done'}
                </button>

                {/* 🚨 Integrated Inline Delete Action */}
                <button 
                  className="item-delete-btn" 
                  onClick={() => handleDeleteTask(task.id)}
                  title="Delete Task Row"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tasks;