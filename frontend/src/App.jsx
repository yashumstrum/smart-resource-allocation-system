// frontend/src/App.jsx
/*
  FUTURE SCOPE:
  - Advanced ML prediction models
  - IoT integration
  - Mobile app version
  - Industry-specific optimization
*/
import { useState } from 'react';
import axios from 'axios';
import { Bot, PlusCircle, Users, Briefcase, Zap, AlertCircle } from 'lucide-react';
import './index.css';

function App() {
  const [resources, setResources] = useState([
    { id: 1, name: 'Alice (Senior Dev)' },
    { id: 2, name: 'Bob (Data Scientist)' },
    { id: 3, name: 'Charlie (Cloud Engineer)' }
  ]);
  
  const [tasks, setTasks] = useState([
    { id: 1, taskName: 'Deploy ML Model', priority: 'High' },
    { id: 2, taskName: 'Setup CI/CD Pipeline', priority: 'Medium' },
    { id: 3, taskName: 'Update Documentation', priority: 'Low' }
  ]);

  const [newResource, setNewResource] = useState('');
  const [newTask, setNewTask] = useState({ name: '', priority: 'Medium' });
  
  const [allocations, setAllocations] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [method, setMethod] = useState('');

  const addResource = (e) => {
    e.preventDefault();
    if (!newResource.trim()) return;
    setResources(prev => [...prev, { id: Date.now(), name: newResource }]);
    setNewResource('');
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.name.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), taskName: newTask.name, priority: newTask.priority }]);
    setNewTask({ name: '', priority: 'Medium' });
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setMethod('');
    try {
      // Use VITE_API_URL if provided, otherwise default to Netlify Function path
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const endpoint = apiUrl ? `${apiUrl}/api/allocate` : '/.netlify/functions/allocate';
      
      // If running locally and no API URL is set, fallback to local backend for development
      const finalEndpoint = (!apiUrl && window.location.hostname === 'localhost') 
        ? 'http://localhost:5001/api/allocate' 
        : endpoint;

      const response = await axios.post(finalEndpoint, {
        resources,
        tasks
      });
      setAllocations(response.data.allocations);
      setMethod(response.data.method);
    } catch (error) {
      console.error('Error optimizing:', error);
      alert('Failed to connect to the backend. Please ensure the server is running on port 5001.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Smart Resource Allocation</h1>
        <p>AI-Powered Optimization Engine</p>
      </div>

      <div className="grid">
        <div className="input-panels">
          <div className="panel" style={{ marginBottom: '2rem' }}>
            <h2><Users size={20} /> Resources</h2>
            <form onSubmit={addResource} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="E.g. Server X, Engineer Y" 
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" style={{ width: 'auto', marginBottom: 0 }}>
                  <PlusCircle size={20} />
                </button>
              </div>
            </form>
            
            <div className="list">
              {resources.map(r => (
                <div key={r.id} className="list-item">
                  <span>{r.name}</span>
                </div>
              ))}
              {resources.length === 0 && <p className="text-muted" style={{fontSize: '0.875rem'}}>No resources added.</p>}
            </div>
          </div>

          <div className="panel">
            <h2><Briefcase size={20} /> Tasks</h2>
            <form onSubmit={addTask} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Task Name" 
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  className="form-control" 
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <button type="submit" className="btn btn-secondary" style={{ width: 'auto', marginBottom: 0 }}>
                  <PlusCircle size={20} />
                </button>
              </div>
            </form>
            
            <div className="list">
              {tasks.map(t => (
                <div key={t.id} className="list-item">
                  <span>{t.taskName}</span>
                  <span className={`badge ${t.priority.toLowerCase()}`}>{t.priority}</span>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-muted" style={{fontSize: '0.875rem'}}>No tasks added.</p>}
            </div>
          </div>

          <button 
            className="btn" 
            style={{ marginTop: '2rem', padding: '1rem' }} 
            onClick={handleOptimize}
            disabled={isOptimizing || resources.length === 0 || tasks.length === 0}
          >
            {isOptimizing ? 'Optimizing...' : <><Bot size={20} /> Allocate Resources</>}
          </button>
        </div>

        <div className="panel dashboard">
          <h2><Zap size={20} /> Optimized Output Dashboard</h2>
          
          {isOptimizing ? (
            <div className="loader">
              <div className="spinner"></div>
              <p>AI is optimizing resource allocation...</p>
            </div>
          ) : allocations.length > 0 ? (
            <>
              <div className="results-grid">
                {allocations.map((alloc, idx) => (
                  <div key={idx} className={`result-card priority-${alloc.priority}`}>
                    <div className="card-header">
                      <span className="task-name">{alloc.taskName}</span>
                      <span className={`badge ${alloc.priority.toLowerCase()}`}>{alloc.priority}</span>
                    </div>
                    <div className="resource-assigned">
                      <Users size={16} /> {alloc.assignedResource}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <span>Efficiency Score</span>
                        <span>{alloc.efficiencyScore}%</span>
                      </div>
                      <div className="efficiency-bar">
                        <div className="efficiency-fill" style={{ width: `${alloc.efficiencyScore}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <span className="method-badge">
                  Generated via {method} Engine
                </span>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <AlertCircle size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>Run the AI allocation to see optimized results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
