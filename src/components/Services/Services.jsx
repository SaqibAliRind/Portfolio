import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../../store/slices/portfolioSlice';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Services.css';

/* ── Empty State ───────────────────────────────────────────── */
const EmptyState = () => (
  <div className="services-empty" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
    <p style={{ color: 'var(--color-text-muted)' }}>Services information coming soon.</p>
  </div>
);

/* ── Service Icons (Inline SVG mapping) ────────────────────── */
const getIcon = (iconName) => {
  const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "28",
    height: "28",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (iconName?.toLowerCase()) {
    case 'fullstack':
      return (
        <svg {...iconProps}>
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      );
    case 'frontend':
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      );
    case 'backend':
      return (
        <svg {...iconProps}>
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      );
    case 'database':
      return (
        <svg {...iconProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
      );
    case 'auth':
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
          <path d="M12 11v3"></path>
        </svg>
      );
    case 'management':
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
  }
};

/* ── Service Card ──────────────────────────────────────────── */
const ServiceCard = ({ service, index }) => {
  const cardRef = useScrollReveal();
  const { title, shortDescription, technologies = [], features = [], icon, available } = service;
  const delays = ['delay-100', 'delay-200', 'delay-300'];
  const delayClass = delays[index % 3] || '';

  return (
    <article ref={cardRef} className={`service-card reveal-up ${delayClass}`}>
      <div className="service-card-header">
        <div className="service-icon-wrapper" aria-hidden="true">
          {getIcon(icon)}
        </div>
        {available && (
          <span className="service-status-badge">Available</span>
        )}
      </div>

      <div className="service-card-body">
        <h3 className="service-title">{title}</h3>
        <p className="service-description">{shortDescription}</p>

        {/* Features List */}
        {features.length > 0 && (
          <ul className="service-features">
            {features.map((feature, i) => (
              <li key={i} className="service-feature-item">
                <svg className="service-feature-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="service-card-footer">
        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="service-tech-badges">
            {technologies.map((tech) => (
              <span key={tech} className="service-tech-badge">{tech}</span>
            ))}
          </div>
        )}

        <div className="service-card-actions">
           {/* Future Contact Link */}
           <a href="#contact" className="service-action-link">
             Discuss a Project
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <line x1="5" y1="12" x2="19" y2="12"></line>
               <polyline points="12 5 19 12 12 19"></polyline>
             </svg>
           </a>
        </div>
      </div>
    </article>
  );
};

/* ── Main Section ──────────────────────────────────────────── */
const Services = () => {
  const dispatch = useDispatch();
  const { data: services, loading, error, fetched } = useSelector((state) => state.portfolio.services);

  const headerRef = useScrollReveal();

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchServices());
    }
  }, [dispatch, fetched]);

  const hasServices = services && services.length > 0;

  if (loading && !fetched) {
     return (
        <section id="services" className="section services-section">
          <div className="container text-center" style={{ padding: '4rem' }}>
            <p>Loading services...</p>
          </div>
        </section>
     );
  }

  if (error) {
     return (
        <section id="services" className="section services-section">
          <div className="container text-center" style={{ padding: '4rem', color: 'var(--color-danger)' }}>
            <p>Unable to load services right now.</p>
            <button className="btn btn-outline btn-sm mt-4" onClick={() => dispatch(fetchServices())}>Retry</button>
          </div>
        </section>
     );
  }

  // Fallback if empty database, hide completely or show empty state if desired.
  if (!hasServices) {
     return (
        <section id="services" className="section services-section">
          <div className="container">
             <EmptyState />
          </div>
        </section>
     );
  }

  return (
    <section id="services" className="section services-section">
      <div className="container">

        {/* Section Header */}
        <div ref={headerRef} className="section-header text-center reveal-up">
          <span className="section-label">What I Do</span>
          <h2 className="section-title">My Services</h2>
          <p className="section-subtitle text-muted">
            Specialized technical solutions and development services tailored to your needs.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <ServiceCard
              key={service._id}
              service={service}
              index={index}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;
