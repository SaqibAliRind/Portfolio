import Project from '../models/Project.js';

export const getProjects = async (req, res, next) => {
  try {
    const query = { isActive: true };

    // Optional filter: ?featured=true
    if (req.query.featured === 'true') {
      query.featured = true;
    }

    // Optional filter: ?category=Full-Stack
    if (req.query.category && typeof req.query.category === 'string') {
      query.category = req.query.category.trim();
    }

    const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Projects fetched successfully',
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project fetched successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
