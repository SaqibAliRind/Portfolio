import React, { useState, useEffect } from 'react';
import { authApi } from '../../services/authApi';
import './AdminProfile.css';

const AdminProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    shortBio: '',
    longBio: '',
    profileImage: '',
    resumeUrl: '',
    email: '',
    phone: '',
    location: '',
    availability: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    yearsOfExperience: '',
    isAvailable: true,
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.getAdminProfile();
      if (res.data?.profile) {
        setIsExisting(true);
        const p = res.data.profile;
        setFormData({
          name: p.name || '',
          title: p.title || '',
          shortBio: p.shortBio || '',
          longBio: p.longBio || '',
          profileImage: p.profileImage || '',
          resumeUrl: p.resumeUrl || '',
          email: p.email || '',
          phone: p.phone || '',
          location: p.location || '',
          availability: p.availability || '',
          githubUrl: p.githubUrl || '',
          linkedinUrl: p.linkedinUrl || '',
          websiteUrl: p.websiteUrl || '',
          yearsOfExperience: p.yearsOfExperience !== undefined && p.yearsOfExperience !== null ? p.yearsOfExperience : '',
          isAvailable: p.isAvailable ?? true,
          isActive: p.isActive ?? true,
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setIsExisting(false);
      } else {
        setErrorMsg('Unable to load profile right now.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (successMsg) setSuccessMsg('');
    if (errorMsg) setErrorMsg('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.shortBio.trim()) errors.shortBio = 'Short Bio is required';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    const urlFields = ['profileImage', 'resumeUrl', 'githubUrl', 'linkedinUrl', 'websiteUrl'];
    urlFields.forEach((field) => {
      if (formData[field]) {
        try {
          new URL(formData[field]);
        } catch {
          errors[field] = 'Must be a valid URL starting with http:// or https://';
        }
      }
    });

    if (formData.yearsOfExperience !== '') {
      const yoe = Number(formData.yearsOfExperience);
      if (isNaN(yoe) || yoe < 0) {
        errors.yearsOfExperience = 'Must be a positive number';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setErrorMsg('Please fix the validation errors below.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isExisting) {
        await authApi.updateAdminProfile(formData);
        setSuccessMsg('Profile updated successfully.');
      } else {
        await authApi.createAdminProfile(formData);
        setSuccessMsg('Profile created successfully.');
        setIsExisting(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (field, currentValue) => {
    // Optimistic UI update or explicit state change
    const newValue = !currentValue;
    
    if (!isExisting) {
      // If profile doesn't exist yet in DB, just update local state
      setFormData(prev => ({ ...prev, [field]: newValue }));
      return;
    }

    if (field === 'isActive') {
      try {
        setSaving(true);
        await authApi.updateAdminProfileStatus(newValue);
        setFormData(prev => ({ ...prev, isActive: newValue }));
        setSuccessMsg(`Profile is now ${newValue ? 'Active' : 'Inactive'}`);
      } catch (err) {
        setErrorMsg('Failed to update status.');
      } finally {
        setSaving(false);
      }
    } else {
      // For isAvailable, we must update the whole profile right now or just local state until save
      // Prompt says "The admin should be able to activate/deactivate the profile... Call PATCH /api/admin/profile/status"
      // So only isActive uses the quick toggle API. isAvailable is part of standard PUT.
      setFormData(prev => ({ ...prev, [field]: newValue }));
    }
  };

  if (loading) {
    return (
      <div className="admin-profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      <div className="admin-page-header">
        <div>
          <h2>Profile Management</h2>
          <p>Manage the information displayed on your public portfolio.</p>
        </div>
        
        {isExisting && (
          <div className="admin-profile-status-badge">
            <span className="status-label">Profile Status:</span>
            <span className={`status-pill ${formData.isActive ? 'active' : 'inactive'}`}>
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        )}
      </div>

      {!isExisting && !errorMsg && (
        <div className="admin-alert info">
          <p>No profile exists yet. Create your portfolio profile below.</p>
        </div>
      )}

      {errorMsg && (
        <div className="admin-alert error" role="alert">
          <p>{errorMsg}</p>
          {errorMsg === 'Unable to load profile right now.' && (
            <button className="btn btn-sm btn-outline" onClick={loadProfile}>Retry</button>
          )}
        </div>
      )}

      {successMsg && (
        <div className="admin-alert success" role="status">
          <p>{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-profile-form">
        
        {/* Basic Information */}
        <section className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="title">Professional Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={saving}
                aria-invalid={!!fieldErrors.title}
              />
              {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="shortBio">Short Bio * <span className="char-count">{formData.shortBio.length} / 500</span></label>
            <textarea
              id="shortBio"
              name="shortBio"
              rows="3"
              maxLength="500"
              value={formData.shortBio}
              onChange={handleChange}
              disabled={saving}
              aria-invalid={!!fieldErrors.shortBio}
            />
            {fieldErrors.shortBio && <span className="field-error">{fieldErrors.shortBio}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="longBio">Long Bio <span className="char-count">{formData.longBio.length} / 5000</span></label>
            <textarea
              id="longBio"
              name="longBio"
              rows="6"
              maxLength="5000"
              value={formData.longBio}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </section>

        {/* Contact Information */}
        <section className="form-section">
          <h3>Contact Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={saving}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="availability">Availability Details</label>
              <input
                type="text"
                id="availability"
                name="availability"
                placeholder="e.g. Freelance, Full-time"
                value={formData.availability}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="form-section">
          <h3>Social & Professional Links</h3>
          <p className="section-desc">Enter a complete URL beginning with https://</p>
          <div className="form-grid">
            {['githubUrl', 'linkedinUrl', 'websiteUrl', 'resumeUrl', 'profileImage'].map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>
                  {field === 'githubUrl' && 'GitHub URL'}
                  {field === 'linkedinUrl' && 'LinkedIn URL'}
                  {field === 'websiteUrl' && 'Website URL'}
                  {field === 'resumeUrl' && 'Resume URL'}
                  {field === 'profileImage' && 'Profile Image URL'}
                </label>
                <input
                  type="url"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={saving}
                  aria-invalid={!!fieldErrors[field]}
                />
                {fieldErrors[field] && <span className="field-error">{fieldErrors[field]}</span>}
                {field === 'resumeUrl' && formData.resumeUrl && !fieldErrors.resumeUrl && (
                  <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="helper-link">View Resume</a>
                )}
                {field === 'profileImage' && formData.profileImage && !fieldErrors.profileImage && (
                  <a href={formData.profileImage} target="_blank" rel="noopener noreferrer" className="helper-link">Preview Image</a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Status & Availability */}
        <section className="form-section">
          <h3>Availability & Status</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="yearsOfExperience">Years of Experience</label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                min="0"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                disabled={saving}
                aria-invalid={!!fieldErrors.yearsOfExperience}
              />
              {fieldErrors.yearsOfExperience && <span className="field-error">{fieldErrors.yearsOfExperience}</span>}
            </div>
          </div>

          <div className="toggle-group-container">
            <div className="toggle-group">
              <div className="toggle-text">
                <label htmlFor="isAvailable" className="toggle-label">Available for Opportunities</label>
                <span className="toggle-desc">Allow the public portfolio to indicate that you are available.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => toggleStatus('isAvailable', !e.target.checked)}
                  disabled={saving}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="toggle-group">
              <div className="toggle-text">
                <label htmlFor="isActive" className="toggle-label">Profile Active</label>
                <span className="toggle-desc">Show this profile through the public portfolio API.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => toggleStatus('isActive', !e.target.checked)}
                  disabled={saving}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : (isExisting ? 'Save Changes' : 'Create Profile')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfile;
