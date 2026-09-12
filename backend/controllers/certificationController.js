import Certification from '../models/Certification.js';

export const getCertifications = async (req, res, next) => {
  try {
    const certifications = await Certification.find({ isActive: true }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Certifications fetched successfully',
      data: certifications,
    });
  } catch (error) {
    next(error);
  }
};
