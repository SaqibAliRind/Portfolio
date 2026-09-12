import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExperience } from '../../store/slices/portfolioSlice';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Experience.css';

const Experience = () => {
  const dispatch = useDispatch();
  const { data: dbExperience, fetched } = useSelector((state) => state.portfolio.experience);

  const headerRef = useScrollReveal();
  const timelineRef = useScrollReveal();

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchExperience());
    }
  }, [dispatch, fetched]);

  const sortedExperience = useMemo(() => {
    if (!dbExperience) return [];
    return [...dbExperience].sort((a, b) => b.order - a.order || new Date(b.startDate) - new Date(a.startDate));
  }, [dbExperience]);

  // Fallback colors/icons since they are not in the db schema by default
  const defaultColors = ['#06b6d4', '#f97316', '#8b5cf6', '#10b981', '#ec4899'];
  const defaultIcons = ['💻', '✨', '🚀', '🌟', '💼'];

  return (
    <section id="experience" className="experience-section">
      {/* Background ambient glow */}
      <div className="exp-bg-glow" aria-hidden="true" />
      
      <div className="container relative-z">
        
        <div ref={headerRef} className="exp-header reveal-up">
          <div className="exp-eyebrow">
            <span className="exp-eyebrow-line" />
            My Journey
          </div>
          <h2 className="exp-title">Professional Experience</h2>
        </div>

        <div ref={timelineRef} className="exp-timeline reveal-up delay-100">
          
          {/* The glowing center line */}
          <div className="timeline-center-line" />

          {sortedExperience.map((exp, i) => {
            const isLeft = i % 2 === 0;
            const dateStr = exp.current ? `${exp.startDate || ''} - Present` : `${exp.startDate || ''} - ${exp.endDate || ''}`;
            const color = defaultColors[i % defaultColors.length];
            const icon = defaultIcons[i % defaultIcons.length];
            
            return (
              <div 
                key={exp._id} 
                className={`timeline-item ${isLeft ? 'left' : 'right'}`}
                style={{ '--exp-color': color, '--item-delay': `${i * 200}ms` }}
              >
                {/* Glowing Dot on the line */}
                <div className="timeline-dot">
                  <span className="timeline-icon">{icon}</span>
                </div>

                {/* Content Card */}
                <div className="timeline-card">
                  <span className="exp-date">{dateStr}</span>
                  <h3 className="exp-role">{exp.position}</h3>
                  <h4 className="exp-company">{exp.company}</h4>
                  <p className="exp-desc">{exp.description}</p>
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default Experience;
