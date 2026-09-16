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

  const bio = profile?.longBio || profile?.shortBio || profile?.about ||
    'I am a dedicated MERN Stack Developer focused on building modern, full-stack web applications. I specialize in the React and Node.js ecosystem, crafting responsive interfaces, scalable REST APIs, and efficient business and management systems.';

  const profileImage = profile?.profileImage || null;
  const githubUrl    = profile?.githubUrl    || '#';
  const linkedinUrl  = profile?.linkedinUrl  || '#';

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

              {/* Profile Photo */}
              <div className="about-photo-frame">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={name}
                    className="about-temp-image"
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=600&auto=format&fit=crop"
                    alt="Developer"
                    className="about-temp-image"
                  />
                )}
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

            {/* Social links under photo */}
            <div className="about-photo-socials">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="about-social-btn" title="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="about-social-btn" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 24 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
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
