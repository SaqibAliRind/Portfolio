import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' }
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccentMenuOpen, setIsAccentMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const { theme, accentColor, toggleTheme, setAccentColor, VALID_ACCENTS } = useTheme();
  const location = useLocation();
  const accentMenuRef = useRef(null);

  // Scroll handler for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for active sections
  useEffect(() => {
    if (location.pathname !== '/') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -79% 0px' } // Trigger when section is near top
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [location.pathname]);

  // Click outside for accent menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accentMenuRef.current && !accentMenuRef.current.contains(e.target)) {
        setIsAccentMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key handlers
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsAccentMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Handle navigation click
  const handleNavClick = (e, href) => {
    setIsMobileMenuOpen(false);
    
    // If we are not on the home page, let the Link handle standard navigation to '/'
    // If we are on the home page, smoothly scroll to the section
    if (location.pathname === '/') {
      const isHash = href.startsWith('#');
      if (isHash) {
        e.preventDefault();
        const targetId = href.substring(1);
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Update URL hash without jumping
          window.history.pushState(null, '', href);
        }
      }
    }
  };

  const AccentSelector = () => (
    <div className="accent-selector" ref={accentMenuRef}>
      <button 
        className="accent-selector__trigger" 
        onClick={() => setIsAccentMenuOpen(!isAccentMenuOpen)}
        aria-label="Select accent color"
        aria-expanded={isAccentMenuOpen}
      >
        <span className="accent-color-dot" style={{ backgroundColor: 'var(--color-primary)' }} />
      </button>
      
      {isAccentMenuOpen && (
        <div className="accent-selector__menu">
          {VALID_ACCENTS.map((color) => (
            <button
              key={color}
              className={`accent-selector__item ${accentColor === color ? 'active' : ''}`}
              onClick={() => {
                setAccentColor(color);
                setIsAccentMenuOpen(false);
              }}
              aria-label={`Set accent color to ${color}`}
              aria-pressed={accentColor === color}
            >
              <span className="accent-color-dot" data-color={color} />
              <span className="accent-name">{color}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        
        {/* Left: Logo */}
        <div className="navbar-brand">
          <Link to="/" onClick={(e) => handleNavClick(e, '#home')} className="navbar-logo">
            Saqib Ali Rind
            <span className="navbar-subtitle hidden-mobile">MERN Stack Developer</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="navbar-nav desktop-only" aria-label="Main navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.label} className="nav-item">
                <Link 
                  to={location.pathname === '/' ? item.href : `/${item.href}`}
                  className={`nav-link ${activeSection === item.href.substring(1) && location.pathname === '/' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="navbar-actions desktop-only">
          <div className="social-links">
            <a href="#" className="nav-link disabled" title="GitHub (Coming soon)">GitHub</a>
            <a href="#" className="nav-link disabled" title="LinkedIn (Coming soon)">LinkedIn</a>
          </div>
          <a href="/resume.pdf" className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
            Download CV
          </a>
          
          <div className="divider" />
          
          <button 
            className="theme-toggle btn-ghost" 
            onClick={toggleTheme} 
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <AccentSelector />
        </div>

        {/* Mobile controls */}
        <div className="navbar-mobile-controls mobile-only">
          <button 
            className="theme-toggle btn-ghost" 
            onClick={toggleTheme} 
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <ul className="mobile-nav-list">
            {navItems.map((item) => (
              <li key={item.label} className="mobile-nav-item">
                <Link 
                  to={location.pathname === '/' ? item.href : `/${item.href}`}
                  className={`mobile-nav-link ${activeSection === item.href.substring(1) && location.pathname === '/' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mobile-nav-divider" />
          
          <div className="mobile-actions">
            <a href="#" className="mobile-nav-link disabled">GitHub</a>
            <a href="#" className="mobile-nav-link disabled">LinkedIn</a>
            <a href="/resume.pdf" className="btn btn-primary w-full" target="_blank" rel="noopener noreferrer" style={{ justifyContent: 'center' }}>
              Download CV
            </a>
          </div>

          <div className="mobile-nav-divider" />
          
          <div className="mobile-accent-selector">
            <span className="mobile-accent-title">Accent Color</span>
            <div className="mobile-accent-grid">
              {VALID_ACCENTS.map((color) => (
                <button
                  key={color}
                  className={`mobile-accent-btn ${accentColor === color ? 'active' : ''}`}
                  onClick={() => setAccentColor(color)}
                  aria-label={`Set accent color to ${color}`}
                >
                  <span className="accent-color-dot" data-color={color} />
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
