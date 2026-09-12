import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEducation } from '../../store/slices/portfolioSlice';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Education.css';

const Education = () => {
  const dispatch = useDispatch();
  const { data: dbEducation, fetched } = useSelector((state) => state.portfolio.education);

  const headerRef = useScrollReveal();
  const timelineRef = useScrollReveal();

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchEducation());
    }
  }, [dispatch, fetched]);

  const sortedEducation = useMemo(() => {
    if (!dbEducation) return [];
    return [...dbEducation].sort((a, b) => b.order - a.order || new Date(b.startDate) - new Date(a.startDate));
  }, [dbEducation]);

  const defaultColors = ['#eab308', '#3b82f6', '#10b981', '#8b5cf6'];
  const defaultIcons = ['🎓', '🏫', '📚', '🏅'];

  return (
    <section id="education" className="education-section">
      <div className="edu-bg-glow" aria-hidden="true" />
      
      <div className="container relative-z">
        
        <div ref={headerRef} className="edu-header reveal-up">
          <div className="edu-eyebrow">
            <span className="edu-eyebrow-line" />
            Academic Background
          </div>
          <h2 className="edu-title">Education</h2>
        </div>

        <div ref={timelineRef} className="edu-timeline reveal-up delay-100">
          
          <div className="edu-timeline-line" />

          {sortedEducation.map((edu, i) => {
            const dateStr = `${edu.startDate || ''} - ${edu.endDate || 'Present'}`;
            const color = defaultColors[i % defaultColors.length];
            const icon = defaultIcons[i % defaultIcons.length];

            return (
              <div 
                key={edu._id} 
                className="edu-item"
                style={{ '--edu-color': color, '--item-delay': `${i * 200}ms` }}
              >
                <div className="edu-dot">
                  <span className="edu-icon">{icon}</span>
                </div>

                <div className="edu-card">
                  <div className="edu-card-header">
                    <div>
                      <h3 className="edu-degree">{edu.degree}</h3>
                      <h4 className="edu-school">{edu.institution}</h4>
                    </div>
                    <span className="edu-date">{dateStr}</span>
                  </div>
                  <p className="edu-desc">{edu.description}</p>
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default Education;
