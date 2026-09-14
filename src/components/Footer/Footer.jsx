import React from 'react';
import { contactInfo } from '../../data/contact';
import './Footer.css';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = contactInfo.filter(i => i.type === 'social' && i.href);

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-main">

          {/* Brand */}
          <div className="footer-brand">
            <h3 className="footer-name">Saqib Ali <span>Rind</span></h3>
            <p className="footer-tagline">MERN Stack Developer</p>
            <p className="footer-bio">
              Building modern, scalable full-stack web applications.
              Open to remote &amp; international opportunities.
            </p>
            <div className="footer-social-row">
              <a href="mailto:saqibrind46@gmail.com" className="footer-icon-btn" aria-label="Email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
              {socialLinks.map(link => (
                <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer"
                   className="footer-icon-btn" aria-label={link.label}>
                  {link.id === 'github' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                  )}
                  {link.id === 'linkedin' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Quick Links</h4>
            <nav className="footer-nav">
              {navItems.map(item => (
                <a key={item.label} href={item.href} className="footer-link">{item.label}</a>
              ))}
            </nav>
          </div>

          {/* CTA */}
          <div className="footer-cta-col">
            <h4 className="footer-heading">Let's Work Together</h4>
            <p className="footer-cta-text">
              Have a project in mind? I'd love to hear about it.
            </p>
            <a href="#contact" className="footer-cta-btn">Get In Touch →</a>

            <p className="footer-github-link">
              <a href="https://github.com/saqib123s/Portfolio" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                View Source Code
              </a>
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {currentYear} <span>Saqib Ali Rind</span>. All rights reserved.
          </p>
          <p className="footer-stack">
            Built with React · Node.js · MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
