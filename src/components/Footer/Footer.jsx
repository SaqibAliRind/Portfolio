import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/portfolioSlice';
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
  const dispatch = useDispatch();
  const { data: profile, fetched } = useSelector((state) => state.portfolio.profile);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!fetched) dispatch(fetchProfile());
  }, [dispatch, fetched]);

  const githubUrl   = profile?.githubUrl   || 'https://github.com/SaqibAliRind';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com/in/saqib-ali-rind-700856367';
  const email       = profile?.email       || 'saqibrind46@gmail.com';

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
              <a href={`mailto:${email}`} className="footer-icon-btn" aria-label="Email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="footer-icon-btn" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="footer-icon-btn" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
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
              <a href="https://github.com/SaqibAliRind/Portfolio" target="_blank" rel="noopener noreferrer">
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
