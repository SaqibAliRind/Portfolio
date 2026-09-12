import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../store/slices/portfolioSlice';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Projects.css';

const Projects = () => {
  const dispatch = useDispatch();
  const { data: dbProjects, fetched } = useSelector((state) => state.portfolio.projects);

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const headerRef = useScrollReveal();
  const filtersRef = useScrollReveal();
  const gridRef = useScrollReveal();

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchProjects());
    }
  }, [dispatch, fetched]);

  // Extract unique categories from dbProjects for filters
  const FILTERS = useMemo(() => {
    const categories = ['All'];
    if (dbProjects && dbProjects.length > 0) {
      dbProjects.forEach(p => {
        if (p.category && !categories.includes(p.category)) {
          categories.push(p.category);
        }
      });
    }
    return categories;
  }, [dbProjects]);

  const filteredProjects = useMemo(() => {
    if (!dbProjects) return [];
    return dbProjects.filter(project => {
      const matchesFilter = activeFilter === 'All' || project.category === activeFilter;
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    }).sort((a, b) => a.order - b.order);
  }, [dbProjects, activeFilter, searchQuery]);

  return (
    <section id="projects" className="projects-section">
      
      {/* ── Cinematic Background Effect (The Mountain/Crack) ── */}
      <div className="projects-bg-cinematic" aria-hidden="true">
        <div className="cinematic-mountain" />
        <div className="cinematic-flare left" />
        <div className="cinematic-flare right" />
        <div className="cinematic-particles" />
      </div>

      <div className="container relative-z">
        
        {/* ── HEADER & SEARCH ── */}
        <div className="projects-header-wrapper">
          <div ref={headerRef} className="projects-header-content reveal-up">
            <div className="projects-eyebrow">
              <span className="projects-eyebrow-line" />
              My Projects
            </div>
            <h2 className="projects-heading">Featured Projects</h2>
            <p className="projects-description">
              Some of my recent work. Each project is built with modern technologies 
              and focused on real-world solutions.
            </p>
          </div>

          <div className="projects-search-wrapper reveal-up delay-100">
            <div className="search-input-box">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* ── FILTER PILLS ── */}
        <div ref={filtersRef} className="projects-filters reveal-up delay-100">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ── PROJECTS GRID ── */}
        <div ref={gridRef} className="projects-grid reveal-up delay-200">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <div key={project._id || project.slug} className="project-card" style={{ '--card-delay': `${index * 100}ms` }}>
                
                {/* Project Image */}
                <div className="project-image-frame">
                  <div className="project-image-inner">
                    <img src={project.image} alt={project.title} loading="lazy" />
                  </div>
                </div>

                {/* Project Info */}
                <div className="project-info">
                  <h3 className="project-title">{project.title}</h3>
                  
                  {/* Tech Stack Tags */}
                  <div className="project-tech-stack">
                    {project.technologies && project.technologies.slice(0, 4).map((tech) => {
                      const name = typeof tech === 'object' ? tech.name : tech;
                      const color = typeof tech === 'object' ? tech.color : '#61dafb';
                      const icon = typeof tech === 'object' ? tech.icon : '';
                      return (
                        <span key={name} className="tech-tag" style={{ '--tag-color': color }}>
                          {icon && <span className="tech-tag-icon">{icon}</span>}
                          {name}
                        </span>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="project-actions">
                    <a href={project.liveDemo || '#'} className="btn-project btn-live">
                      Live Demo 
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </a>
                    <a href={project.github || '#'} className="btn-project btn-code">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                      View Code
                    </a>
                    <Link to={`/projects/${project.slug || project._id}`} className="btn-project btn-details">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Project Details
                    </Link>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="no-projects">No projects found for this criteria.</div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Projects;
