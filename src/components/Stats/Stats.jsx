import React from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Stats.css';

const DUMMY_HIGHLIGHTS = [
  {
    id: 1,
    title: 'MERN Stack Specialist',
    value: '100%',
    desc: 'Expertise in MongoDB, Express, React, Node.js',
    icon: '⚡',
    color: '#f97316'
  },
  {
    id: 2,
    title: 'International Ready',
    value: 'Remote',
    desc: 'Available for global timezone collaborations',
    icon: '🌍',
    color: '#06b6d4'
  },
  {
    id: 3,
    title: 'Problem Solver',
    value: 'Pro',
    desc: 'Analytical approach to complex systems',
    icon: '🧠',
    color: '#8b5cf6'
  },
  {
    id: 4,
    title: 'Code Quality',
    value: 'A+',
    desc: 'Clean, modular, and maintainable architecture',
    icon: '✨',
    color: '#10b981'
  }
];

const Stats = () => {
  const headerRef = useScrollReveal();
  const gridRef = useScrollReveal();

  return (
    <section className="stats-section">
      {/* Background ambient glow */}
      <div className="stats-bg-glow" aria-hidden="true" />
      
      <div className="container relative-z">
        
        <div ref={headerRef} className="stats-header reveal-up">
          <div className="stats-eyebrow">
            <span className="stats-eyebrow-line" />
            Key Strengths
          </div>
          <h2 className="stats-title">Development Highlights</h2>
        </div>

        <div ref={gridRef} className="stats-grid reveal-up delay-100">
          {DUMMY_HIGHLIGHTS.map((stat, i) => (
            <div 
              key={stat.id} 
              className="stat-card"
              style={{ '--stat-color': stat.color, '--card-delay': `${i * 100}ms` }}
            >
              <div className="stat-icon-wrapper">
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-icon-glow" />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-info">
                <h3 className="stat-name">{stat.title}</h3>
                <p className="stat-desc">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Stats;
