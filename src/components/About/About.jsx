import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/portfolioSlice';
import useScrollReveal from '../../hooks/useScrollReveal';
import './About.css';

const approachItems = [
  { icon: '🧹', label: 'Clean and maintainable code' },
  { icon: '📱', label: 'Responsive design'           },
  { icon: '♻️', label: 'Reusable components'          },
  { icon: '🔒', label: 'Secure APIs'                  },
  { icon: '🧠', label: 'Problem solving mindset'      },
  { icon: '📚', label: 'Continuous learning'          },
];

const stats = [
  { value: 'BSIT',  label: 'Al-Kawthar University' },
  { value: '3+',    label: 'MERN Projects'           },
  { value: '1+',    label: 'Year Learning & Building' },
  { value: 'Open',  label: 'To Opportunities'        },
];

const About = () => {
  const dispatch = useDispatch();
  const { data: profile, fetched } = useSelector((state) => state.portfolio.profile);

  const leftRef   = useScrollReveal();
  const centerRef = useScrollReveal();
  const rightRef  = useScrollReveal();

  useEffect(() => {
    if (!fetched) dispatch(fetchProfile());
  }, [dispatch, fetched]);

  const name    = profile?.name  || 'Saqib Ali Rind';
  const nameParts = name.trim().split(' ');
  const lastName  = nameParts.pop();
  const firstName = nameParts.join(' ');

  const bio = profile?.about ||
    'I am a dedicated MERN Stack Developer focused on building modern, full-stack web applications. I specialize in the React and Node.js ecosystem, crafting responsive interfaces, scalable REST APIs, and efficient business and management systems.';

  return (
    <section id="about" className="about-section">
      {/* Background glow */}
      <div className="about-bg-glow" aria-hidden="true" />

      <div className="container">
        <div className="about-grid">

          {/* ── LEFT: Text + Stats ── */}
          <div ref={leftRef} className="about-left reveal-up">
            <div className="about-eyebrow">
              <span className="about-eyebrow-line" />
              About Me
            </div>

            <h2 className="about-heading">
              Hi, I'm <span className="about-name-highlight">{firstName} {lastName}</span>
            </h2>

            <p className="about-bio">{bio}</p>

            {/* Stats row */}
            <div className="about-stats">
              {stats.map((s) => (
                <div className="about-stat" key={s.label}>
                  <span className="about-stat-value">{s.value}</span>
                  <span className="about-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Code card */}
            <div className="about-code-card">
              <div className="code-card-lines">
                <span>Building Modern</span>
                <span>Web Solutions</span>
              </div>
              <div className="code-card-icon">{'</>'}</div>
            </div>

          </div>

          {/* ── CENTER: Developer Photo ── */}
          <div ref={centerRef} className="about-photo-col reveal-up delay-100">
            <div className="about-photo-card">
              {/* Neon glow border ring */}
              <div className="photo-glow-ring" aria-hidden="true" />

              {/* Photo / placeholder */}
              <div className="about-photo-frame">
                <img 
                  src="https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=600&auto=format&fit=crop" 
                  alt="Developer" 
                  className="about-temp-image"
                />
              </div>

              {/* Floating text overlay */}
              <div className="photo-overlay-text" aria-hidden="true">
                <span>Better</span>
                <span>Code</span>
                <span>Bigger</span>
                <span>Dreams</span>
              </div>

              {/* Signature */}
              <div className="photo-signature" aria-hidden="true">
                Saqib Rind
              </div>
            </div>
          </div>

          {/* ── RIGHT: My Approach ── */}
          <div ref={rightRef} className="about-approach reveal-up delay-200">
            <h3 className="approach-title">My Approach</h3>
            <ul className="approach-list">
              {approachItems.map((item, i) => (
                <li key={i} className="approach-item">
                  <span className="approach-icon" aria-hidden="true">{item.icon}</span>
                  <span className="approach-label">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
