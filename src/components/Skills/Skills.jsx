import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../store/slices/portfolioSlice';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Skills.css';

const Skills = () => {
  const dispatch = useDispatch();
  const { data: dbSkills, fetched } = useSelector((state) => state.portfolio.skills);
  
  const leftRef = useScrollReveal();
  const rightRef = useScrollReveal();

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchSkills());
    }
  }, [dispatch, fetched]);

  // Separate skills into tech grid (regular skills) and progress bars (featured/other)
  const { techGrid, progressBars } = useMemo(() => {
    const grid = [];
    const bars = [];
    
    if (dbSkills && dbSkills.length > 0) {
      dbSkills.forEach(skill => {
        if (skill.percentage) {
          bars.push(skill);
        } else {
          grid.push(skill);
        }
      });
    }
    
    return { 
      techGrid: grid.sort((a, b) => a.order - b.order), 
      progressBars: bars.sort((a, b) => a.order - b.order) 
    };
  }, [dbSkills]);

  return (
    <section id="skills" className="skills-section">
      {/* Background Decorative Elements */}
      <div className="skills-bg-glow top-right" aria-hidden="true" />
      <div className="skills-bg-glow bottom-left" aria-hidden="true" />
      <div className="skills-bg-cracks" aria-hidden="true" />

      <div className="container">
        <div className="skills-grid-layout">
          
          {/* ── LEFT COLUMN: Text & Grid ── */}
          <div ref={leftRef} className="skills-left reveal-up">
            <div className="skills-eyebrow">
              <span className="skills-eyebrow-line" />
              My Skills
            </div>

            <h2 className="skills-heading">Technologies I Work With</h2>
            <p className="skills-description">
              I work with modern technologies to build scalable and efficient web applications.
            </p>

            <div className="tech-cards-grid">
              {techGrid.map((tech) => (
                <div 
                  key={tech._id || tech.name} 
                  className="tech-card"
                  style={{ '--tech-color': tech.color || '#f97316' }}
                >
                  <div className="tech-card-icon-wrapper">
                    <span className="tech-card-icon">{tech.icon}</span>
                  </div>
                  <span className="tech-card-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Progress Bars ── */}
          <div ref={rightRef} className="skills-right reveal-up delay-100">
            <div className="progress-panel">
              <div className="progress-list">
                {progressBars.map((skill) => (
                  <div key={skill._id || skill.name} className="progress-item">
                    {/* Icon */}
                    <div 
                      className="progress-icon-box"
                      style={{ '--icon-color': skill.color || '#f97316' }}
                    >
                      <span className="progress-icon">{skill.icon}</span>
                    </div>

                    {/* Progress Info & Bar */}
                    <div className="progress-content">
                      <div className="progress-header">
                        <span className="progress-name">{skill.name}</span>
                        <span className="progress-percentage">{skill.percentage}%</span>
                      </div>
                      <div className="progress-track">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${skill.percentage}%` }}
                        >
                          <div className="progress-glow-tip" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Skills;
