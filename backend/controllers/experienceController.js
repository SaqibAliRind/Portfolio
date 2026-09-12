import Experience from '../models/Experience.js';

export const getExperience = async (req, res, next) => {
  try {
    const experience = await Experience.find({ isActive: true }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Experience fetched successfully',
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};
