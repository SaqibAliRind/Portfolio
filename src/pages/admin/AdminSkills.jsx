import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../../services/authApi';
import './AdminSkills.css';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Programming', 'Tools', 'Deployment', 'Other'];
const LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const EMPTY_FORM = {
  name: '',
  category: '',
  subCategory: '',
  description: '',
  icon: '',
  level: '',
  order: 0,
  featured: false,
  isActive: true,
};

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
const DeleteModal = ({ skill, onConfirm, onCancel, deleting }) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="del-title">
      <div className="modal-box">
        <h3 id="del-title" className="modal-title">Delete Skill?</h3>
        <p className="modal-body">
          Are you sure you want to permanently delete{' '}
          <strong>{skill.name}</strong>? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button
            ref={cancelRef}
            className="btn btn-outline"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skill Form (create / edit) ───────────────────────────────────────────────
const SkillForm = ({ editing, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState(editing || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(editing || EMPTY_FORM);
    setErrors({});
  }, [editing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    else if (formData.name.trim().length > 100) errs.name = 'Name cannot exceed 100 characters.';

    if (!formData.category) errs.category = 'Category is required.';

    if (formData.subCategory && formData.subCategory.length > 100)
      errs.subCategory = 'Subcategory cannot exceed 100 characters.';
    if (formData.description && formData.description.length > 1000)
      errs.description = 'Description cannot exceed 1000 characters.';
    if (formData.icon && formData.icon.length > 200)
      errs.icon = 'Icon identifier cannot exceed 200 characters.';

    const orderNum = Number(formData.order);
    if (formData.order !== '' && (isNaN(orderNum) || orderNum < 0))
      errs.order = 'Order must be a non-negative number.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      subCategory: formData.subCategory?.trim() || '',
      description: formData.description?.trim() || '',
      icon: formData.icon?.trim() || '',
      level: formData.level || '',
      order: Number(formData.order) || 0,
      featured: Boolean(formData.featured),
      isActive: Boolean(formData.isActive),
    };

    onSave(payload);
  };

  return (
    <div className="skill-form-panel">
      <div className="skill-form-header">
        <h3>{editing ? 'Edit Skill' : 'Add Skill'}</h3>
        <button
          className="btn-icon"
          onClick={onCancel}
          aria-label="Close form"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-section-label">Basic Information</div>
        <div className="sf-grid">
          <div className="sf-group">
            <label htmlFor="sf-name">Skill Name *</label>
            <input
              id="sf-name" name="name" type="text"
              value={formData.name} onChange={handleChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'sf-name-err' : undefined}
              disabled={saving}
            />
            {errors.name && <span id="sf-name-err" className="sf-error">{errors.name}</span>}
          </div>

          <div className="sf-group">
            <label htmlFor="sf-category">Category *</label>
            <select
              id="sf-category" name="category"
              value={formData.category} onChange={handleChange}
              aria-invalid={!!errors.category}
              disabled={saving}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="sf-error">{errors.category}</span>}
          </div>

          <div className="sf-group">
            <label htmlFor="sf-sub">Subcategory</label>
            <input
              id="sf-sub" name="subCategory" type="text"
              value={formData.subCategory} onChange={handleChange}
              placeholder="e.g. Framework, Library"
              disabled={saving}
            />
            {errors.subCategory && <span className="sf-error">{errors.subCategory}</span>}
          </div>

          <div className="sf-group">
            <label htmlFor="sf-icon">Icon Identifier</label>
            <input
              id="sf-icon" name="icon" type="text"
              value={formData.icon} onChange={handleChange}
              placeholder="e.g. react, nodejs"
              disabled={saving}
            />
            {errors.icon && <span className="sf-error">{errors.icon}</span>}
          </div>

          <div className="sf-group sf-full">
            <label htmlFor="sf-desc">
              Description{' '}
              <span className="char-count">{(formData.description || '').length} / 1000</span>
            </label>
            <textarea
              id="sf-desc" name="description" rows="3"
              value={formData.description} onChange={handleChange}
              maxLength={1000} disabled={saving}
            />
            {errors.description && <span className="sf-error">{errors.description}</span>}
          </div>
        </div>

        <div className="form-section-label" style={{ marginTop: 'var(--space-5)' }}>Display Settings</div>
        <div className="sf-grid">
          <div className="sf-group">
            <label htmlFor="sf-level">Level</label>
            <select
              id="sf-level" name="level"
              value={formData.level} onChange={handleChange}
              disabled={saving}
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l || '— Not specified —'}</option>)}
            </select>
          </div>

          <div className="sf-group">
            <label htmlFor="sf-order">Display Order</label>
            <input
              id="sf-order" name="order" type="number"
              min="0" value={formData.order}
              onChange={handleChange}
              aria-invalid={!!errors.order}
              disabled={saving}
            />
            {errors.order && <span className="sf-error">{errors.order}</span>}
          </div>

          <div className="sf-group sf-toggle-row">
            <label className="toggle-switch-label" htmlFor="sf-featured">
              <input
                id="sf-featured" name="featured" type="checkbox"
                checked={formData.featured} onChange={handleChange}
                disabled={saving}
              />
              <span className="toggle-switch-track"></span>
              Featured
            </label>
            <span className="sf-toggle-desc">Highlight on the public portfolio</span>
          </div>

          <div className="sf-group sf-toggle-row">
            <label className="toggle-switch-label" htmlFor="sf-active">
              <input
                id="sf-active" name="isActive" type="checkbox"
                checked={formData.isActive} onChange={handleChange}
                disabled={saving}
              />
              <span className="toggle-switch-track"></span>
              Active
            </label>
            <span className="sf-toggle-desc">Visible on the public portfolio</span>
          </div>
        </div>

        <div className="sf-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Skill')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Main AdminSkills Page ────────────────────────────────────────────────────
