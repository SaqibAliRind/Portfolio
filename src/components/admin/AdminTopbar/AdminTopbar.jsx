import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { logoutAdmin } from '../../../store/slices/authSlice';
import './AdminTopbar.css';

const AdminTopbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { admin } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutAdmin());
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Helper to extract a page title from the route path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return 'Dashboard';
    
    // Capitalize the last segment for placeholder routes
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];
    if (lastSegment) {
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
    
    return 'Admin Panel';
  };

  // Generate initials for the avatar
  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button 
          className="admin-hamburger" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          aria-expanded="false"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="admin-page-title">{getPageTitle()}</h1>
      </div>

      <div className="admin-topbar-right">
        <div className="admin-user-menu-container" ref={menuRef}>
          <button 
            className="admin-user-btn" 
            onClick={toggleMenu}
            aria-label="User Menu"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="admin-avatar">
              {getInitials(admin?.name)}
            </div>
          </button>

          {menuOpen && (
            <div className="admin-dropdown-menu">
              <div className="admin-dropdown-header">
                <p className="admin-dropdown-name">{admin?.name}</p>
                <p className="admin-dropdown-email">{admin?.email}</p>
                <span className="admin-badge">{admin?.role}</span>
              </div>
              <ul className="admin-dropdown-list">
                <li>
                  <button className="admin-dropdown-item admin-logout-btn" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-dropdown-icon">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
