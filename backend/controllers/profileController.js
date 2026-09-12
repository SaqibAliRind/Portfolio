import Profile from '../models/Profile.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ isActive: true });

    if (!profile) {
      return res.status(200).json({
        success: true,
        message: 'No profile found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
