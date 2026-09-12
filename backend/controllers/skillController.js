import Skill from '../models/Skill.js';

export const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ isActive: true }).sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      message: 'Skills fetched successfully',
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};
