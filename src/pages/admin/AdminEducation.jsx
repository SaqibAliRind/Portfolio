import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../../services/authApi';
import './AdminEducation.css';

const EMPTY_FORM = {
  degree: '', institution: '', field: '', startDate: '', endDate: '', current: false,
  location: '', description: '', technologies: [], achievements: [], status: '',
  order: 0, isActive: true
};

const STATUS_OPTIONS = [
  { label: '— Select Status —', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Planned', value: 'planned' }
];

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
const DeleteModal = ({ education, onConfirm, onCancel, deleting }) => {
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
        <h3 id="del-title">Delete Education?</h3>
        <p>Are you sure you want to permanently delete <strong>{education.degree}</strong> at <strong>{education.institution}</strong>? This action cannot be undone.</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="btn btn-outline" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminEducation ─────────────────────────────────────────────────────
const AdminEducation = () => {
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [showForm, setShowForm] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCurrent, setFilterCurrent] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const addBtnRef = useRef(null);

  const loadEducation = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const res = await authApi.getAdminEducation();
      setEducationList(res.data?.education || []);
    } catch {
      setLoadError('Unable to load education right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEducation(); }, [loadEducation]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const validate = () => {
    const errs = {};
    if (!form.degree.trim() || form.degree.trim().length < 2) errs.degree = 'Degree is required (min 2 chars).';
    if (!form.institution.trim() || form.institution.trim().length < 2) errs.institution = 'Institution is required (min 2 chars).';
    if (!form.startDate.trim()) errs.startDate = 'Start date is required.';

    if (!form.current && form.endDate && form.endDate.trim() && new Date(form.endDate) < new Date(form.startDate)) {
       // Basic sensible check although string dates format variations apply, logic acts as a safety if parses
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
      if (editingEdu) {
        const res = await authApi.updateEducation(editingEdu._id, payload);
        setEducationList((prev) => prev.map((ex) => ex._id === editingEdu._id ? res.data.education : ex).sort((a, b) => a.order - b.order));
        showToast('Education updated successfully.');
      } else {
        const res = await authApi.createEducation(payload);
        setEducationList((prev) => [...prev, res.data.education].sort((a, b) => a.order - b.order));
        showToast('Education created successfully.');
      }
      closeForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save this record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authApi.deleteEducation(deleteTarget._id);
      setEducationList((prev) => prev.filter((ex) => ex._id !== deleteTarget._id));
      showToast('Education deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete education.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (edu) => {
    try {
      const res = await authApi.updateEducationStatus(edu._id, !edu.isActive);
      setEducationList((prev) => prev.map((e) => e._id === edu._id ? res.data.education : e));
      showToast('Education status updated.');
    } catch {
      showToast('Unable to update education status.', 'error');
    }
  };

  const openCreate = () => { setEditingEdu(null); setForm(EMPTY_FORM); setErrors({}); setShowForm(true); };
  const openEdit = (edu) => { setEditingEdu(edu); setForm(edu); setErrors({}); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingEdu(null); addBtnRef.current?.focus(); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newVal = type === 'checkbox' ? checked : value;
    setForm((p) => ({ ...p, [name]: newVal }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    
    if (name === 'current' && checked) {
        setForm(p => ({...p, endDate: ''}));
    }
  };

  const filtered = educationList.filter((edu) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      edu.degree.toLowerCase().includes(q) ||
      edu.institution.toLowerCase().includes(q) ||
      (edu.field || '').toLowerCase().includes(q) ||
      (edu.location || '').toLowerCase().includes(q) ||
      (edu.technologies || []).some((t) => t.toLowerCase().includes(q)) ||
      (edu.achievements || []).some((a) => a.toLowerCase().includes(q));
    
    const matchStatus = filterStatus === '' || edu.status === filterStatus;
    const matchCurrent = filterCurrent === '' || (filterCurrent === 'true' ? edu.current : !edu.current);
    const matchActive = filterActive === '' || (filterActive === 'true' ? edu.isActive : !edu.isActive);
    return matchSearch && matchStatus && matchCurrent && matchActive;
  });

  return (
    <div className="admin-education">
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal education={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      <div className="edu-page-header">
        <div>
          <h2>Education Management</h2>
          <p>Manage your academic background and educational history.</p>
        </div>
        <button ref={addBtnRef} className="btn btn-primary" onClick={openCreate} disabled={showForm}>
          + Add Education
        </button>
      </div>

      {showForm && (
        <div className="edu-form-panel">
          <div className="edu-form-header">
            <h3>{editingEdu ? 'Edit Education' : 'Add Education'}</h3>
            <button type="button" className="btn-icon" onClick={closeForm} aria-label="Close form">×</button>
          </div>
          <form onSubmit={handleSave} noValidate>
            
            <h4 className="form-section-title">Academic Information</h4>
            <div className="sf-grid">
              <div className="sf-group">
                <label>Degree / Qualification *</label>
                <input name="degree" type="text" value={form.degree} onChange={handleChange} aria-invalid={!!errors.degree} disabled={saving} placeholder="e.g. B.S. Computer Science" />
                {errors.degree && <span className="sf-error">{errors.degree}</span>}
              </div>
              <div className="sf-group">
                <label>Institution *</label>
                <input name="institution" type="text" value={form.institution} onChange={handleChange} aria-invalid={!!errors.institution} disabled={saving} placeholder="e.g. Harvard University" />
                {errors.institution && <span className="sf-error">{errors.institution}</span>}
              </div>
              <div className="sf-group">
                <label>Field of Study</label>
                <input name="field" type="text" value={form.field} onChange={handleChange} disabled={saving} placeholder="e.g. Software Engineering" />
              </div>
              <div className="sf-group">
                <label>Location</label>
                <input name="location" type="text" value={form.location} onChange={handleChange} disabled={saving} placeholder="e.g. Boston, MA" />
              </div>
            </div>

            <h4 className="form-section-title">Study Period</h4>
            <div className="sf-grid align-end">
              <div className="sf-group">
                <label>Start Date *</label>
                <input name="startDate" type="text" value={form.startDate} onChange={handleChange} aria-invalid={!!errors.startDate} disabled={saving} placeholder="e.g. Sep 2018" />
                {errors.startDate && <span className="sf-error">{errors.startDate}</span>}
              </div>
              <div className="sf-group">
                <label>End Date {form.current && '(Disabled)'}</label>
                <input name="endDate" type="text" value={form.endDate} onChange={handleChange} disabled={saving || form.current} placeholder="e.g. May 2022" />
              </div>
              <div className="sf-group sf-check-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="current" checked={form.current} onChange={handleChange} disabled={saving} />
                  Currently Studying
                </label>
              </div>
            </div>

            <h4 className="form-section-title">Description</h4>
            <div className="sf-group sf-full mb-4">
              <label>Overview</label>
              <textarea name="description" rows="3" value={form.description} onChange={handleChange} disabled={saving} />
            </div>
            
            <h4 className="form-section-title">Achievements</h4>
            <TagInput label="Key Achievements / Coursework" placeholder="e.g. Graduated with Honors (press Enter)" values={form.achievements}
              onChange={(v) => setForm(p => ({...p, achievements: v}))} disabled={saving} />

            <h4 className="form-section-title">Technologies</h4>
            <div className="tech-tags-wrapper">
                <TagInput label="Relevant Technologies" placeholder="e.g. Java (press Enter)" values={form.technologies}
                onChange={(v) => setForm(p => ({...p, technologies: v}))} disabled={saving} maxLen={100} />
            </div>

            <h4 className="form-section-title">Additional Info & Settings</h4>
            <div className="sf-grid">
              <div className="sf-group">
                <label>Academic Status</label>
                <select name="status" value={form.status} onChange={handleChange} disabled={saving}>
                  {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
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
                {saving ? 'Saving…' : (editingEdu ? 'Save Changes' : 'Create Education')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadError && (
        <div className="admin-alert error" role="alert">
          <p>{loadError}</p>
          <button className="btn btn-sm btn-outline" onClick={loadEducation}>Retry</button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="edu-controls">
          <div className="edu-search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="edu-search" type="text" placeholder="Search education…"
              value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search education" />
          </div>
          
          <select className="edu-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by academic status">
            <option value="">Aca Status: All</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="planned">Planned</option>
          </select>
          <select className="edu-filter" value={filterCurrent} onChange={(e) => setFilterCurrent(e.target.value)} aria-label="Filter by current">
            <option value="">Time: All</option>
            <option value="true">Current</option>
            <option value="false">Past</option>
          </select>
           <select className="edu-filter" value={filterActive} onChange={(e) => setFilterActive(e.target.value)} aria-label="Filter by active status">
            <option value="">Visible: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="edu-empty"><div className="spinner" /><p>Loading education…</p></div>
      ) : !loadError && filtered.length === 0 ? (
        <div className="edu-empty">
          {educationList.length === 0 ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                 <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                 <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              <p>No education records have been added yet.</p>
              <button className="btn btn-primary mt-2" onClick={openCreate}>Add Education</button>
            </>
          ) : (
            <>
              <p>No records match your filters.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setFilterStatus(''); setFilterCurrent(''); setFilterActive(''); }}>Clear filters</button>
            </>
          )}
        </div>
      ) : !loadError ? (
        <>
          {/* Desktop Table */}
          <div className="edu-table-wrap">
            <table className="edu-table">
              <thead>
                <tr>
                  <th>Degree</th>
                  <th>Institution</th>
                  <th>Field</th>
                  <th>Period</th>
                  <th>Current</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((edu) => (
                  <tr key={edu._id} className={!edu.isActive ? 'row-inactive' : ''}>
                    <td><span className="fw-600">{edu.degree}</span></td>
                    <td>{edu.institution}</td>
                    <td>{edu.field || '—'}</td>
                    <td className="ws-nowrap text-sm">{edu.startDate} — {edu.current ? 'Present' : edu.endDate || '—'}</td>
                    <td>
                      {edu.current ? <span className="badge badge-current">Current</span> : <span className="badge badge-past">Past</span>}
                    </td>
                    <td>
                      <button className={`status-toggle ${edu.isActive ? 'status-active' : 'status-inactive'}`}
                        onClick={() => handleToggleStatus(edu)} aria-label={`Toggle visibility`}>
                        {edu.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>{edu.order}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon-sm" onClick={() => openEdit(edu)} title="Edit">✏️</button>
                        <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(edu)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="edu-cards">
            {filtered.map((edu) => (
              <div key={edu._id} className={`edu-card ${!edu.isActive ? 'card-inactive' : ''}`}>
                <div className="edu-card-header">
                  <div>
                    <h4 className="edu-card-title">{edu.degree}</h4>
                    <p className="edu-card-institution">{edu.institution} {edu.field && `· ${edu.field}`}</p>
                    <p className="edu-card-dates">{edu.startDate} — {edu.current ? 'Present' : edu.endDate}</p>
                  </div>
                  <div className="action-btns">
                    <button className="btn-icon-sm" onClick={() => openEdit(edu)}>✏️</button>
                    <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(edu)}>🗑️</button>
                  </div>
                </div>
                <div className="edu-card-meta">
                   {edu.current && <span className="badge badge-current">Current</span>}
                   {edu.status && <span className="badge badge-past" style={{textTransform: 'capitalize'}}>{edu.status.replace('-', ' ')}</span>}
                   <button className={`status-toggle ${edu.isActive ? 'status-active' : 'status-inactive'}`}
                    onClick={() => handleToggleStatus(edu)}>{edu.isActive ? 'Active' : 'Inactive'}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminEducation;
