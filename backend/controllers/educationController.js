import Education from '../models/Education.js';

export const getEducation = async (req, res, next) => {
  try {
    const education = await Education.find({ isActive: true }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Education fetched successfully',
      data: education,
    });
  } catch (error) {
    next(error);
  }
};
