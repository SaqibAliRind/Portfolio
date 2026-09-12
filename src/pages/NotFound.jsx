import { Link } from 'react-router-dom';
import './NotFound.css';

/**
 * NotFound Page — 404
 *
 * Rendered when no route matches the current URL.
 */
function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found__card">
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__body">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="not-found__link">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
