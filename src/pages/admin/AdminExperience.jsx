import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../../services/authApi';
import './AdminExperience.css';

const EMPTY_FORM = {
  position: '', company: '', type: '', startDate: '', endDate: '', current: false,
  description: '', responsibilities: [], technologies: [], location: '', link: '',
  order: 0, isActive: true
};

const TYPE_OPTIONS = ['', 'Full-time', 'Part-time', 'Freelance', 'Internship', 'Contract', 'Volunteer', 'Other'];

// ─── Array Tag Input ──────────────────────────────────────────────────────────
const TagInput = ({ label, placeholder, values, onChange, disabled, maxLen = 500 }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v || v.length > maxLen) return;
    if (!values.includes(v)) onChange([...values, v]);
    setInput('');
  };

  const remove = (idx) => onChange(values.filter((_, i) => i !== idx));
  const handleKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };

  return (
    <div className="tag-input-group">
      <label>{label}</label>
      <div className="tag-input-row">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey} placeholder={placeholder} disabled={disabled}
        />
        <button type="button" className="btn btn-sm btn-outline" onClick={add} disabled={disabled || !input.trim()}>Add</button>
      </div>
      {values.length > 0 && (
        <ul className="tags-list">
          {values.map((v, i) => (
            <li key={i} className="tag-list-item">
              <span>{v}</span>
              <button type="button" className="tag-remove" onClick={() => remove(i)} disabled={disabled} aria-label={`Remove item`}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({ experience, onConfirm, onCancel, deleting }) => {
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
        <h3 id="del-title">Delete Experience?</h3>
        <p>Are you sure you want to permanently delete <strong>{experience.position}</strong> at <strong>{experience.company}</strong>? This action cannot be undone.</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="btn btn-outline" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Experience'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminExperience ─────────────────────────────────────────────────────
const AdminExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCurrent, setFilterCurrent] = useState('');

  const addBtnRef = useRef(null);

  const loadExperience = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const res = await authApi.getAdminExperience();
      setExperiences(res.data?.experiences || []);
    } catch {
      setLoadError('Unable to load experience right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadExperience(); }, [loadExperience]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const validate = () => {
    const errs = {};
    if (!form.position.trim() || form.position.trim().length < 2) errs.position = 'Position is required (min 2 chars).';
    if (!form.company.trim() || form.company.trim().length < 2) errs.company = 'Company is required (min 2 chars).';
    if (!form.startDate.trim()) errs.startDate = 'Start date is required.';
    
    if (!form.description.trim() || form.description.trim().length < 10) {
        errs.description = 'Description is required (min 10 chars).';
    }

    if (!form.current && form.endDate) {
        // Basic check if end date is provided when not current.
        // We aren't doing deep Date parsing because dates can be 'Jan 2021'.
    }

    if (form.link) {
      try { new URL(form.link); } catch { errs.link = 'Must be a valid URL.'; }
    }

    const orderNum = Number(form.order);
    if (isNaN(orderNum) || orderNum < 0) errs.order = 'Order must be a non-negative number.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const payload = { ...form, order: Number(form.order) || 0 };
    if (payload.current) payload.endDate = '';

    try {
      if (editingExp) {
        const res = await authApi.updateExperience(editingExp._id, payload);
        setExperiences((prev) => prev.map((ex) => ex._id === editingExp._id ? res.data.experience : ex).sort((a, b) => a.order - b.order));
        showToast('Experience updated successfully.');
      } else {
        const res = await authApi.createExperience(payload);
        setExperiences((prev) => [...prev, res.data.experience].sort((a, b) => a.order - b.order));
        showToast('Experience created successfully.');
      }
      closeForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save this experience.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authApi.deleteExperience(deleteTarget._id);
      setExperiences((prev) => prev.filter((ex) => ex._id !== deleteTarget._id));
      showToast('Experience deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete experience.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (exp) => {
    try {
      const res = await authApi.updateExperienceStatus(exp._id, !exp.isActive);
      setExperiences((prev) => prev.map((e) => e._id === exp._id ? res.data.experience : e));
      showToast('Experience status updated.');
    } catch {
      showToast('Unable to update experience status.', 'error');
    }
  };

  const openCreate = () => { setEditingExp(null); setForm(EMPTY_FORM); setErrors({}); setShowForm(true); };
  const openEdit = (exp) => { setEditingExp(exp); setForm(exp); setErrors({}); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingExp(null); addBtnRef.current?.focus(); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newVal = type === 'checkbox' ? checked : value;
    setForm((p) => ({ ...p, [name]: newVal }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    
    if (name === 'current' && checked) {
        setForm(p => ({...p, endDate: ''}));
    }
  };

  const filtered = experiences.filter((ex) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      ex.position.toLowerCase().includes(q) ||
      ex.company.toLowerCase().includes(q) ||
      (ex.type || '').toLowerCase().includes(q) ||
      (ex.location || '').toLowerCase().includes(q) ||
      (ex.technologies || []).some((t) => t.toLowerCase().includes(q));
    const matchStatus = filterStatus === '' || (filterStatus === 'true' ? ex.isActive : !ex.isActive);
    const matchCurrent = filterCurrent === '' || (filterCurrent === 'true' ? ex.current : !ex.current);
    return matchSearch && matchStatus && matchCurrent;
  });

  return (
    <div className="admin-experience">
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal experience={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      <div className="exp-page-header">
        <div>
          <h2>Experience Management</h2>
          <p>Manage your professional experience and career history.</p>
        </div>
        <button ref={addBtnRef} className="btn btn-primary" onClick={openCreate} disabled={showForm}>
          + Add Experience
        </button>
      </div>

      {showForm && (
        <div className="exp-form-panel">
          <div className="exp-form-header">
            <h3>{editingExp ? 'Edit Experience' : 'Add Experience'}</h3>
            <button type="button" className="btn-icon" onClick={closeForm} aria-label="Close form">×</button>
          </div>
          <form onSubmit={handleSave} noValidate>
            
            <h4 className="form-section-title">Basic Information</h4>
            <div className="sf-grid">
              <div className="sf-group">
                <label>Position / Title *</label>
                <input name="position" type="text" value={form.position} onChange={handleChange} aria-invalid={!!errors.position} disabled={saving} />
                {errors.position && <span className="sf-error">{errors.position}</span>}
              </div>
              <div className="sf-group">
                <label>Company *</label>
                <input name="company" type="text" value={form.company} onChange={handleChange} aria-invalid={!!errors.company} disabled={saving} />
                {errors.company && <span className="sf-error">{errors.company}</span>}
              </div>
              <div className="sf-group">
                <label>Employment Type</label>
                <select name="type" value={form.type} onChange={handleChange} disabled={saving}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t || '—'}</option>)}
                </select>
              </div>
              <div className="sf-group">
                <label>Location</label>
                <input name="location" type="text" value={form.location} onChange={handleChange} disabled={saving} placeholder="e.g. New York, Remote" />
              </div>
            </div>

            <h4 className="form-section-title">Employment Details</h4>
            <div className="sf-grid align-end">
              <div className="sf-group">
                <label>Start Date *</label>
                <input name="startDate" type="text" value={form.startDate} onChange={handleChange} aria-invalid={!!errors.startDate} disabled={saving} placeholder="e.g. Jan 2022" />
                {errors.startDate && <span className="sf-error">{errors.startDate}</span>}
              </div>
              <div className="sf-group">
                <label>End Date {form.current && '(Disabled)'}</label>
                <input name="endDate" type="text" value={form.endDate} onChange={handleChange} disabled={saving || form.current} placeholder="e.g. Present, Dec 2023" />
              </div>
              <div className="sf-group sf-check-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="current" checked={form.current} onChange={handleChange} disabled={saving} />
                  I currently work here
                </label>
              </div>
            </div>

            <h4 className="form-section-title">Description</h4>
            <div className="sf-group sf-full mb-4">
              <label>Overview / Summary *</label>
              <textarea name="description" rows="4" value={form.description} onChange={handleChange} aria-invalid={!!errors.description} disabled={saving} />
              {errors.description && <span className="sf-error">{errors.description}</span>}
            </div>
            
            <h4 className="form-section-title">Responsibilities</h4>
            <TagInput label="Key Responsibilities" placeholder="e.g. Built REST APIs (press Enter)" values={form.responsibilities}
              onChange={(v) => setForm(p => ({...p, responsibilities: v}))} disabled={saving} />

            <h4 className="form-section-title">Technologies</h4>
            <div className="tech-tags-wrapper">
                <TagInput label="Technologies Used" placeholder="e.g. React.js (press Enter)" values={form.technologies}
                onChange={(v) => setForm(p => ({...p, technologies: v}))} disabled={saving} maxLen={100} />
            </div>

            <h4 className="form-section-title">Additional Info & Settings</h4>
            <div className="sf-grid">
               <div className="sf-group">
                <label>Company Link</label>
                <input name="link" type="url" value={form.link} onChange={handleChange} aria-invalid={!!errors.link} disabled={saving} placeholder="https://..." />
                {errors.link && <span className="sf-error">{errors.link}</span>}
              </div>
              <div className="sf-group">
                <label>Display Order</label>
                <input name="order" type="number" min="0" value={form.order} onChange={handleChange} aria-invalid={!!errors.order} disabled={saving} />
                {errors.order && <span className="sf-error">{errors.order}</span>}
              </div>
            </div>

            <div className="sf-toggles mt-4">
              <label className="toggle-switch-label">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                Active — Visible on the public portfolio
              </label>
            </div>

            <div className="sf-actions">
              <button type="button" className="btn btn-outline" onClick={closeForm} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : (editingExp ? 'Save Changes' : 'Create Experience')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadError && (
        <div className="admin-alert error" role="alert">
          <p>{loadError}</p>
          <button className="btn btn-sm btn-outline" onClick={loadExperience}>Retry</button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="exp-controls">
          <div className="exp-search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="exp-search" type="text" placeholder="Search experience…"
              value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search experience" />
          </div>
          <select className="exp-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status">
            <option value="">Status: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select className="exp-filter" value={filterCurrent} onChange={(e) => setFilterCurrent(e.target.value)} aria-label="Filter by current">
            <option value="">Time: All</option>
            <option value="true">Current Role</option>
            <option value="false">Previous Role</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="exp-empty"><div className="spinner" /><p>Loading experience…</p></div>
      ) : !loadError && filtered.length === 0 ? (
        <div className="exp-empty">
          {experiences.length === 0 ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p>No experience records have been added yet.</p>
              <button className="btn btn-primary mt-2" onClick={openCreate}>Add Experience</button>
            </>
          ) : (
            <>
              <p>No experience matches your filters.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setFilterStatus(''); setFilterCurrent(''); }}>Clear filters</button>
            </>
          )}
        </div>
      ) : !loadError ? (
        <>
          {/* Desktop Table */}
          <div className="exp-table-wrap">
            <table className="exp-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Current</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ex) => (
                  <tr key={ex._id} className={!ex.isActive ? 'row-inactive' : ''}>
                    <td><span className="fw-600">{ex.position}</span></td>
                    <td>{ex.company}</td>
                    <td>{ex.type || '—'}</td>
                    <td className="ws-nowrap text-sm">{ex.startDate} — {ex.current ? 'Present' : ex.endDate || '—'}</td>
                    <td>
                      {ex.current ? <span className="badge badge-current">Current</span> : <span className="badge badge-past">Past</span>}
                    </td>
                    <td>
                      <button className={`status-toggle ${ex.isActive ? 'status-active' : 'status-inactive'}`}
                        onClick={() => handleToggleStatus(ex)} aria-label={`Toggle status`}>
                        {ex.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>{ex.order}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon-sm" onClick={() => openEdit(ex)} title="Edit">✏️</button>
                        <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(ex)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="exp-cards">
            {filtered.map((ex) => (
              <div key={ex._id} className={`exp-card ${!ex.isActive ? 'card-inactive' : ''}`}>
                <div className="exp-card-header">
                  <div>
                    <h4 className="exp-card-title">{ex.position}</h4>
                    <p className="exp-card-company">{ex.company} {ex.type && `· ${ex.type}`}</p>
                    <p className="exp-card-dates">{ex.startDate} — {ex.current ? 'Present' : ex.endDate}</p>
                  </div>
                  <div className="action-btns">
                    <button className="btn-icon-sm" onClick={() => openEdit(ex)}>✏️</button>
                    <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(ex)}>🗑️</button>
                  </div>
                </div>
                <div className="exp-card-meta">
                   {ex.current && <span className="badge badge-current">Current</span>}
                   <button className={`status-toggle ${ex.isActive ? 'status-active' : 'status-inactive'}`}
                    onClick={() => handleToggleStatus(ex)}>{ex.isActive ? 'Active' : 'Inactive'}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminExperience;
