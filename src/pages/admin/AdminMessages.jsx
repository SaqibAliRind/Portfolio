import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../../services/authApi';
import './AdminMessages.css';

const STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Read', value: 'read' },
  { label: 'Replied', value: 'replied' },
  { label: 'Archived', value: 'archived' }
];

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({ msg, onConfirm, onCancel, deleting }) => {
  const cancelRef = useRef(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const h = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="del-title">
      <div className="modal-box">
        <h3 id="del-title">Delete Message?</h3>
        <p>Are you sure you want to permanently delete the message from <strong>{msg.name}</strong>? This action cannot be undone.</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="btn btn-outline" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Message Details Modal ──────────────────────────────────────────────────
const MessageDetailsModal = ({ msg, onClose, onStatusChange }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium', timeStyle: 'short'
      }).format(new Date(dateString));
    } catch { return dateString; }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="msg-detail-title">
      <div className="modal-box msg-detail-box">
        <div className="msg-detail-header">
           <h3 id="msg-detail-title">Message Details</h3>
           <button type="button" className="btn-icon" onClick={onClose} aria-label="Close details">×</button>
        </div>

        <div className="msg-detail-content">
           <div className="msg-detail-meta">
              <div>
                 <strong>From:</strong> {msg.name}
              </div>
              <div>
                 <strong>Email:</strong> <a href={`mailto:${msg.email}`}>{msg.email}</a>
              </div>
              <div>
                 <strong>Received:</strong> {formatDate(msg.createdAt)}
              </div>
              {msg.projectType && (
                 <div>
                    <strong>Project Type:</strong> {msg.projectType}
                 </div>
              )}
           </div>
           
           <div className="msg-detail-subject">
              <strong>Subject:</strong> {msg.subject}
           </div>

           <div className="msg-detail-body">
              {msg.message}
           </div>
        </div>

        <div className="msg-detail-footer">
           <div className="msg-status-control">
              <label>Update Status:</label>
              <select value={msg.status} onChange={(e) => onStatusChange(msg._id, e.target.value)}>
                 {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                 ))}
              </select>
           </div>
           
           <div className="msg-detail-actions">
              <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
                 Reply via Email
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminMessages ──────────────────────────────────────────────────────
const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewMessage, setViewMessage] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const loadMessages = useCallback(async (pageToLoad = 1) => {
    setLoading(true); setLoadError('');
    try {
      const res = await authApi.getAdminMessages({
        page: pageToLoad, limit: pagination.limit,
        search: debouncedSearch, status: statusFilter
      });
      setMessages(res.data?.messages || []);
      setPagination(res.data?.pagination || { page: 1, limit: 20, totalPages: 1 });
    } catch {
      setLoadError('Unable to load messages right now.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, pagination.limit]);

  useEffect(() => {
    loadMessages(1); // Reload from page 1 on filter/search change
  }, [debouncedSearch, statusFilter]); // intentionally omit loadMessages to avoid infinite loops due to dependency issues, safe here because filters dictate full refresh

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authApi.deleteMessage(deleteTarget._id);
      setMessages((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      showToast('Message deleted successfully.');
      if (viewMessage && viewMessage._id === deleteTarget._id) setViewMessage(null);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete message.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await authApi.updateMessageStatus(id, newStatus);
      const updatedMsg = res.data.message;
      setMessages(prev => prev.map(m => m._id === id ? updatedMsg : m));
      if (viewMessage && viewMessage._id === id) setViewMessage(updatedMsg);
      showToast(`Message marked as ${newStatus}`);
    } catch {
      showToast('Unable to update status.', 'error');
    }
  };

  const openMessage = (msg) => {
    setViewMessage(msg);
    if (msg.status === 'new') {
       handleStatusChange(msg._id, 'read'); // Auto-read on open
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      }).format(new Date(dateString));
    } catch { return dateString; }
  };

  return (
    <div className="admin-messages">
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal msg={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      {viewMessage && (
        <MessageDetailsModal msg={viewMessage} onClose={() => setViewMessage(null)}
          onStatusChange={handleStatusChange} />
      )}

      <div className="msg-page-header">
        <div>
          <h2>Messages Management</h2>
          <p>Review and manage contact form submissions.</p>
        </div>
      </div>

      <div className="msg-controls">
        <div className="msg-search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="msg-search" type="text" placeholder="Search messages..."
            value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search messages" />
        </div>
        
        <select className="msg-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="">Status: All</option>
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {loadError && (
        <div className="admin-alert error" role="alert">
          <p>{loadError}</p>
          <button className="btn btn-sm btn-outline" onClick={() => loadMessages(pagination.page)}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="msg-empty"><div className="spinner" /><p>Loading messages…</p></div>
      ) : !loadError && messages.length === 0 ? (
        <div className="msg-empty">
          {(!search && !statusFilter) ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                 <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                 <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <p>No messages yet.</p>
            </>
          ) : (
            <>
              <p>No messages match your current filters.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setStatusFilter(''); }}>Reset Filters</button>
            </>
          )}
        </div>
      ) : !loadError ? (
        <>
          {/* Desktop Table */}
          <div className="msg-table-wrap">
            <table className="msg-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Project Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg._id} className={msg.status === 'new' ? 'row-new' : ''}>
                    <td>
                        <div className="msg-sender">
                            <span className="fw-600">{msg.name}</span>
                            <span className="text-xs text-muted">{msg.email}</span>
                        </div>
                    </td>
                    <td>
                      <div className="msg-subject-trunc">{msg.subject}</div>
                    </td>
                    <td>{msg.projectType || '—'}</td>
                    <td>
                       <span className={`msg-badge msg-badge-${msg.status}`}>
                         {msg.status}
                       </span>
                    </td>
                    <td className="ws-nowrap text-sm">{formatDate(msg.createdAt)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon-sm" onClick={() => openMessage(msg)} title="View Message">👁️</button>
                        <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(msg)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="msg-cards">
            {messages.map((msg) => (
              <div key={msg._id} className={`msg-card ${msg.status === 'new' ? 'card-new' : ''}`}>
                <div className="msg-card-header">
                  <div>
                    <h4 className="msg-card-name">{msg.name}</h4>
                    <p className="msg-card-email">{msg.email}</p>
                  </div>
                  <div className="action-btns">
                    <button className="btn-icon-sm" onClick={() => openMessage(msg)}>👁️</button>
                    <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(msg)}>🗑️</button>
                  </div>
                </div>
                <div className="msg-card-body">
                   <p className="msg-card-subject"><strong>{msg.subject}</strong></p>
                   <p className="msg-card-dates">{formatDate(msg.createdAt)}</p>
                </div>
                <div className="msg-card-meta">
                   <span className={`msg-badge msg-badge-${msg.status}`}>{msg.status}</span>
                   {msg.projectType && <span className="badge badge-past">{msg.projectType}</span>}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="msg-pagination">
                <button className="btn btn-outline btn-sm" disabled={pagination.page <= 1} onClick={() => loadMessages(pagination.page - 1)}>Previous</button>
                <span className="msg-page-info">Page {pagination.page} of {pagination.totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => loadMessages(pagination.page + 1)}>Next</button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default AdminMessages;
