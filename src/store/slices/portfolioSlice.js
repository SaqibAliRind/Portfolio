import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { portfolioApi } from '../../services/portfolioApi';

// Initial state for all portfolio sections
const createSectionState = () => ({
  data: null,
  loading: false,
  error: null,
  fetched: false, // Prevents re-fetching if data is already loaded
});

const initialState = {
  profile: createSectionState(),
  skills: { ...createSectionState(), data: [] },
  projects: { ...createSectionState(), data: [] },
  projectDetails: {}, // Cache for individual projects: { [slug]: { data, loading, error } }
  experience: { ...createSectionState(), data: [] },
  education: { ...createSectionState(), data: [] },
  certifications: { ...createSectionState(), data: [] },
  services: { ...createSectionState(), data: [] },
};

// --- Async Thunks ---

export const fetchProfile = createAsyncThunk(
  'portfolio/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load profile.');
    }
  }
);

export const fetchSkills = createAsyncThunk(
  'portfolio/fetchSkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getSkills();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load skills.');
    }
  }
);

export const fetchProjects = createAsyncThunk(
  'portfolio/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getProjects(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load projects.');
    }
  }
);

export const fetchProjectBySlug = createAsyncThunk(
  'portfolio/fetchProjectBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getProjectBySlug(slug);
      return { slug, data: response.data };
    } catch (error) {
       // Check if it's a 404 vs a server error
       const is404 = error.response?.status === 404;
       return rejectWithValue({
         slug,
         message: error.response?.data?.message || 'Failed to load project details.',
         is404
       });
    }
  }
);

export const fetchExperience = createAsyncThunk(
  'portfolio/fetchExperience',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getExperience();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load experience.');
    }
  }
);

export const fetchEducation = createAsyncThunk(
  'portfolio/fetchEducation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getEducation();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load education.');
    }
  }
);

export const fetchCertifications = createAsyncThunk(
  'portfolio/fetchCertifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getCertifications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load certifications.');
    }
  }
);

export const fetchServices = createAsyncThunk(
  'portfolio/fetchServices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getServices(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load services.');
    }
  }
);


// --- Slice ---
const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // A helper to handle standard pending/fulfilled/rejected states for collection endpoints
    const handleAsyncState = (builder, thunk, stateKey) => {
      builder
        .addCase(thunk.pending, (state) => {
          state[stateKey].loading = true;
          state[stateKey].error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state[stateKey].loading = false;
          state[stateKey].data = action.payload;
          state[stateKey].fetched = true;
          state[stateKey].error = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state[stateKey].loading = false;
          state[stateKey].error = action.payload;
        });
    };

    handleAsyncState(builder, fetchProfile, 'profile');
    handleAsyncState(builder, fetchSkills, 'skills');
    handleAsyncState(builder, fetchProjects, 'projects');
    handleAsyncState(builder, fetchExperience, 'experience');
    handleAsyncState(builder, fetchEducation, 'education');
    handleAsyncState(builder, fetchCertifications, 'certifications');
    handleAsyncState(builder, fetchServices, 'services');

    // Handle single project fetching separately to support caching by slug
    builder
      .addCase(fetchProjectBySlug.pending, (state, action) => {
        const slug = action.meta.arg;
        state.projectDetails[slug] = {
          ...state.projectDetails[slug],
          loading: true,
          error: null,
          is404: false
        };
      })
      .addCase(fetchProjectBySlug.fulfilled, (state, action) => {
        const { slug, data } = action.payload;
        state.projectDetails[slug] = {
          data,
          loading: false,
          error: null,
          is404: false
        };
      })
      .addCase(fetchProjectBySlug.rejected, (state, action) => {
        const { slug, message, is404 } = action.payload;
        state.projectDetails[slug] = {
          data: null,
          loading: false,
          error: message,
          is404
        };
      });
  },
});

export default portfolioSlice.reducer;
