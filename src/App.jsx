import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Analytics } from '@vercel/analytics/react';

import { fetchCurrentAdmin, setInitialized } from './store/slices/authSlice';
import { getAdminToken } from './utils/authStorage';

import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import ProjectDetails from './pages/ProjectDetails';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout/AdminLayout';

import AdminProfile from './pages/admin/AdminProfile';
import AdminSkills from './pages/admin/AdminSkills';
import AdminProjects from './pages/admin/AdminProjects';
import AdminExperience from './pages/admin/AdminExperience';
import AdminEducation from './pages/admin/AdminEducation';
import AdminCertifications from './pages/admin/AdminCertifications';
import AdminServices from './pages/admin/AdminServices';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';

/**
 * App — Root component
 *
 * Handles top-level routing and global authentication initialization.
 *
 * Routes:
 *  /                    → Home
 *  /projects/:slug      → ProjectDetails
 *  /admin/login         → AdminLogin (public)
 *  /admin/dashboard     → AdminDashboard (protected)
 *  /admin/profile       → AdminProfile (protected)
 *  *                    → NotFound (404)
 */
function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);
  const { data: profile } = useSelector((state) => state.portfolio.profile);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAdminToken();
      if (token) {
        // Token exists in storage, verify it against the backend
        await dispatch(fetchCurrentAdmin());
      } else {
        // No token, finish initialization immediately
        dispatch(setInitialized(true));
      }
    };

    if (!initialized) {
      initAuth();
    }
  }, [dispatch, initialized]);

  // Dynamically update page title based on backend profile data
  useEffect(() => {
    if (profile && profile.name) {
      document.title = `${profile.name} | Portfolio`;
    }
  }, [profile]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Portfolio Routes - Wrapped with Navbar */}
        <Route path="/" element={<><Navbar /><main><Home /></main></>} />
        <Route path="/projects/:slug" element={<><Navbar /><main><ProjectDetails /></main></>} />
        
        {/* Admin Login - No Navbar */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes - Uses AdminLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Real routes */}
            <Route path="/admin/profile" element={<AdminProfile />} />
            
            {/* Future placeholders */}
            <Route path="/admin/skills" element={<AdminSkills />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/experience" element={<AdminExperience />} />
            <Route path="/admin/education" element={<AdminEducation />} />
            <Route path="/admin/certifications" element={<AdminCertifications />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<><Navbar /><main><NotFound /></main></>} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
