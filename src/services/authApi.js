import api from './api';

/**
 * Auth & Admin API functions.
 * Uses the existing Axios instance from api.js.
 */
export const authApi = {
  // --- AUTHENTICATION ---
  loginAdmin: async (credentials) => {
    const response = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  verifyOTP: async (data) => {
    const response = await api.post('/auth/verify-otp', {
      email: data.email,
      otp: data.otp,
    });
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  getCurrentAdmin: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // --- ADMIN PROFILE CRUD ---
  getAdminProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data;
  },

  createAdminProfile: async (profileData) => {
    const response = await api.post('/admin/profile', profileData);
    return response.data;
  },

  updateAdminProfile: async (profileData) => {
    const response = await api.put('/admin/profile', profileData);
    return response.data;
  },

  updateAdminProfileStatus: async (isActive) => {
    const response = await api.patch('/admin/profile/status', { isActive });
    return response.data;
  },

  // --- ADMIN SKILLS CRUD ---
  getAdminSkills: async () => {
    const response = await api.get('/admin/skills');
    return response.data;
  },

  getAdminSkillById: async (id) => {
    const response = await api.get(`/admin/skills/${id}`);
    return response.data;
  },

  createSkill: async (data) => {
    const response = await api.post('/admin/skills', data);
    return response.data;
  },

  updateSkill: async (id, data) => {
    const response = await api.put(`/admin/skills/${id}`, data);
    return response.data;
  },

  deleteSkill: async (id) => {
    const response = await api.delete(`/admin/skills/${id}`);
    return response.data;
  },

  updateSkillStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/skills/${id}/status`, { isActive });
    return response.data;
  },

  updateSkillFeatured: async (id, featured) => {
    const response = await api.patch(`/admin/skills/${id}/featured`, { featured });
    return response.data;
  },

  // --- ADMIN PROJECTS CRUD ---
  getAdminProjects: async () => {
    const response = await api.get('/admin/projects');
    return response.data;
  },

  getAdminProjectById: async (id) => {
    const response = await api.get(`/admin/projects/${id}`);
    return response.data;
  },

  createProject: async (data) => {
    const response = await api.post('/admin/projects', data);
    return response.data;
  },

  updateProject: async (id, data) => {
    const response = await api.put(`/admin/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/admin/projects/${id}`);
    return response.data;
  },

  updateProjectStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/projects/${id}/status`, { isActive });
    return response.data;
  },

  updateProjectFeatured: async (id, featured) => {
    const response = await api.patch(`/admin/projects/${id}/featured`, { featured });
    return response.data;
  },

  // --- ADMIN EXPERIENCE CRUD ---
  getAdminExperience: async () => {
    const response = await api.get('/admin/experience');
    return response.data;
  },

  getAdminExperienceById: async (id) => {
    const response = await api.get(`/admin/experience/${id}`);
    return response.data;
  },

  createExperience: async (data) => {
    const response = await api.post('/admin/experience', data);
    return response.data;
  },

  updateExperience: async (id, data) => {
    const response = await api.put(`/admin/experience/${id}`, data);
    return response.data;
  },

  deleteExperience: async (id) => {
    const response = await api.delete(`/admin/experience/${id}`);
    return response.data;
  },

  updateExperienceStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/experience/${id}/status`, { isActive });
    return response.data;
  },

  // --- ADMIN EDUCATION CRUD ---
  getAdminEducation: async () => {
    const response = await api.get('/admin/education');
    return response.data;
  },

  getAdminEducationById: async (id) => {
    const response = await api.get(`/admin/education/${id}`);
    return response.data;
  },

  createEducation: async (data) => {
    const response = await api.post('/admin/education', data);
    return response.data;
  },

  updateEducation: async (id, data) => {
    const response = await api.put(`/admin/education/${id}`, data);
    return response.data;
  },

  deleteEducation: async (id) => {
    const response = await api.delete(`/admin/education/${id}`);
    return response.data;
  },

  updateEducationStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/education/${id}/status`, { isActive });
    return response.data;
  },

  // --- ADMIN CERTIFICATIONS CRUD ---
  getAdminCertifications: async () => {
    const response = await api.get('/admin/certifications');
    return response.data;
  },

  getAdminCertificationById: async (id) => {
    const response = await api.get(`/admin/certifications/${id}`);
    return response.data;
  },

  createCertification: async (data) => {
    const response = await api.post('/admin/certifications', data);
    return response.data;
  },

  updateCertification: async (id, data) => {
    const response = await api.put(`/admin/certifications/${id}`, data);
    return response.data;
  },

  deleteCertification: async (id) => {
    const response = await api.delete(`/admin/certifications/${id}`);
    return response.data;
  },

  updateCertificationStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/certifications/${id}/status`, { isActive });
    return response.data;
  },

  // --- ADMIN SERVICES CRUD ---
  getAdminServices: async () => {
    const response = await api.get('/admin/services');
    return response.data;
  },

  getAdminServiceById: async (id) => {
    const response = await api.get(`/admin/services/${id}`);
    return response.data;
  },

  createService: async (data) => {
    const response = await api.post('/admin/services', data);
    return response.data;
  },

  updateService: async (id, data) => {
    const response = await api.put(`/admin/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/admin/services/${id}`);
    return response.data;
  },

  updateServiceStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/services/${id}/status`, { isActive });
    return response.data;
  },
  
  updateServiceFeatured: async (id, featured) => {
    const response = await api.patch(`/admin/services/${id}/featured`, { featured });
    return response.data;
  },
  
  updateServiceAvailability: async (id, available) => {
    const response = await api.patch(`/admin/services/${id}/availability`, { available });
    return response.data;
  },

  // --- ADMIN MESSAGES ---
  getAdminMessages: async (params = {}) => {
    const response = await api.get('/admin/messages', { params });
    return response.data;
  },

  getAdminMessageById: async (id) => {
    const response = await api.get(`/admin/messages/${id}`);
    return response.data;
  },

  updateMessageStatus: async (id, status) => {
    const response = await api.patch(`/admin/messages/${id}/status`, { status });
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/admin/messages/${id}`);
    return response.data;
  },

  getUnreadMessageCount: async () => {
    const response = await api.get('/admin/messages/unread-count');
    return response.data;
  },

  // --- ADMIN SETTINGS ---
  getAdminSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  saveAdminSettings: async (data) => {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  // --- ADMIN DASHBOARD ---
  getAdminDashboardOverview: async () => {
    const response = await api.get('/admin/dashboard/overview');
    return response.data;
  }
};
