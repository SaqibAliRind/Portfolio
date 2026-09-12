import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../store/slices/portfolioSlice';
import { demoProjects } from '../data/demoProjects';
import './ProjectDetails.css';

const NAV_ITEMS = [
  { id: 'overview', label: 'Project Overview', icon: '🗂️' },
  { id: 'features', label: 'Features', icon: '⚡' },
  { id: 'screenshots', label: 'Screenshots', icon: '🖼️' },
  { id: 'techstack', label: 'Tech Stack', icon: '🛠️' },
  { id: 'myrole', label: 'My Role', icon: '👤' },
  { id: 'duration', label: 'Project Duration', icon: '⏱️' },
  { id: 'links', label: 'Live Demo & Code', icon: '🚀' },
];

function ProjectDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { data: dbProjects, loading, fetched } = useSelector((state) => state.portfolio.projects);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    if (!fetched && !loading) dispatch(fetchProjects());
  }, [dispatch, fetched, loading]);

  const project = useMemo(() => {
    const dbMatch = dbProjects?.find((p) => p.slug === slug || p._id === slug);
    if (dbMatch) return dbMatch;
    if (fetched || !loading) return demoProjects.find((p) => p.slug === slug || p._id === slug);
    return null;
  }, [dbProjects, fetched, loading, slug]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveSection(id); }
  };

  if (loading && !fetched) {
    return (
      <main className="pd-page">
        <div className="pd-loading">
          <div className="pd-spinner" />
          <p>Loading project...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="pd-page">
        <div className="pd-not-found">
          <h1>Project Not Found</h1>
          <Link to="/#projects" className="pd-btn-primary">← Back to Projects</Link>
        </div>
      </main>
    );
  }

  const screenshots = project.screenshots || (project.image ? [project.image] : []);
  const technologies = project.technologies || [];
  const features = project.features || [];

  return (
    <main className="pd-page">

      {/* ══════════════════ HERO SECTION ══════════════════ */}
      <section className="pd-hero">
        <div className="pd-hero-bg" />

        <div className="pd-hero-inner">
          <div className="pd-hero-content">
            {/* Back + Badge */}
            <div className="pd-hero-top">
              <Link to="/#projects" className="pd-back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Back to Projects
              </Link>
              {project.category && <span className="pd-category-badge">{project.category}</span>}
            </div>

            {/* Title */}
            <h1 className="pd-hero-title">{project.title}</h1>
            <p className="pd-hero-desc">{project.shortDescription}</p>

            {/* Tech Badges */}
            {technologies.length > 0 && (
              <div className="pd-tech-badges">
                {technologies.map((tech, i) => (
                  <span key={i} className="pd-tech-badge" style={{ '--tc': typeof tech === 'object' ? tech.color : '#fff' }}>
                    {typeof tech === 'object' ? (
                      <><span className="pd-tech-icon">{tech.icon}</span>{tech.name}</>
                    ) : tech}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pd-hero-actions">
              {project.liveDemo && project.liveDemo !== '#' ? (
                <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="pd-btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Live Demo
                </a>
              ) : (
                <span className="pd-btn-primary pd-btn-disabled">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Live Demo
                </span>
              )}
              <a href={project.github || '#'} target="_blank" rel="noopener noreferrer" className="pd-btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                View Code
              </a>
            </div>
          </div>

          {/* Hero Image */}
          {project.heroImage && (
            <div className="pd-hero-image">
              <img src={project.heroImage} alt={project.title} />
              <div className="pd-hero-image-glow" />
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ 3-COLUMN MAIN ══════════════════ */}
      <section className="pd-main">
        <div className="pd-main-inner">

          {/* LEFT: Sticky Sidebar Nav */}
          <aside className="pd-sidebar">
            <nav className="pd-sidebar-nav">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  className={`pd-nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => scrollTo(item.id)}
                >
                  <span className="pd-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="pd-sidebar-tagline">
              <span>🚀</span>
              <p>Built with modern technologies for a seamless and efficient experience.</p>
            </div>
          </aside>

          {/* CENTER: Content */}
          <div className="pd-content">

            {/* About */}
            <div id="overview" className="pd-section">
              <div className="pd-section-icon">⭐</div>
              <h2 className="pd-section-title">About the Project</h2>
              <div className="pd-about-text">
                {(project.fullDescription || project.shortDescription)
                  .split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div id="features" className="pd-section">
                <div className="pd-section-icon">⚡</div>
                <h2 className="pd-section-title">Key Features</h2>
                <div className="pd-features-grid">
                  {features.map((f, i) => {
                    const title = typeof f === 'object' ? f.title : f;
                    const desc = typeof f === 'object' ? f.desc : '';
                    const icon = typeof f === 'object' ? f.icon : '✦';
                    return (
                      <div key={i} className="pd-feature-card">
                        <div className="pd-feature-icon">{icon}</div>
                        <div>
                          <h4>{title}</h4>
                          {desc && <p>{desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {technologies.length > 0 && (
              <div id="techstack" className="pd-section">
                <div className="pd-section-icon">🛠️</div>
                <h2 className="pd-section-title">Tech Stack</h2>
                <div className="pd-tech-grid">
                  {technologies.map((tech, i) => {
                    const name = typeof tech === 'object' ? tech.name : tech;
                    const role = typeof tech === 'object' ? tech.role : '';
                    const icon = typeof tech === 'object' ? tech.icon : name[0];
                    const color = typeof tech === 'object' ? tech.color : '#f97316';
                    return (
                      <div key={i} className="pd-tech-card" style={{ '--tc': color }}>
                        <span className="pd-tech-card-icon">{icon}</span>
                        <div>
                          <span className="pd-tech-card-name">{name}</span>
                          {role && <span className="pd-tech-card-role">{role}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* My Role */}
            <div id="myrole" className="pd-section">
              <div className="pd-section-icon">👤</div>
              <h2 className="pd-section-title">My Role</h2>
              <div className="pd-role-card">
                <div className="pd-role-header">
                  <span className="pd-role-badge">Full Stack Developer</span>
                </div>
                <p className="pd-role-desc">
                  {project.myRoleDesc || "Developed the complete frontend and backend, implemented authentication, database integration, and deployment."}
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT: Screenshots + Meta Cards */}
          <div className="pd-right">

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <div id="screenshots" className="pd-right-card">
                <div className="pd-right-card-header">
                  <span>🖼️</span>
                  <h3>Project Screenshots</h3>
                </div>
                <div className="pd-screenshots">
                  <div className="pd-screenshot-main">
                    <img src={screenshots[activeScreenshot]} alt={`Screenshot ${activeScreenshot + 1}`} />
                  </div>
                  {screenshots.length > 1 && (
                    <div className="pd-screenshot-thumbs">
                      {screenshots.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`Thumb ${i + 1}`}
                          className={activeScreenshot === i ? 'active' : ''}
                          onClick={() => setActiveScreenshot(i)}
                        />
                      ))}
                    </div>
                  )}
                  {screenshots.length > 1 && (
                    <div className="pd-screenshot-dots">
                      {screenshots.map((_, i) => (
                        <button key={i} className={`pd-dot ${i === activeScreenshot ? 'active' : ''}`} onClick={() => setActiveScreenshot(i)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tech Stack mini card */}
            <div id="duration" className="pd-meta-cards">
              <div className="pd-meta-card">
                <div className="pd-meta-card-icon">🛠️</div>
                <div>
                  <span className="pd-meta-card-label">Tech Stack</span>
                  <span className="pd-meta-card-val">Full Stack Developer</span>
                </div>
              </div>
              <div className="pd-meta-card">
                <div className="pd-meta-card-icon">⏱️</div>
                <div>
                  <span className="pd-meta-card-label">Project Duration</span>
                  <span className="pd-meta-card-val">{project.duration || 'Demo Project'}</span>
                  {project.duration && <span className="pd-meta-weeks">{project.duration}</span>}
                </div>
              </div>
              <div id="links" className="pd-meta-card pd-live-card">
                <div>
                  <span className="pd-meta-card-label">🔴 Live Demo</span>
                  <p>Experience the live version of this project.</p>
                </div>
                <a href={project.liveDemo || '#'} target="_blank" rel="noopener noreferrer" className="pd-visit-btn">
                  Visit Live Demo →
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}

export default ProjectDetails;
