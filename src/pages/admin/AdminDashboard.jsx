import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.getAdminDashboardOverview();
      setData(res.data);
    } catch (err) {
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="admin-dashboard-error">
        <p>{error}</p>
        <button className="btn btn-outline mt-3" onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  const { statistics: stats, profile, settings, recentMessages, system } = data;

  const formatDate = (dateStr) => {
    try {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-dashboard">
      
      {/* ── HEADER ── */}
      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">Administration</span>
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-desc">Manage and monitor your portfolio from one place.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* ── STATISTICS GRID ── */}
      <div className="dashboard-grid stats-grid">
        <div className="stat-card">
          <h4>Projects</h4>
          <div className="stat-value">{stats.projects.total}</div>
          <div className="stat-meta">
             <span className="text-success">{stats.projects.active} Active</span> • {stats.projects.inactive} Inactive
          </div>
        </div>
        <div className="stat-card">
          <h4>Skills</h4>
          <div className="stat-value">{stats.skills.total}</div>
          <div className="stat-meta">
            <span className="text-success">{stats.skills.active} Active</span> • {stats.skills.inactive} Inactive
          </div>
        </div>
        <div className="stat-card">
          <h4>Experience</h4>
          <div className="stat-value">{stats.experience.total}</div>
          <div className="stat-meta">
            <span className="text-primary">{stats.experience.current} Current</span> • {stats.experience.active} Active
          </div>
        </div>
        <div className="stat-card">
          <h4>Messages</h4>
          <div className="stat-value">{stats.messages.total}</div>
          <div className="stat-meta">
             <span className="text-warning">{stats.messages.new} New</span> • {stats.messages.read} Read
          </div>
        </div>
      </div>

      <div className="dashboard-grid main-grid">
        
        {/* ── LEFT COLUMN ── */}
        <div className="dashboard-col left-col">
          
          <div className="dash-panel">
            <h3 className="panel-title">Content Overview</h3>
            <div className="overview-list">
               <div className="overview-item">
                  <div className="oi-info">
                     <strong>Education</strong>
                     <span>{stats.education.total} records • {stats.education.active} active</span>
                  </div>
                  <Link to="/admin/education" className="btn-link">Manage</Link>
               </div>
               <div className="overview-item">
                  <div className="oi-info">
                     <strong>Certifications</strong>
                     {stats.certifications.total === 0 ? (
                        <span className="text-muted">No certifications added</span>
                     ) : (
                        <span>{stats.certifications.total} records • {stats.certifications.active} active</span>
                     )}
                  </div>
                  <Link to="/admin/certifications" className="btn-link">Manage</Link>
               </div>
               <div className="overview-item">
                  <div className="oi-info">
                     <strong>Services</strong>
                     {stats.services.total === 0 ? (
                        <span className="text-muted">No services configured</span>
                     ) : (
                        <span>{stats.services.total} records • {stats.services.active} active</span>
                     )}
                  </div>
                  <Link to="/admin/services" className="btn-link">Manage</Link>
               </div>
            </div>
          </div>

          <div className="dash-panel">
            <h3 className="panel-title">Recent Messages</h3>
            {recentMessages && recentMessages.length > 0 ? (
              <div className="recent-msg-list">
                 {recentMessages.map(msg => (
                    <div key={msg._id} className={`recent-msg-card ${msg.status === 'new' ? 'msg-is-new' : ''}`}>
                       <div className="rm-header">
                          <span className="rm-sender">{msg.name}</span>
                          <span className="rm-date">{formatDate(msg.createdAt)}</span>
                       </div>
                       <div className="rm-subject">{msg.subject}</div>
                       <div className="rm-meta">
                          <span className={`badge badge-${msg.status}`}>{msg.status}</span>
                          {msg.projectType && <span className="badge badge-outline">{msg.projectType}</span>}
                       </div>
                    </div>
                 ))}
                 <Link to="/admin/messages" className="btn btn-outline btn-full mt-3">View All Messages</Link>
              </div>
            ) : (
              <div className="dash-empty">
                 <p>No messages yet.</p>
                 <small>Messages submitted through your contact form will appear here.</small>
              </div>
            )}
          </div>
          
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="dashboard-col right-col">
          
          <div className="dash-panel">
            <h3 className="panel-title">Portfolio Status</h3>
            <ul className="status-list">
               <li>
                 <span>Profile</span>
                 {profile.exists ? (
                    <span className="status-badge success">Configured</span>
                 ) : (
                    <span className="status-badge error">Not Configured</span>
                 )}
               </li>
               <li>
                 <span>Portfolio</span>
                 {settings.portfolioVisible ? (
                    <span className="status-badge success">Visible</span>
                 ) : (
                    <span className="status-badge warning">Hidden</span>
                 )}
               </li>
               <li>
                 <span>Availability</span>
                 {profile.isAvailable ? (
                    <span className="status-badge success">Available</span>
                 ) : (
                    <span className="status-badge neutral">Unavailable</span>
                 )}
               </li>
               <li>
                 <span>Contact Form</span>
                 {settings.contactFormEnabled ? (
                    <span className="status-badge success">Enabled</span>
                 ) : (
                    <span className="status-badge warning">Disabled</span>
                 )}
               </li>
            </ul>
            <div className="status-actions">
               <Link to="/admin/profile" className="btn btn-outline btn-sm">Manage Profile</Link>
               <Link to="/admin/settings" className="btn btn-outline btn-sm">Manage Settings</Link>
            </div>
          </div>

          <div className="dash-panel">
            <h3 className="panel-title">System Status</h3>
            <ul className="status-list">
               <li>
                 <span>Database</span>
                 {system.database === 'connected' ? (
                   <span className="status-badge success">Connected</span>
                 ) : (
                   <span className="status-badge error">Disconnected</span>
                 )}
               </li>
               <li>
                 <span>Server</span>
                 <span className="status-badge success">Running</span>
               </li>
            </ul>
          </div>

          <div className="dash-panel">
            <h3 className="panel-title">Quick Actions</h3>
            <div className="quick-actions-grid">
               <Link to="/admin/projects" className="quick-btn">Projects</Link>
               <Link to="/admin/skills" className="quick-btn">Skills</Link>
               <Link to="/admin/messages" className="quick-btn">Messages</Link>
               <Link to="/admin/services" className="quick-btn">Services</Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
