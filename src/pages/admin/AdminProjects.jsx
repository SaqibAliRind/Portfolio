import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../../services/authApi';
import './AdminProjects.css';

const STATUS_OPTIONS = ['', 'completed', 'in-progress', 'planned', 'archived'];
const STATUS_LABELS = {
  '': '—',
  completed: 'Completed',
  'in-progress': 'In Progress',
  planned: 'Planned',
  archived: 'Archived',
};

const EMPTY_FORM = {
  title: '', slug: '', shortDescription: '', fullDescription: '',
  category: '', image: '', screenshots: [], technologies: [], features: [],
  role: '', duration: '', status: '', liveDemo: '', github: '',
  problem: '', solution: '', targetUsers: [], architecture: '',
  databaseDesign: '', apiDetails: [], challenges: [], solutions: [],
  futureImprovements: [], featured: false, order: 0, isActive: true,
};

// ─── Utility: generate slug from title ────────────────────────────────────────
const toSlug = (title) =>
  title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// ─── Array Tag Input ──────────────────────────────────────────────────────────
const TagInput = ({ label, placeholder, values, onChange, disabled, maxLen = 100 }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v || v.length > maxLen) return;
    if (!values.includes(v)) onChange([...values, v]);
    setInput('');
  };

  const remove = (idx) => onChange(values.filter((_, i) => i !== idx));

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  };

  return (
    <div className="tag-input-group">
      <label>{label}</label>
      <div className="tag-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button type="button" className="btn btn-sm btn-outline" onClick={add} disabled={disabled || !input.trim()}>
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="tags-wrap">
          {values.map((v, i) => (
            <span key={i} className="tag">
              {v}
              <button type="button" className="tag-remove" onClick={() => remove(i)} disabled={disabled} aria-label={`Remove ${v}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Screenshot URL list ──────────────────────────────────────────────────────
const ScreenshotInput = ({ values, onChange, disabled }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v) return;
    onChange([...values, v]);
    setInput('');
  };

  const remove = (idx) => onChange(values.filter((_, i) => i !== idx));

  const handleKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };

  return (
    <div className="tag-input-group">
      <label>Screenshot URLs</label>
      <div className="tag-input-row">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="https://example.com/screenshot.png"
          disabled={disabled}
        />
        <button type="button" className="btn btn-sm btn-outline" onClick={add} disabled={disabled || !input.trim()}>
          Add
        </button>
      </div>
      {values.map((url, i) => (
        <div key={i} className="screenshot-entry">
          <span className="screenshot-url">{url}</span>
          <button type="button" className="tag-remove" onClick={() => remove(i)} disabled={disabled} aria-label={`Remove screenshot ${i + 1}`}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({ project, onConfirm, onCancel, deleting }) => {
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
        <h3 id="del-title">Delete Project?</h3>
        <p>Are you sure you want to permanently delete <strong>&ldquo;{project.title}&rdquo;</strong>? This action cannot be undone.</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="btn btn-outline" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Project Form (create / edit) ─────────────────────────────────────────────
const ProjectForm = ({ editing, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(editing || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(!!editing);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    setForm(editing ? { ...EMPTY_FORM, ...editing } : EMPTY_FORM);
    setErrors({});
    setSlugTouched(!!editing);
    setActiveTab('basic');
  }, [editing]);

  const set = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'title' && !slugTouched) {
      set('slug', toSlug(value));
    }
    if (name === 'slug') setSlugTouched(true);
    set(name, type === 'checkbox' ? checked : value);
  };

  const generateSlug = () => {
    set('slug', toSlug(form.title));
    setSlugTouched(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.trim().length < 2) errs.title = 'Title is required (min 2 chars).';
    if (form.title.trim().length > 150) errs.title = 'Title cannot exceed 150 characters.';

    const slugVal = form.slug.trim().toLowerCase();
    if (!slugVal || slugVal.length < 3) errs.slug = 'Slug is required (min 3 chars).';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugVal)) errs.slug = 'Slug: lowercase letters, numbers, hyphens only.';

    if (!form.shortDescription.trim() || form.shortDescription.trim().length < 10)
      errs.shortDescription = 'Short description is required (min 10 chars).';
    if (form.shortDescription.trim().length > 500) errs.shortDescription = 'Max 500 characters.';
    if (form.fullDescription && form.fullDescription.length > 10000) errs.fullDescription = 'Max 10000 characters.';

    const urlFields = ['image', 'liveDemo', 'github'];
    urlFields.forEach((f) => {
      if (form[f]) {
        try { new URL(form[f]); } catch { errs[f] = 'Must be a valid URL.'; }
      }
    });
    form.screenshots.forEach((s, i) => {
      if (s) { try { new URL(s); } catch { errs[`screenshot_${i}`] = `Invalid URL at position ${i + 1}`; } }
    });

    const orderNum = Number(form.order);
    if (isNaN(orderNum) || orderNum < 0) errs.order = 'Order must be a non-negative number.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      // Switch to tab with errors
      if (errors.title || errors.slug || errors.shortDescription || errors.fullDescription) setActiveTab('basic');
      return;
    }
    const payload = {
      ...form,
      slug: form.slug.trim().toLowerCase(),
      order: Number(form.order) || 0,
    };
    onSave(payload);
  };

  const tabs = ['basic', 'details', 'media', 'casestudy', 'display'];
  const tabLabels = { basic: 'Basic Info', details: 'Details', media: 'Media & Links', casestudy: 'Case Study', display: 'Display' };

  return (
    <div className="project-form-panel">
      <div className="project-form-header">
        <h3>{editing ? 'Edit Project' : 'Add Project'}</h3>
        <button type="button" className="btn-icon" onClick={onCancel} aria-label="Close form">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="form-tabs">
        {tabs.map((t) => (
          <button
            key={t} type="button"
            className={`form-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Basic Info ── */}
        <div className={`form-tab-content ${activeTab === 'basic' ? 'visible' : ''}`}>
          <div className="sf-grid">
            <div className="sf-group">
              <label htmlFor="pf-title">Project Title *</label>
              <input id="pf-title" name="title" type="text" value={form.title} onChange={handleChange}
                aria-invalid={!!errors.title} disabled={saving} />
              {errors.title && <span className="sf-error">{errors.title}</span>}
            </div>

            <div className="sf-group">
              <label htmlFor="pf-slug">
                Slug *
                <button type="button" className="btn-link" onClick={generateSlug} disabled={saving}>Generate</button>
              </label>
              <input id="pf-slug" name="slug" type="text" value={form.slug} onChange={handleChange}
                aria-invalid={!!errors.slug} disabled={saving} />
              {errors.slug && <span className="sf-error">{errors.slug}</span>}
              <span className="field-hint">URL: /projects/{form.slug || '…'}</span>
            </div>

            <div className="sf-group">
              <label htmlFor="pf-category">Category</label>
              <input id="pf-category" name="category" type="text" value={form.category} onChange={handleChange}
                placeholder="e.g. Full-Stack, Frontend" disabled={saving} />
            </div>

            <div className="sf-group">
              <label htmlFor="pf-status">Status</label>
              <select id="pf-status" name="status" value={form.status} onChange={handleChange} disabled={saving}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>

            <div className="sf-group sf-full">
              <label htmlFor="pf-short">
                Short Description *{' '}
                <span className="char-count">{form.shortDescription.length} / 500</span>
              </label>
              <textarea id="pf-short" name="shortDescription" rows="3" maxLength={500}
                value={form.shortDescription} onChange={handleChange}
                aria-invalid={!!errors.shortDescription} disabled={saving} />
              {errors.shortDescription && <span className="sf-error">{errors.shortDescription}</span>}
            </div>

            <div className="sf-group sf-full">
              <label htmlFor="pf-full">
                Full Description{' '}
                <span className="char-count">{(form.fullDescription || '').length} / 10000</span>
              </label>
              <textarea id="pf-full" name="fullDescription" rows="8" maxLength={10000}
                value={form.fullDescription} onChange={handleChange}
                aria-invalid={!!errors.fullDescription} disabled={saving} />
              {errors.fullDescription && <span className="sf-error">{errors.fullDescription}</span>}
            </div>
          </div>
        </div>

        {/* ── Details ── */}
        <div className={`form-tab-content ${activeTab === 'details' ? 'visible' : ''}`}>
          <div className="sf-grid">
            <div className="sf-group">
              <label htmlFor="pf-role">Role / My Role</label>
              <input id="pf-role" name="role" type="text" value={form.role} onChange={handleChange}
                placeholder="e.g. Full-Stack Developer" disabled={saving} />
            </div>
            <div className="sf-group">
              <label htmlFor="pf-duration">Duration</label>
              <input id="pf-duration" name="duration" type="text" value={form.duration} onChange={handleChange}
                placeholder="e.g. 3 months" disabled={saving} />
            </div>
          </div>
          <TagInput label="Technologies" placeholder="e.g. React.js (press Enter)" values={form.technologies}
            onChange={(v) => set('technologies', v)} disabled={saving} />
          <TagInput label="Features" placeholder="e.g. Authentication (press Enter)" values={form.features}
            onChange={(v) => set('features', v)} disabled={saving} maxLen={300} />
        </div>

        {/* ── Media & Links ── */}
        <div className={`form-tab-content ${activeTab === 'media' ? 'visible' : ''}`}>
          <div className="sf-grid">
            <div className="sf-group">
              <label htmlFor="pf-image">Project Image URL</label>
              <input id="pf-image" name="image" type="url" value={form.image} onChange={handleChange}
                placeholder="https://…" aria-invalid={!!errors.image} disabled={saving} />
              {errors.image && <span className="sf-error">{errors.image}</span>}
              {form.image && !errors.image && (
                <img src={form.image} alt="Preview" className="img-preview"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
            <div className="sf-group">
              <label htmlFor="pf-live">Live Demo URL</label>
              <input id="pf-live" name="liveDemo" type="url" value={form.liveDemo} onChange={handleChange}
                placeholder="https://…" aria-invalid={!!errors.liveDemo} disabled={saving} />
              {errors.liveDemo && <span className="sf-error">{errors.liveDemo}</span>}
            </div>
            <div className="sf-group">
              <label htmlFor="pf-github">GitHub URL</label>
              <input id="pf-github" name="github" type="url" value={form.github} onChange={handleChange}
                placeholder="https://github.com/…" aria-invalid={!!errors.github} disabled={saving} />
              {errors.github && <span className="sf-error">{errors.github}</span>}
            </div>
          </div>
          <ScreenshotInput values={form.screenshots} onChange={(v) => set('screenshots', v)} disabled={saving} />
        </div>

        {/* ── Case Study ── */}
        <div className={`form-tab-content ${activeTab === 'casestudy' ? 'visible' : ''}`}>
          <div className="sf-group sf-full" style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="pf-problem">Problem Statement</label>
            <textarea id="pf-problem" name="problem" rows="4" value={form.problem} onChange={handleChange} disabled={saving} />
          </div>
          <div className="sf-group sf-full" style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="pf-solution">Solution</label>
            <textarea id="pf-solution" name="solution" rows="4" value={form.solution} onChange={handleChange} disabled={saving} />
          </div>
          <div className="sf-group sf-full" style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="pf-arch">Architecture Overview</label>
            <textarea id="pf-arch" name="architecture" rows="4" value={form.architecture} onChange={handleChange} disabled={saving} />
          </div>
          <div className="sf-group sf-full" style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="pf-dbdesign">Database Design</label>
            <textarea id="pf-dbdesign" name="databaseDesign" rows="4" value={form.databaseDesign} onChange={handleChange} disabled={saving} />
          </div>
          <TagInput label="Target Users" placeholder="e.g. Students" values={form.targetUsers}
            onChange={(v) => set('targetUsers', v)} disabled={saving} maxLen={200} />
          <TagInput label="API Details" placeholder="e.g. REST /api/users" values={form.apiDetails}
            onChange={(v) => set('apiDetails', v)} disabled={saving} maxLen={300} />
          <TagInput label="Challenges" placeholder="e.g. Real-time updates" values={form.challenges}
            onChange={(v) => set('challenges', v)} disabled={saving} maxLen={500} />
          <TagInput label="Solutions to Challenges" placeholder="e.g. Used WebSockets" values={form.solutions}
            onChange={(v) => set('solutions', v)} disabled={saving} maxLen={500} />
          <TagInput label="Future Improvements" placeholder="e.g. Add mobile app" values={form.futureImprovements}
            onChange={(v) => set('futureImprovements', v)} disabled={saving} maxLen={300} />
        </div>

        {/* ── Display Settings ── */}
        <div className={`form-tab-content ${activeTab === 'display' ? 'visible' : ''}`}>
          <div className="sf-grid">
            <div className="sf-group">
              <label htmlFor="pf-order">Display Order</label>
              <input id="pf-order" name="order" type="number" min="0" value={form.order}
                onChange={handleChange} aria-invalid={!!errors.order} disabled={saving} />
              {errors.order && <span className="sf-error">{errors.order}</span>}
            </div>
          </div>
          <div className="sf-toggles">
            <label className="toggle-switch-label">
              <input type="checkbox" name="featured" checked={form.featured}
                onChange={handleChange} disabled={saving} />
              <span className="toggle-switch-track"></span>
              Featured — Highlighted on the public portfolio
            </label>
            <label className="toggle-switch-label">
              <input type="checkbox" name="isActive" checked={form.isActive}
                onChange={handleChange} disabled={saving} />
              <span className="toggle-switch-track"></span>
              Active — Visible on the public portfolio
            </label>
          </div>
        </div>

        <div className="sf-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Main AdminProjects ────────────────────────────────────────────────────────
const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const addBtnRef = useRef(null);

  const loadProjects = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const res = await authApi.getAdminProjects();
      setProjects(res.data?.projects || []);
    } catch {
      setLoadError('Unable to load projects right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editingProject) {
        const res = await authApi.updateProject(editingProject._id, payload);
        setProjects((prev) => prev.map((p) => p._id === editingProject._id ? res.data.project : p));
        showToast('Project updated successfully.');
      } else {
        const res = await authApi.createProject(payload);
        setProjects((prev) => [...prev, res.data.project].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)));
        showToast('Project created successfully.');
      }
      closeForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save this project.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authApi.deleteProject(deleteTarget._id);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      showToast('Project deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete this project.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (project) => {
    try {
      const res = await authApi.updateProjectStatus(project._id, !project.isActive);
      setProjects((prev) => prev.map((p) => p._id === project._id ? res.data.project : p));
      showToast('Project status updated.');
    } catch {
      showToast('Unable to update project status.', 'error');
    }
  };

  const handleToggleFeatured = async (project) => {
    try {
      const res = await authApi.updateProjectFeatured(project._id, !project.featured);
      setProjects((prev) => prev.map((p) => p._id === project._id ? res.data.project : p));
      showToast('Project featured status updated.');
    } catch {
      showToast('Unable to update featured status.', 'error');
    }
  };

  const openCreate = () => { setEditingProject(null); setShowForm(true); };
  const openEdit = (project) => { setEditingProject(project); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingProject(null); addBtnRef.current?.focus(); };

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.technologies || []).some((t) => t.toLowerCase().includes(q));
    const matchStatus = !filterStatus || p.status === filterStatus;
    const matchFeatured = filterFeatured === '' ||
      (filterFeatured === 'true' ? p.featured : !p.featured);
    const matchActive = filterActive === '' ||
      (filterActive === 'true' ? p.isActive : !p.isActive);
    return matchSearch && matchStatus && matchFeatured && matchActive;
  });

  return (
    <div className="admin-projects">
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal project={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      <div className="projects-page-header">
        <div>
          <h2>Projects Management</h2>
          <p>Manage the projects displayed on your public portfolio.</p>
        </div>
        <button ref={addBtnRef} className="btn btn-primary" onClick={openCreate} disabled={showForm}>
          + Add Project
        </button>
      </div>

      {showForm && (
        <ProjectForm editing={editingProject} onSave={handleSave} onCancel={closeForm} saving={saving} />
      )}

      {loadError && (
        <div className="admin-alert error" role="alert">
          <p>{loadError}</p>
          <button className="btn btn-sm btn-outline" onClick={loadProjects}>Retry</button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="projects-controls">
          <div className="projects-search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="projects-search" type="text" placeholder="Search projects…"
              value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search projects" />
          </div>
          <select className="proj-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select className="proj-filter" value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)} aria-label="Filter by featured">
            <option value="">Featured: All</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
          <select className="proj-filter" value={filterActive} onChange={(e) => setFilterActive(e.target.value)} aria-label="Filter by active">
            <option value="">Active: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="projects-loading"><div className="spinner" /><p>Loading projects…</p></div>
      ) : !loadError && filtered.length === 0 ? (
        <div className="projects-empty">
          {projects.length === 0 ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <p>No projects have been added yet.</p>
              <span>Add your first project to start building your portfolio.</span>
              <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 'var(--space-4)' }}>
                Add Project
              </button>
            </>
          ) : (
            <>
              <p>No projects match your filters.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setFilterStatus(''); setFilterFeatured(''); setFilterActive(''); }}>
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : !loadError ? (
        <>
          {/* Desktop Table */}
          <div className="projects-table-wrap">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Order</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proj) => (
                  <tr key={proj._id} className={!proj.isActive ? 'row-inactive' : ''}>
                    <td>
                      <div className="proj-name-cell">
                        {proj.image ? (
                          <img src={proj.image} alt={proj.title} className="proj-thumb"
                            onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="proj-thumb-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="proj-title">{proj.title}</p>
                          <p className="proj-slug">/{proj.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td>{proj.category || <span className="muted">—</span>}</td>
                    <td>
                      <span className={`status-badge status-${proj.status || 'none'}`}>
                        {STATUS_LABELS[proj.status] || '—'}
                      </span>
                    </td>
                    <td>
                      <button className={`featured-toggle ${proj.featured ? 'featured-on' : 'featured-off'}`}
                        onClick={() => handleToggleFeatured(proj)} aria-label={`Toggle featured: ${proj.title}`}>
                        {proj.featured ? '★ Yes' : '☆ No'}
                      </button>
                    </td>
                    <td className="order-cell">{proj.order}</td>
                    <td>
                      <button className={`status-toggle ${proj.isActive ? 'status-active' : 'status-inactive'}`}
                        onClick={() => handleToggleStatus(proj)} aria-label={`Toggle status: ${proj.title}`}>
                        {proj.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon-sm" onClick={() => openEdit(proj)} aria-label={`Edit ${proj.title}`} title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(proj)} aria-label={`Delete ${proj.title}`} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="projects-cards">
            {filtered.map((proj) => (
              <div key={proj._id} className={`project-card ${!proj.isActive ? 'card-inactive' : ''}`}>
                <div className="project-card-top">
                  {proj.image ? (
                    <img src={proj.image} alt={proj.title} className="project-card-img"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="project-card-img-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="project-card-info">
                    <p className="proj-title">{proj.title}</p>
                    <p className="proj-slug">/{proj.slug}</p>
                    {proj.category && <p className="proj-cat">{proj.category}</p>}
                  </div>
                  <div className="action-btns">
                    <button className="btn-icon-sm" onClick={() => openEdit(proj)} aria-label={`Edit ${proj.title}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="btn-icon-sm btn-icon-danger" onClick={() => setDeleteTarget(proj)} aria-label={`Delete ${proj.title}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="project-card-meta">
                  <span className={`status-badge status-${proj.status || 'none'}`}>{STATUS_LABELS[proj.status] || '—'}</span>
                  <button className={`featured-toggle ${proj.featured ? 'featured-on' : 'featured-off'}`}
                    onClick={() => handleToggleFeatured(proj)} aria-label={`Toggle featured: ${proj.title}`}>
                    {proj.featured ? '★ Featured' : '☆ Not Featured'}
                  </button>
                  <button className={`status-toggle ${proj.isActive ? 'status-active' : 'status-inactive'}`}
                    onClick={() => handleToggleStatus(proj)} aria-label={`Toggle status: ${proj.title}`}>
                    {proj.isActive ? 'Active' : 'Inactive'}
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

export default AdminProjects;
