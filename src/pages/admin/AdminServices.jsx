import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../../services/authApi';
import './AdminServices.css';

const EMPTY_FORM = {
  title: '', shortDescription: '', description: '', technologies: [], features: [],
  icon: '', category: '', available: true, featured: false, order: 0, isActive: true
};

const CATEGORY_OPTIONS = [
  '', 'Web Development', 'Frontend', 'Backend', 'Database', 'Security', 'Systems', 'Other'
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
const DeleteModal = ({ service, onConfirm, onCancel, deleting }) => {
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
        <h3 id="del-title">Delete Service?</h3>
        <p>Are you sure you want to permanently delete <strong>{service.title}</strong>? This action cannot be undone.</p>
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

// ─── Main AdminServices ──────────────────────────────────────────────────────
const AdminServices = () => {
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [showForm, setShowForm] = useState(false);
  const [editingSvc, setEditingSvc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('');

  const addBtnRef = useRef(null);

  const loadServices = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const res = await authApi.getAdminServices();
      setServiceList(res.data?.services || []);
    } catch {
      setLoadError('Unable to load services right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.trim().length < 2) errs.title = 'Title is required (min 2 chars).';
    if (!form.shortDescription.trim() || form.shortDescription.trim().length < 2) errs.shortDescription = 'Short description is required (min 2 chars).';
    
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
      if (editingSvc) {
        const res = await authApi.updateService(editingSvc._id, payload);
        setServiceList((prev) => prev.map((ex) => ex._id === editingSvc._id ? res.data.service : ex).sort((a, b) => a.order - b.order));
        showToast('Service updated successfully.');
      } else {
        const res = await authApi.createService(payload);
        setServiceList((prev) => [...prev, res.data.service].sort((a, b) => a.order - b.order));
        showToast('Service created successfully.');
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
      await authApi.deleteService(deleteTarget._id);
      setServiceList((prev) => prev.filter((ex) => ex._id !== deleteTarget._id));
      showToast('Service deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete service.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleProp = async (svc, prop, endpointMethod) => {
    try {
      const res = await authApi[endpointMethod](svc._id, !svc[prop]);
      setServiceList((prev) => prev.map((e) => e._id === svc._id ? res.data.service : e));
      showToast(`Service ${prop} updated.`);
    } catch {
      showToast(`Unable to update ${prop}.`, 'error');
    }
  };

  const openCreate = () => { setEditingSvc(null); setForm(EMPTY_FORM); setErrors({}); setShowForm(true); };
  const openEdit = (svc) => { setEditingSvc(svc); setForm(svc); setErrors({}); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingSvc(null); addBtnRef.current?.focus(); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newVal = type === 'checkbox' ? checked : value;
    setForm((p) => ({ ...p, [name]: newVal }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const filtered = serviceList.filter((svc) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      svc.title.toLowerCase().includes(q) ||
      svc.shortDescription.toLowerCase().includes(q) ||
      (svc.category || '').toLowerCase().includes(q) ||
      (svc.technologies || []).some((t) => t.toLowerCase().includes(q));
    
    const matchCategory = filterCategory === '' || svc.category === filterCategory;
    const matchActive = filterActive === '' || (filterActive === 'true' ? svc.isActive : !svc.isActive);
    const matchFeatured = filterFeatured === '' || (filterFeatured === 'true' ? svc.featured : !svc.featured);
    const matchAvailable = filterAvailable === '' || (filterAvailable === 'true' ? svc.available : !svc.available);
    return matchSearch && matchCategory && matchActive && matchFeatured && matchAvailable;
  });

  return (
    <div className="admin-services">
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal service={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      <div className="svc-page-header">
        <div>
          <h2>Services Management</h2>
          <p>Manage the professional services and offerings shown on your portfolio.</p>
        </div>
        <button ref={addBtnRef} className="btn btn-primary" onClick={openCreate} disabled={showForm}>
          + Add Service
        </button>
      </div>

      {showForm && (
        <div className="svc-form-panel">
          <div className="svc-form-header">
            <h3>{editingSvc ? 'Edit Service' : 'Add Service'}</h3>
            <button type="button" className="btn-icon" onClick={closeForm} aria-label="Close form">×</button>
          </div>
          <form onSubmit={handleSave} noValidate>
            
            <h4 className="form-section-title">Basic Information</h4>
            <div className="sf-grid">
              <div className="sf-group">
                <label>Title / Name *</label>
                <input name="title" type="text" value={form.title} onChange={handleChange} aria-invalid={!!errors.title} disabled={saving} placeholder="e.g. Full-Stack Development" />
                {errors.title && <span className="sf-error">{errors.title}</span>}
              </div>
              <div className="sf-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange} disabled={saving}>
                  {CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt || '— None —'}</option>)}
                </select>
              </div>
              <div className="sf-group sf-full">
                <label>Short Description *</label>
                <input name="shortDescription" type="text" value={form.shortDescription} onChange={handleChange} aria-invalid={!!errors.shortDescription} disabled={saving} placeholder="Brief summary (1-2 sentences)" />
                {errors.shortDescription && <span className="sf-error">{errors.shortDescription}</span>}
              </div>
               <div className="sf-group sf-full mb-2">
                <label>Detailed Description</label>
                <textarea name="description" rows="4" value={form.description} onChange={handleChange} disabled={saving} placeholder="In-depth explanation of the service..." />
              </div>
            </div>

            <h4 className="form-section-title">Service Details</h4>
            <div className="sf-grid align-start">
               <div className="tech-tags-wrapper sf-full">
                    <TagInput label="Key Features / Offerings" placeholder="e.g. Responsive Design (press Enter)" values={form.features}
                    onChange={(v) => setForm(p => ({...p, features: v}))} disabled={saving} maxLen={200} />
                </div>
               <div className="tech-tags-wrapper sf-full">
                    <TagInput label="Technologies Used" placeholder="e.g. React.js (press Enter)" values={form.technologies}
                    onChange={(v) => setForm(p => ({...p, technologies: v}))} disabled={saving} maxLen={100} />
                </div>
            </div>

            <h4 className="form-section-title">Display Settings</h4>
            <div className="sf-grid">
              <div className="sf-group">
                <label>Display Order</label>
                <input name="order" type="number" min="0" value={form.order} onChange={handleChange} aria-invalid={!!errors.order} disabled={saving} />
                {errors.order && <span className="sf-error">{errors.order}</span>}
              </div>
              <div className="sf-group">
                <label>Icon Identifier</label>
                <input name="icon" type="text" value={form.icon} onChange={handleChange} disabled={saving} placeholder="e.g. FaCode" />
              </div>
            </div>

            <div className="sf-toggles mt-4">
               <label className="toggle-switch-label">
                <input type="checkbox" name="available" checked={form.available} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                Available — Service is currently offered to clients
              </label>
               <label className="toggle-switch-label">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                Featured — Highlight this service
              </label>
              <label className="toggle-switch-label">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                Active — Visible on the public portfolio
              </label>
            </div>

            <div className="sf-actions">
              <button type="button" className="btn btn-outline" onClick={closeForm} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : (editingSvc ? 'Update Service' : 'Create Service')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadError && (
        <div className="admin-alert error" role="alert">
          <p>{loadError}</p>
          <button className="btn btn-sm btn-outline" onClick={loadServices}>Retry</button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="svc-controls">
          <div className="svc-search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="svc-search" type="text" placeholder="Search services…"
              value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search services" />
          </div>
          
          <select className="svc-filter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category">
            <option value="">Category: All</option>
            {CATEGORY_OPTIONS.filter(Boolean).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select className="svc-filter" value={filterAvailable} onChange={(e) => setFilterAvailable(e.target.value)} aria-label="Filter by availability">
            <option value="">Availability: All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          <select className="svc-filter" value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)} aria-label="Filter by featured status">
            <option value="">Featured: All</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
           <select className="svc-filter" value={filterActive} onChange={(e) => setFilterActive(e.target.value)} aria-label="Filter by active status">
            <option value="">Visible: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="svc-empty"><div className="spinner" /><p>Loading services…</p></div>
      ) : !loadError && filtered.length === 0 ? (
        <div className="svc-empty">
          {serviceList.length === 0 ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                 <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                 <line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <p>No services have been added yet.</p>
              <button className="btn btn-primary mt-2" onClick={openCreate}>Add Service</button>
            </>
          ) : (
            <>
              <p>No records match your filters.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setFilterAvailable(''); setFilterFeatured(''); setFilterCategory(''); setFilterActive(''); }}>Clear filters</button>
            </>
          )}
        </div>
      ) : !loadError ? (
        <>
          {/* Desktop Table */}
          <div className="svc-table-wrap">
            <table className="svc-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Technologies</th>
                  <th>Available</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((svc) => (
                  <tr key={svc._id} className={!svc.isActive ? 'row-inactive' : ''}>
                    <td>
                        <span className="fw-600">{svc.title}</span>
                    </td>
                    <td>{svc.category || '—'}</td>
                    <td>
                      <div className="svc-tech-list">
                         {svc.technologies?.slice(0, 3).join(', ')}
                         {svc.technologies?.length > 3 && <span className="text-muted text-xs"> +{svc.technologies.length - 3}</span>}
                      </div>
                    </td>
                    <td>
                      <button className={`status-toggle ${svc.available ? 'status-active' : 'status-inactive'}`}
                        onClick={() => handleToggleProp(svc, 'available', 'updateServiceAvailability')} aria-label={`Toggle availability`}>
                        {svc.available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td>
                      <button className={`status-toggle ${svc.featured ? 'status-featured' : 'status-inactive'}`}
                        onClick={() => handleToggleProp(svc, 'featured', 'updateServiceFeatured')} aria-label={`Toggle featured`}>
                        {svc.featured ? 'Featured' : 'None'}
                      </button>
                    </td>
                    <td>
                      <button className={`status-toggle ${svc.isActive ? 'status-active' : 'status-inactive'}`}
                        onClick={() => handleToggleProp(svc, 'isActive', 'updateServiceStatus')} aria-label={`Toggle visibility`}>
                        {svc.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>{svc.order}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon-sm" onClick={() => openEdit(svc)} title="Edit">✏️</button>
                        <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(svc)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="svc-cards">
            {filtered.map((svc) => (
              <div key={svc._id} className={`svc-card ${!svc.isActive ? 'card-inactive' : ''}`}>
                <div className="svc-card-header">
                  <div>
                    <h4 className="svc-card-title">{svc.title}</h4>
                    <p className="svc-card-desc">{svc.shortDescription}</p>
                  </div>
                  <div className="action-btns">
                    <button className="btn-icon-sm" onClick={() => openEdit(svc)}>✏️</button>
                    <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(svc)}>🗑️</button>
                  </div>
                </div>
                <div className="svc-card-meta">
                   {svc.category && <span className="badge badge-past">{svc.category}</span>}
                   <button className={`status-toggle ${svc.available ? 'status-active' : 'status-inactive'}`}
                    onClick={() => handleToggleProp(svc, 'available', 'updateServiceAvailability')}>{svc.available ? 'Available' : 'Unavailable'}</button>
                   <button className={`status-toggle ${svc.featured ? 'status-featured' : 'status-inactive'}`}
                    onClick={() => handleToggleProp(svc, 'featured', 'updateServiceFeatured')}>{svc.featured ? 'Featured' : 'None'}</button>
                   <button className={`status-toggle ${svc.isActive ? 'status-active' : 'status-inactive'}`}
                    onClick={() => handleToggleProp(svc, 'isActive', 'updateServiceStatus')}>{svc.isActive ? 'Active' : 'Inactive'}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminServices;
