import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/portfolioSlice';
import HeroScene from './HeroScene/HeroScene';
import './Hero.css';

// Tech stack with brand colors for the pills
const TECH_ICONS = {
  'React.js':    { color: '#61dafb', icon: '⚛' },
  'Node.js':     { color: '#68a063', icon: '⬡' },
  'Express.js':  { color: '#888',    icon: '⚡' },
  'MongoDB':     { color: '#47a248', icon: '🍃' },
  'JavaScript':  { color: '#f7df1e', icon: 'JS' },
  'TypeScript':  { color: '#3178c6', icon: 'TS' },
  'Redux':       { color: '#764abc', icon: '⚙' },
  'Next.js':     { color: '#fff',    icon: 'N' },
};

const Hero = () => {
  const dispatch = useDispatch();
  const { data: profile, fetched } = useSelector((state) => state.portfolio.profile);

  useEffect(() => {
    if (!fetched) dispatch(fetchProfile());
  }, [dispatch, fetched]);

  const technologies = profile?.skills?.slice(0, 5) || ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript'];
  const name        = profile?.name     || 'Saqib Ali Rind';
  const title       = profile?.title    || 'MERN Stack Developer';
  const bio         = profile?.bio      || 'I build modern, scalable, and high-performance full-stack web applications. Passionate about crafting clean user experiences and robust backend systems.';
  const githubLink  = profile?.socialLinks?.github   || '#';
  const linkedinLink= profile?.socialLinks?.linkedin || '#';
  const resumeLink  = profile?.resumeUrl || '/resume.pdf';

  // Split name for highlight effect (last word in orange like reference)
  const nameParts = name.trim().split(' ');
  const lastName  = nameParts.pop();
  const firstName = nameParts.join(' ');

  return (
    <section id="home" className="hero-section">
      {/* Neon background layers */}
      <div className="hero-bg-neon-left"  aria-hidden="true" />
      <div className="hero-bg-neon-right" aria-hidden="true" />
      <div className="hero-bg-grid"       aria-hidden="true" />
      <div className="hero-bg-vignette"   aria-hidden="true" />

      <div className="container hero-container">
        {/* ── Left: Content ── */}
        <div className="hero-content">

          {/* Eyebrow */}
          <div className="hero-greeting">
            <span className="hero-greeting-line" aria-hidden="true" />
            Hello, I'm
          </div>

          {/* Name with orange highlight */}
          <h1 className="hero-name">
            {firstName && <span className="hero-name-first">{firstName} </span>}
            <span className="hero-name-last">{lastName}</span>
          </h1>

          {/* Role */}
          <h2 className="hero-title">
            <span className="title-mern">MERN</span> Stack Developer
          </h2>

          {/* Bio */}
          <p className="hero-description">{bio}</p>

          {/* Tech pills with brand colors */}
          <div className="hero-tech-stack">
            {technologies.map((tech) => {
              const info = TECH_ICONS[tech] || { color: '#888', icon: '◆' };
              return (
                <span
                  key={tech}
                  className="tech-badge"
                  style={{ '--badge-color': info.color }}
                >
                  <span className="tech-badge-icon">{info.icon}</span>
                  {tech}
                </span>
              );
            })}
          </div>

          {/* Availability */}
          <div className="hero-availability">
            <span className="availability-dot" />
            Open to Remote &amp; International Opportunities
          </div>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <a href="#projects" className="btn-hero-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="m8 21 4-4 4 4" />
              </svg>
              View Projects
            </a>
            <a href="#contact" className="btn-hero-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Contact Me
            </a>
            <a href={resumeLink} className="btn-hero-ghost" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download CV
            </a>
          </div>

          {/* Social Links */}
          <div className="hero-socials">
            <a
              href={githubLink}
              className={`social-link ${githubLink === '#' ? 'disabled' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
            <span className="social-divider" aria-hidden="true" />
            <a
              href={linkedinLink}
              className={`social-link ${linkedinLink === '#' ? 'disabled' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>

        </div>

        {/* ── Right: 3D Scene ── */}
        <div className="hero-visual">
          <HeroScene />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator" aria-hidden="true">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>Scroll Down</span>
      </div>
    </section>
  );
};

export default Hero;
