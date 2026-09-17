import React, { useState } from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { useSelector } from 'react-redux';
import { portfolioApi } from '../../services/portfolioApi';
import './Contact.css';

const Contact = () => {
  const headerRef = useScrollReveal();
  const formRef = useScrollReveal();
  const infoRef = useScrollReveal();

  const { data: profile } = useSelector((state) => state.portfolio.profile);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [submitMessage, setSubmitMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required.';
    if (!formData.subject.trim()) newErrors.subject = 'Please select or enter a subject.';
    if (!formData.message.trim() || formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (status === 'error' || status === 'success') {
       setStatus('idle');
       setSubmitMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setStatus('submitting');
      setSubmitMessage('');
      try {
        await portfolioApi.createMessage(formData);
        setStatus('success');
        setSubmitMessage('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } catch (error) {
        setStatus('error');
        setSubmitMessage('Failed to send message.');
      }
    }
  };

  // Extract contact info safely
  const emailInfo = profile?.email || 'saqibrind46@gmail.com';
  const locationInfo = profile?.location || 'Karachi, Pakistan';
  const githubUrl = profile?.githubUrl || '#';
  const linkedinUrl = profile?.linkedinUrl || '#';

  return (
    <section id="contact" className="contact-section">
      
      {/* Background wireframe effect */}
      <div className="contact-bg-wireframe" aria-hidden="true" />
      <div className="contact-bg-glow" aria-hidden="true" />

      <div className="container relative-z">
        
        <div className="contact-layout">
          
          {/* ── LEFT COLUMN: Info ── */}
          <div ref={infoRef} className="contact-left reveal-right">
            <div className="contact-eyebrow">
              <span className="contact-eyebrow-line" />
              Get In Touch
            </div>
            
            <h2 className="contact-title">Let's Talk</h2>
            <p className="contact-desc">
              Have a project in mind or want to discuss opportunities?<br/>
              I'd love to hear from you.
            </p>

            <div className="contact-details-list">
              
              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="contact-detail-text">
                  <span>Email</span>
                  <strong>{emailInfo}</strong>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="contact-detail-text">
                  <span>Location</span>
                  <strong>{locationInfo}</strong>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <div className="contact-detail-text">
                  <span>Open to</span>
                  <strong>Remote & International Opportunities</strong>
                </div>
              </div>

            </div>

            {/* Social Links Row */}
            <div className="contact-socials">
              <a href={`mailto:${emailInfo}`} className="social-icon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Form ── */}
          <div ref={formRef} className="contact-right reveal-left delay-200">
            
            {/* 3D Floating Envelope */}
            <div className="floating-envelope" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>

            <div className="contact-form-card">
              <form onSubmit={handleSubmit} noValidate>
                
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? 'error' : ''}
                  >
                    <option value="" disabled>Select subject</option>
                    <option value="Project Inquiry">Project Inquiry</option>
                    <option value="Job Opportunity">Job Opportunity</option>
                    <option value="Freelance Work">Freelance Work</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows="4"
                    className={errors.message ? 'error' : ''}
                  ></textarea>
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                {status === 'success' && <div className="status-message success">{submitMessage}</div>}
                {status === 'error' && <div className="status-message error">{submitMessage}</div>}

                <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending...' : 'Send Message →'}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
