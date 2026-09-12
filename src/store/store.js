import { configureStore } from '@reduxjs/toolkit';

import portfolioReducer from './slices/portfolioSlice';
import authReducer from './slices/authSlice';

/**
 * Redux Store — Foundation
 *
 * Slices:
 *  - theme         (dark/light mode, accent colour)
 *  - projects      (public project data)
 *  - auth          (JWT authentication for admin)
 *  - profile       (developer profile data)
 *  - skills        (skills & technologies)
 *  - experience    (work experience)
 *  - education     (education history)
 *  - certifications
 *  - services      (offered services)
 *  - messages      (contact form messages)
 *  - admin         (admin panel state)
 */
const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    auth: authReducer,
    // Slices will be registered here in future tasks
  },
});

export default store;
