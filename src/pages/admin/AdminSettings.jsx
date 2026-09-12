import React, { useState, useEffect } from 'react';
import { authApi } from '../../services/authApi';
import './AdminSettings.css';

const DEFAULT_SETTINGS = {
  siteTitle: '', siteDescription: '', defaultTheme: 'dark', defaultAccent: 'blue',
  maintenanceMode: false, portfolioVisible: true, contactFormEnabled: true,
  seoTitle: '', seoDescription: '', ogTitle: '', ogDescription: '', ogImage: '',
  twitterCard: 'summary_large_image', robotsIndex: true, robotsFollow: true,
  faviconUrl: '', customFooterText: ''
};

const THEME_OPTIONS = ['dark', 'light', 'system'];
const ACCENT_OPTIONS = ['blue', 'purple', 'green', 'rose', 'orange'];
const TWITTER_CARD_OPTIONS = ['summary', 'summary_large_image'];

const AdminSettings = () => {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true); setLoadError('');
    try {
      const res = await authApi.getAdminSettings();
      if (res.data?.settings) {
         setForm({ ...DEFAULT_SETTINGS, ...res.data.settings });
      }
    } catch {
      setLoadError('Unable to load settings right now.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const isValidHttpUrl = (string) => {
    if (!string || typeof string !== 'string') return true;
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch { return false; }
  };

  const validate = () => {
    const errs = {};
    if (form.siteTitle.length > 100) errs.siteTitle = 'Max 100 characters.';
    if (form.siteDescription.length > 300) errs.siteDescription = 'Max 300 characters.';
    if (!isValidHttpUrl(form.ogImage)) errs.ogImage = 'Must be a valid HTTP/HTTPS URL.';
    if (!isValidHttpUrl(form.faviconUrl)) errs.faviconUrl = 'Must be a valid HTTP/HTTPS URL.';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setForm(p => ({ ...p, [name]: newVal }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
       showToast('Please fix the highlighted errors.', 'error');
       return;
    }
    setSaving(true);
    try {
      const res = await authApi.saveAdminSettings(form);
      setForm({ ...DEFAULT_SETTINGS, ...res.data.settings });
      showToast('Settings saved successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-settings"><div className="set-empty"><div className="spinner" /><p>Loading settings…</p></div></div>;
  if (loadError) return (
      <div className="admin-settings">
          <div className="admin-alert error" role="alert">
             <p>{loadError}</p><button className="btn btn-sm btn-outline" onClick={loadSettings}>Retry</button>
          </div>
      </div>
  );

  return (
    <div className="admin-settings">
      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.msg}
        </div>
      )}

      <div className="set-page-header">
        <div>
          <h2>Site Settings</h2>
          <p>Manage centralized configuration for your portfolio.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="set-form-container" noValidate>
        
        {/* GENERAL */}
        <section className="set-section">
           <h3 className="set-section-title">General</h3>
           <div className="sf-grid">
              <div className="sf-group">
                 <label>Site Title</label>
                 <input type="text" name="siteTitle" value={form.siteTitle} onChange={handleChange} aria-invalid={!!errors.siteTitle} disabled={saving} />
                 {errors.siteTitle && <span className="sf-error">{errors.siteTitle}</span>}
              </div>
              <div className="sf-group sf-full">
                 <label>Site Description</label>
                 <textarea name="siteDescription" rows="2" value={form.siteDescription} onChange={handleChange} aria-invalid={!!errors.siteDescription} disabled={saving} />
                 {errors.siteDescription && <span className="sf-error">{errors.siteDescription}</span>}
              </div>
           </div>
        </section>

        {/* APPEARANCE */}
        <section className="set-section">
           <h3 className="set-section-title">Appearance</h3>
           <div className="sf-grid">
              <div className="sf-group">
                 <label>Default Theme</label>
                 <select name="defaultTheme" value={form.defaultTheme} onChange={handleChange} disabled={saving}>
                    {THEME_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                 </select>
              </div>
              <div className="sf-group">
                 <label>Default Accent Color</label>
                 <select name="defaultAccent" value={form.defaultAccent} onChange={handleChange} disabled={saving}>
                    {ACCENT_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                 </select>
              </div>
           </div>
        </section>

        {/* PUBLIC VISIBILITY */}
        <section className="set-section">
           <h3 className="set-section-title">Public Visibility</h3>
           <div className="set-toggles">
              <label className="toggle-switch-label">
                <input type="checkbox" name="portfolioVisible" checked={form.portfolioVisible} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                <span className="toggle-text">Portfolio Visible <small>Uncheck to hide public content.</small></span>
              </label>
              <label className="toggle-switch-label">
                <input type="checkbox" name="maintenanceMode" checked={form.maintenanceMode} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                <span className="toggle-text text-danger">Maintenance Mode <small>Activate a temporary maintenance screen.</small></span>
              </label>
              <label className="toggle-switch-label">
                <input type="checkbox" name="contactFormEnabled" checked={form.contactFormEnabled} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                <span className="toggle-text">Contact Form Enabled <small>Allow public visitors to send messages.</small></span>
              </label>
           </div>
        </section>

        {/* SEO */}
        <section className="set-section">
           <h3 className="set-section-title">SEO & Metadata</h3>
           <div className="sf-grid">
              <div className="sf-group">
                 <label>SEO Title (Optional override)</label>
                 <input type="text" name="seoTitle" value={form.seoTitle} onChange={handleChange} disabled={saving} />
              </div>
              <div className="sf-group">
                 <label>Favicon URL</label>
                 <input type="text" name="faviconUrl" value={form.faviconUrl} onChange={handleChange} aria-invalid={!!errors.faviconUrl} disabled={saving} placeholder="https://" />
                 {errors.faviconUrl && <span className="sf-error">{errors.faviconUrl}</span>}
              </div>
              <div className="sf-group sf-full">
                 <label>SEO Description</label>
                 <textarea name="seoDescription" rows="2" value={form.seoDescription} onChange={handleChange} disabled={saving} />
              </div>
              
              <div className="sf-group">
                 <label>Open Graph Title</label>
                 <input type="text" name="ogTitle" value={form.ogTitle} onChange={handleChange} disabled={saving} />
              </div>
              <div className="sf-group">
                 <label>Twitter Card Type</label>
                 <select name="twitterCard" value={form.twitterCard} onChange={handleChange} disabled={saving}>
                    {TWITTER_CARD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                 </select>
              </div>
              <div className="sf-group sf-full">
                 <label>Open Graph Description</label>
                 <textarea name="ogDescription" rows="2" value={form.ogDescription} onChange={handleChange} disabled={saving} />
              </div>
              <div className="sf-group sf-full">
                 <label>Open Graph Image URL</label>
                 <input type="text" name="ogImage" value={form.ogImage} onChange={handleChange} aria-invalid={!!errors.ogImage} disabled={saving} placeholder="https://" />
                 {errors.ogImage && <span className="sf-error">{errors.ogImage}</span>}
              </div>
           </div>
           
           <div className="set-toggles mt-3">
              <label className="toggle-switch-label">
                <input type="checkbox" name="robotsIndex" checked={form.robotsIndex} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                <span className="toggle-text">Allow Search Engines to Index (robots: index)</span>
              </label>
              <label className="toggle-switch-label">
                <input type="checkbox" name="robotsFollow" checked={form.robotsFollow} onChange={handleChange} disabled={saving} />
                <span className="toggle-switch-track"></span>
                <span className="toggle-text">Allow Search Engines to Follow Links (robots: follow)</span>
              </label>
           </div>
        </section>

        {/* FOOTER */}
        <section className="set-section">
           <h3 className="set-section-title">Footer</h3>
           <div className="sf-grid">
              <div className="sf-group sf-full">
                 <label>Custom Footer Text (Optional)</label>
                 <input type="text" name="customFooterText" value={form.customFooterText} onChange={handleChange} disabled={saving} placeholder="e.g. © 2026 My Portfolio. All rights reserved." />
              </div>
           </div>
        </section>
        
        <div className="set-page-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>
               {saving ? 'Saving...' : 'Save Settings'}
            </button>
        </div>

      </form>
    </div>
  );
};

export default AdminSettings;
