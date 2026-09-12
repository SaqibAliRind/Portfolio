import api from './api';

export const portfolioApi = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  
  getSkills: async () => {
    const response = await api.get('/skills');
    return response.data;
  },
  
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  
  getProjectBySlug: async (slug) => {
    const response = await api.get(`/projects/${slug}`);
    return response.data;
  },
  
  getExperience: async () => {
    const response = await api.get('/experience');
    return response.data;
  },
  
  getEducation: async () => {
    const response = await api.get('/education');
    return response.data;
  },
  
  getCertifications: async () => {
    const response = await api.get('/certifications');
    return response.data;
  },
  
  getServices: async (params = {}) => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  createMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  }
};
