import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../../services/authApi';
import './AdminCertifications.css';

const EMPTY_FORM = {
  title: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '',
  description: '', skills: [], category: '', status: '', image: '',
  order: 0, isActive: true
};

const STATUS_OPTIONS = [
  { label: '— Select Status —', value: '' },
  { label: 'Verified', value: 'verified' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Expired', value: 'expired' }
];

const CATEGORY_OPTIONS = [
  '', 'Development', 'Frontend', 'Backend', 'Database', 'Cloud', 'Security', 'Programming', 'Design', 'Other'
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
const DeleteModal = ({ certification, onConfirm, onCancel, deleting }) => {
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
        <h3 id="del-title">Delete Certification?</h3>
        <p>Are you sure you want to permanently delete <strong>{certification.title}</strong> by <strong>{certification.issuer}</strong>? This action cannot be undone.</p>
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

// ─── Main AdminCertifications ────────────────────────────────────────────────
const AdminCertifications = () => {
  const [certList, setCertList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const addBtnRef = useRef(null);

  const loadCertifications = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const res = await authApi.getAdminCertifications();
      setCertList(res.data?.certifications || []);
    } catch {
      setLoadError('Unable to load certifications right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCertifications(); }, [loadCertifications]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.trim().length < 2) errs.title = 'Title is required (min 2 chars).';
    if (!form.issuer.trim() || form.issuer.trim().length < 2) errs.issuer = 'Issuer is required (min 2 chars).';
    if (!form.issueDate.trim()) errs.issueDate = 'Issue date is required.';

    if (form.issueDate && form.expiryDate) {
      if (new Date(form.expiryDate) < new Date(form.issueDate)) {
        errs.expiryDate = 'Expiry date cannot be earlier than issue date.';
      }
    }

    if (form.credentialUrl) {
      try { new URL(form.credentialUrl); } catch { errs.credentialUrl = 'Must be a valid URL.'; }
    }
    
    if (form.image) {
      try { new URL(form.image); } catch { errs.image = 'Must be a valid URL.'; }
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

    try {
      if (editingCert) {
        const res = await authApi.updateCertification(editingCert._id, payload);
        setCertList((prev) => prev.map((ex) => ex._id === editingCert._id ? res.data.certification : ex).sort((a, b) => a.order - b.order));
        showToast('Certification updated successfully.');
      } else {
        const res = await authApi.createCertification(payload);
        setCertList((prev) => [...prev, res.data.certification].sort((a, b) => a.order - b.order));
        showToast('Certification created successfully.');
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
      await authApi.deleteCertification(deleteTarget._id);
      setCertList((prev) => prev.filter((ex) => ex._id !== deleteTarget._id));
      showToast('Certification deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete certification.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (cert) => {
    try {
      const res = await authApi.updateCertificationStatus(cert._id, !cert.isActive);
      setCertList((prev) => prev.map((e) => e._id === cert._id ? res.data.certification : e));
      showToast('Certification visibility updated.');
    } catch {
      showToast('Unable to update visibility.', 'error');
    }
  };

  const openCreate = () => { setEditingCert(null); setForm(EMPTY_FORM); setErrors({}); setShowForm(true); };
  const openEdit = (cert) => { setEditingCert(cert); setForm(cert); setErrors({}); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingCert(null); addBtnRef.current?.focus(); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newVal = type === 'checkbox' ? checked : value;
    setForm((p) => ({ ...p, [name]: newVal }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const filtered = certList.filter((cert) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      cert.title.toLowerCase().includes(q) ||
      cert.issuer.toLowerCase().includes(q) ||
      (cert.credentialId || '').toLowerCase().includes(q) ||
      (cert.category || '').toLowerCase().includes(q) ||
      (cert.skills || []).some((s) => s.toLowerCase().includes(q));
    
    const matchStatus = filterStatus === '' || cert.status === filterStatus;
    const matchCategory = filterCategory === '' || cert.category === filterCategory;
    const matchActive = filterActive === '' || (filterActive === 'true' ? cert.isActive : !cert.isActive);
    return matchSearch && matchStatus && matchCategory && matchActive;
  });

  return (
    <div className="admin-certifications">
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal certification={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      <div className="cert-page-header">
        <div>
          <h2>Certifications & Learning</h2>
          <p>Manage professional certifications, credentials, and learning records.</p>
        </div>
        <button ref={addBtnRef} className="btn btn-primary" onClick={openCreate} disabled={showForm}>
          + Add Certification
        </button>
      </div>

      {showForm && (
        <div className="cert-form-panel">
          <div className="cert-form-header">
            <h3>{editingCert ? 'Edit Certification' : 'Add Certification'}</h3>
            <button type="button" className="btn-icon" onClick={closeForm} aria-label="Close form">×</button>
          </div>
          <form onSubmit={handleSave} noValidate>
            
            <h4 className="form-section-title">Certification Information</h4>
            <div className="sf-grid">
              <div className="sf-group">
                <label>Title / Name *</label>
                <input name="title" type="text" value={form.title} onChange={handleChange} aria-invalid={!!errors.title} disabled={saving} placeholder="e.g. AWS Certified Solutions Architect" />
                {errors.title && <span className="sf-error">{errors.title}</span>}
              </div>
              <div className="sf-group">
                <label>Issuer *</label>
                <input name="issuer" type="text" value={form.issuer} onChange={handleChange} aria-invalid={!!errors.issuer} disabled={saving} placeholder="e.g. Amazon Web Services" />
                {errors.issuer && <span className="sf-error">{errors.issuer}</span>}
              </div>
            </div>

            <h4 className="form-section-title">Dates</h4>
            <div className="sf-grid align-end">
              <div className="sf-group">
                <label>Issue Date *</label>
                <input name="issueDate" type="text" value={form.issueDate} onChange={handleChange} aria-invalid={!!errors.issueDate} disabled={saving} placeholder="e.g. Jan 2023" />
                {errors.issueDate && <span className="sf-error">{errors.issueDate}</span>}
              </div>
              <div className="sf-group">
                <label>Expiry Date</label>
                <input name="expiryDate" type="text" value={form.expiryDate} onChange={handleChange} aria-invalid={!!errors.expiryDate} disabled={saving} placeholder="e.g. Jan 2026 (Optional)" />
                {errors.expiryDate && <span className="sf-error">{errors.expiryDate}</span>}
              </div>
            </div>

            <h4 className="form-section-title">Credential Verification</h4>
            <div className="sf-grid">
              <div className="sf-group">
                <label>Credential ID</label>
                <input name="credentialId" type="text" value={form.credentialId} onChange={handleChange} disabled={saving} placeholder="e.g. CRED-12345" />
              </div>
              <div className="sf-group">
                <label>Credential URL</label>
                <input name="credentialUrl" type="url" value={form.credentialUrl} onChange={handleChange} aria-invalid={!!errors.credentialUrl} disabled={saving} placeholder="https://..." />
                {errors.credentialUrl && <span className="sf-error">{errors.credentialUrl}</span>}
              </div>
            </div>

            <h4 className="form-section-title">Description & Skills</h4>
            <div className="sf-group sf-full mb-4">
              <label>Overview</label>
              <textarea name="description" rows="3" value={form.description} onChange={handleChange} disabled={saving} />
            </div>
            <div className="tech-tags-wrapper">
                <TagInput label="Skills Learned" placeholder="e.g. System Design (press Enter)" values={form.skills}
                onChange={(v) => setForm(p => ({...p, skills: v}))} disabled={saving} maxLen={100} />
            </div>

            <h4 className="form-section-title">Category, Status & Image</h4>
            <div className="sf-grid">
              <div className="sf-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange} disabled={saving}>
                  {CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt || '— None —'}</option>)}
                </select>
              </div>
              <div className="sf-group">
                <label>Completion Status</label>
                <select name="status" value={form.status} onChange={handleChange} disabled={saving}>
                  {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
               <div className="sf-group sf-full mt-2">
                <label>Certificate Image URL</label>
                <input name="image" type="url" value={form.image} onChange={handleChange} aria-invalid={!!errors.image} disabled={saving} placeholder="https://..." />
                {errors.image && <span className="sf-error">{errors.image}</span>}
                {form.image && !errors.image && (
                  <div className="cert-img-preview mt-2">
                    <img src={form.image} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>

            <h4 className="form-section-title">Display Settings</h4>
            <div className="sf-grid">
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
                {saving ? 'Saving…' : (editingCert ? 'Save Changes' : 'Create Certification')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadError && (
        <div className="admin-alert error" role="alert">
          <p>{loadError}</p>
          <button className="btn btn-sm btn-outline" onClick={loadCertifications}>Retry</button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="cert-controls">
          <div className="cert-search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="cert-search" type="text" placeholder="Search certifications…"
              value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search certifications" />
          </div>
          
          <select className="cert-filter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category">
            <option value="">Category: All</option>
            {CATEGORY_OPTIONS.filter(Boolean).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select className="cert-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by completion status">
            <option value="">Status: All</option>
            {STATUS_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
           <select className="cert-filter" value={filterActive} onChange={(e) => setFilterActive(e.target.value)} aria-label="Filter by active status">
            <option value="">Visible: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="cert-empty"><div className="spinner" /><p>Loading certifications…</p></div>
      ) : !loadError && filtered.length === 0 ? (
        <div className="cert-empty">
          {certList.length === 0 ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                 <circle cx="12" cy="8" r="6"></circle>
                 <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
              <p>No certifications have been added yet.</p>
              <button className="btn btn-primary mt-2" onClick={openCreate}>Add Certification</button>
            </>
          ) : (
            <>
              <p>No records match your filters.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setFilterStatus(''); setFilterCategory(''); setFilterActive(''); }}>Clear filters</button>
            </>
          )}
        </div>
      ) : !loadError ? (
        <>
          {/* Desktop Table */}
          <div className="cert-table-wrap">
            <table className="cert-table">
              <thead>
                <tr>
                  <th>Certification</th>
                  <th>Issuer</th>
                  <th>Issue Date</th>
                  <th>Expiry</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cert) => (
                  <tr key={cert._id} className={!cert.isActive ? 'row-inactive' : ''}>
                    <td>
                        <div className="cert-cell-title">
                            {cert.image && <img src={cert.image} alt="cert icon" className="cert-tiny-icon" onError={e => e.target.style.display='none'}/>}
                            <span className="fw-600">{cert.title}</span>
                        </div>
                    </td>
                    <td>{cert.issuer}</td>
                    <td className="ws-nowrap text-sm">{cert.issueDate}</td>
                    <td className="ws-nowrap text-sm">{cert.expiryDate || '—'}</td>
                    <td>{cert.category || '—'}</td>
                    <td>
                        {cert.status ? (
                            <span className={`badge badge-status badge-${cert.status}`}>{cert.status.replace('-', ' ')}</span>
                        ) : '—'}
                    </td>
                    <td>
                      <button className={`status-toggle ${cert.isActive ? 'status-active' : 'status-inactive'}`}
                        onClick={() => handleToggleStatus(cert)} aria-label={`Toggle visibility`}>
                        {cert.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>{cert.order}</td>
                    <td>
                      <div className="action-btns">
                        {cert.credentialUrl && (
                             <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="btn-icon-sm" title="Verify Link">🔗</a>
                        )}
                        <button className="btn-icon-sm" onClick={() => openEdit(cert)} title="Edit">✏️</button>
                        <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(cert)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="cert-cards">
            {filtered.map((cert) => (
              <div key={cert._id} className={`cert-card ${!cert.isActive ? 'card-inactive' : ''}`}>
                <div className="cert-card-header">
                  <div className="cert-card-header-inner">
                     {cert.image && <img src={cert.image} alt="cert icon" className="cert-tiny-icon" onError={e => e.target.style.display='none'}/>}
                     <div>
                        <h4 className="cert-card-title">{cert.title}</h4>
                        <p className="cert-card-issuer">{cert.issuer}</p>
                     </div>
                  </div>
                  <div className="action-btns">
                    <button className="btn-icon-sm" onClick={() => openEdit(cert)}>✏️</button>
                    <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(cert)}>🗑️</button>
                  </div>
                </div>
                <div className="cert-card-details">
                    <p className="cert-card-dates">Issued: {cert.issueDate} {cert.expiryDate && `| Expires: ${cert.expiryDate}`}</p>
                    {cert.credentialId && <p className="cert-card-cred">ID: {cert.credentialId}</p>}
                </div>
                <div className="cert-card-meta">
                   {cert.status && <span className={`badge badge-status badge-${cert.status}`} style={{textTransform: 'capitalize'}}>{cert.status.replace('-', ' ')}</span>}
                   {cert.category && <span className="badge badge-past">{cert.category}</span>}
                   <button className={`status-toggle ${cert.isActive ? 'status-active' : 'status-inactive'}`}
                    onClick={() => handleToggleStatus(cert)}>{cert.isActive ? 'Active' : 'Inactive'}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminCertifications;