const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const addBtnRef = useRef(null);

  // ── Data loading ──────────────────────────────────────────────
  const loadSkills = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await authApi.getAdminSkills();
      setSkills(res.data?.skills || []);
    } catch {
      setLoadError('Unable to load skills right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  // ── Toast helper ──────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  // ── Create / Update ───────────────────────────────────────────
  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editingSkill) {
        const res = await authApi.updateSkill(editingSkill._id, payload);
        setSkills((prev) =>
          prev.map((s) => (s._id === editingSkill._id ? res.data.skill : s))
        );
        showToast('Skill updated successfully.');
      } else {
        const res = await authApi.createSkill(payload);
        setSkills((prev) => [...prev, res.data.skill].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)));
        showToast('Skill created successfully.');
      }
      closeForm();
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to save this skill.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authApi.deleteSkill(deleteTarget._id);
      setSkills((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      showToast('Skill deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to delete this skill.';
      showToast(msg, 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle Status ─────────────────────────────────────────────
  const handleToggleStatus = async (skill) => {
    try {
      const res = await authApi.updateSkillStatus(skill._id, !skill.isActive);
      setSkills((prev) =>
        prev.map((s) => (s._id === skill._id ? res.data.skill : s))
      );
      showToast('Skill status updated.');
    } catch {
      showToast('Unable to update skill status.', 'error');
    }
  };

  // ── Toggle Featured ───────────────────────────────────────────
  const handleToggleFeatured = async (skill) => {
    try {
      const res = await authApi.updateSkillFeatured(skill._id, !skill.featured);
      setSkills((prev) =>
        prev.map((s) => (s._id === skill._id ? res.data.skill : s))
      );
      showToast('Skill featured status updated.');
    } catch {
      showToast('Unable to update featured status.', 'error');
    }
  };

  // ── Form helpers ──────────────────────────────────────────────
  const openCreate = () => { setEditingSkill(null); setShowForm(true); };
  const openEdit = (skill) => { setEditingSkill(skill); setShowForm(true); };
  const closeForm = () => {
    setShowForm(false);
    setEditingSkill(null);
    addBtnRef.current?.focus();
  };

  // ── Filtered skills ───────────────────────────────────────────
  const filtered = skills.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.subCategory || '').toLowerCase().includes(q);
    const matchCat = !filterCategory || s.category === filterCategory;
    return matchSearch && matchCat;
  });

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="admin-skills">
      {/* Toast */}
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          skill={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Page Header */}
      <div className="skills-page-header">
        <div>
          <h2>Skills Management</h2>
          <p>Manage the technical skills displayed on your public portfolio.</p>
        </div>
        <button
          ref={addBtnRef}
          className="btn btn-primary"
          onClick={openCreate}
          disabled={showForm}
        >
          + Add Skill
        </button>
      </div>

      {/* Form Panel */}
      {showForm && (
        <SkillForm
          editing={editingSkill}
          onSave={handleSave}
          onCancel={closeForm}
          saving={saving}
        />
      )}

      {/* Load Error */}
      {loadError && (
        <div className="admin-alert error" role="alert">
          <p>{loadError}</p>
          <button className="btn btn-sm btn-outline" onClick={loadSkills}>Retry</button>
        </div>
      )}

      {/* Search & Filter */}
      {!loading && !loadError && (
        <div className="skills-controls">
          <div className="skills-search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="skills-search"
              placeholder="Search skills…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search skills"
            />
          </div>
          <select
            className="skills-cat-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="skills-loading">
          <div className="spinner" />
          <p>Loading skills…</p>
        </div>
      ) : !loadError && filtered.length === 0 ? (
        <div className="skills-empty">
          {skills.length === 0 ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
              <p>No skills have been added yet.</p>
              <span>Add your first skill to begin building your portfolio.</span>
              <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 'var(--space-4)' }}>
                Add Skill
              </button>
            </>
          ) : (
            <>
              <p>No skills match your search.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setFilterCategory(''); }}>
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : !loadError ? (
        <>
          {/* Desktop Table */}
          <div className="skills-table-wrap">
            <table className="skills-table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Order</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((skill) => (
                  <tr key={skill._id} className={!skill.isActive ? 'row-inactive' : ''}>
                    <td>
                      <div className="skill-name-cell">
                        {skill.icon && <span className="skill-icon-badge">{skill.icon}</span>}
                        <span className="skill-name">{skill.name}</span>
                        {skill.subCategory && <span className="skill-sub">{skill.subCategory}</span>}
                      </div>
                    </td>
                    <td><span className="cat-badge">{skill.category}</span></td>
                    <td>{skill.level || <span className="muted">—</span>}</td>
                    <td className="order-cell">{skill.order}</td>
                    <td>
                      <button
                        className={`featured-toggle ${skill.featured ? 'featured-on' : 'featured-off'}`}
                        onClick={() => handleToggleFeatured(skill)}
                        aria-label={`Toggle featured: ${skill.name}`}
                        title={skill.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        {skill.featured ? '★ Yes' : '☆ No'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`status-toggle ${skill.isActive ? 'status-active' : 'status-inactive'}`}
                        onClick={() => handleToggleStatus(skill)}
                        aria-label={`Toggle status: ${skill.name}`}
                      >
                        {skill.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-icon-sm"
                          onClick={() => openEdit(skill)}
                          aria-label={`Edit ${skill.name}`}
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          className="btn-icon-sm btn-icon-danger"
                          onClick={() => setDeleteTarget(skill)}
                          aria-label={`Delete ${skill.name}`}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="skills-cards">
            {filtered.map((skill) => (
              <div key={skill._id} className={`skill-card ${!skill.isActive ? 'card-inactive' : ''}`}>
                <div className="skill-card-header">
                  <div>
                    <p className="skill-card-name">
                      {skill.icon && <span className="skill-icon-badge">{skill.icon}</span>}
                      {skill.name}
                    </p>
                    {skill.subCategory && <p className="skill-card-sub">{skill.subCategory}</p>}
                  </div>
                  <div className="action-btns">
                    <button className="btn-icon-sm" onClick={() => openEdit(skill)} aria-label={`Edit ${skill.name}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(skill)} aria-label={`Delete ${skill.name}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                    </button>
                  </div>
                </div>
                <div className="skill-card-meta">
                  <span className="cat-badge">{skill.category}</span>
                  {skill.level && <span className="level-badge">{skill.level}</span>}
                  <button
                    className={`featured-toggle ${skill.featured ? 'featured-on' : 'featured-off'}`}
                    onClick={() => handleToggleFeatured(skill)}
                    aria-label={`Toggle featured: ${skill.name}`}
                  >
                    {skill.featured ? '★ Featured' : '☆ Not Featured'}
                  </button>
                  <button
                    className={`status-toggle ${skill.isActive ? 'status-active' : 'status-inactive'}`}
                    onClick={() => handleToggleStatus(skill)}
                    aria-label={`Toggle status: ${skill.name}`}
                  >
                    {skill.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminSkills;
