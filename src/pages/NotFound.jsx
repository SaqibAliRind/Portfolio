import { Link } from 'react-router-dom';
import './NotFound.css';

/**
 * NotFound Page — 404
 *
 * Rendered when no route matches the current URL.
 */
function NotFound() {
  return (
    <section className="not-found-section">
      <div className="not-found-bg-glow" aria-hidden="true" />
      <div className="container relative-z">
        <div className="not-found-content">
          <div className="not-found-code">404</div>
          <h1 className="not-found-title">Page Not Found</h1>
          <p className="not-found-desc">
            Oops! The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-hero-primary not-found-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Return to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
