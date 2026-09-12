import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCertifications } from '../../store/slices/portfolioSlice';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Certifications.css';

const Certifications = () => {
  const dispatch = useDispatch();
  const { data: dbCerts, fetched } = useSelector((state) => state.portfolio.certifications);

  const headerRef = useScrollReveal();
  const gridRef = useScrollReveal();

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchCertifications());
    }
  }, [dispatch, fetched]);

  const sortedCerts = useMemo(() => {
    if (!dbCerts) return [];
    return [...dbCerts].sort((a, b) => b.order - a.order || new Date(b.date) - new Date(a.date));
  }, [dbCerts]);

  const defaultColors = ['#0668E1', '#47a248', '#61dafb', '#f97316', '#8b5cf6'];
  const defaultIcons = ['M', '🍃', '⚛', '📜', '🏆'];

  return (
    <section id="certifications" className="certifications-section">
      <div className="cert-bg-glow" aria-hidden="true" />
      
      <div className="container relative-z">
        
        <div ref={headerRef} className="cert-header reveal-up">
          <div className="cert-eyebrow">
            <span className="cert-eyebrow-line" />
            Continuous Learning
          </div>
          <h2 className="cert-title">Certifications</h2>
        </div>

        <div ref={gridRef} className="cert-grid reveal-up delay-100">
          {sortedCerts.map((cert, i) => {
            const color = defaultColors[i % defaultColors.length];
            const icon = defaultIcons[i % defaultIcons.length];

            return (
              <div 
                key={cert._id} 
                className="cert-card"
                style={{ '--cert-color': color, '--card-delay': `${i * 150}ms` }}
              >
                {/* Glowing Badge Icon */}
                <div className="cert-badge">
                  <span className="cert-icon">{icon}</span>
                </div>

                {/* Info */}
                <div className="cert-info">
                  <h3 className="cert-name">{cert.title}</h3>
                  <p className="cert-issuer">{cert.issuer}</p>
                </div>

                {/* Footer */}
                <div className="cert-footer">
                  <span className="cert-date">{cert.date}</span>
                  <a href={cert.credentialUrl || '#'} className="cert-link">
                    Verify
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Certifications;
