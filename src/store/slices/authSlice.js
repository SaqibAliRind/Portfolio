import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';
import { getAdminToken, setAdminToken, removeAdminToken } from '../../utils/authStorage';

// Thunks
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.loginAdmin(credentials);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const data = await authApi.verifyOTP(otpData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Invalid OTP. Please try again.'
      );
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const data = await authApi.resendOTP(email);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to resend OTP.'
      );
    }
  }
);

export const fetchCurrentAdmin = createAsyncThunk(
  'auth/fetchCurrentAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getCurrentAdmin();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to authenticate.'
      );
    }
  }
);

const initialState = {
  admin: null,
  token: getAdminToken(),
  isAuthenticated: false,
  loading: false,
  initialized: false,
  error: null,
  
  // 2FA OTP specific state
  otpSent: false,
  otpEmail: null,
  otpMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      removeAdminToken();
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpSent = false;
      state.otpEmail = null;
      state.otpMessage = null;
    },
    clearAuthError: (state) => {
      state.error = null;
      state.otpMessage = null;
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpEmail = null;
      state.otpMessage = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loginAdmin (Step 1)
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpMessage = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        // Step 1 doesn't authenticate, it only sets up OTP
        state.otpSent = true;
        state.otpEmail = action.payload.data.email;
        state.otpMessage = action.payload.message;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // verifyOTP (Step 2)
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpMessage = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.data.admin;
        state.token = action.payload.data.token;
        setAdminToken(action.payload.data.token);
        
        // Clean up OTP state
        state.otpSent = false;
        state.otpEmail = null;
        state.otpMessage = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // resendOTP
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpMessage = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.otpMessage = action.payload.message;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchCurrentAdmin
      .addCase(fetchCurrentAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.data.admin;
        state.initialized = true;
      })
      .addCase(fetchCurrentAdmin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.token = null;
        removeAdminToken();
        state.error = null; // Do not surface background auth check errors to UI
        state.initialized = true;
        
        state.otpSent = false;
        state.otpEmail = null;
      });
  },
});

export const { logoutAdmin, clearAuthError, setInitialized, resetOtpState } = authSlice.actions;

export default authSlice.reducer;
