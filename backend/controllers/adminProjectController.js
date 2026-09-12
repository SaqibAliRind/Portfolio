import mongoose from 'mongoose';
import Project from '../models/Project.js';

const ALLOWED_STATUS = ['completed', 'in-progress', 'planned', 'archived', ''];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidUrl = (url) => {
  if (!url) return true;
  try { new URL(url); return true; } catch { return false; }
};

// Sanitize a string array: filter non-strings, trim, drop empty
const sanitizeStringArray = (arr, maxItems = 50, maxItemLen = 300) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= maxItemLen)
    .slice(0, maxItems);
};

// Validate slug: lowercase, alphanumeric + hyphens
const isValidSlug = (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

// ── GET ALL (admin — active + inactive) ─────────────────────────────────────
export const getAdminProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ order: 1, title: 1 });
    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE ───────────────────────────────────────────────────────────────
export const getAdminProjectById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid project ID.');
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404); throw new Error('Project not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

// ── Shared validation helper ─────────────────────────────────────────────────
const validateProjectPayload = (body, res) => {
  const {
    title, slug, shortDescription, fullDescription, category,
    image, screenshots, technologies, features, role, duration, status,
    liveDemo, github, featured, order, isActive,
    problem, solution, targetUsers, architecture, databaseDesign,
    apiDetails, challenges, solutions, futureImprovements,
  } = body;

  // Required
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    res.status(400); throw new Error('Title is required and must be at least 2 characters.');
  }
  if (title.trim().length > 150) {
    res.status(400); throw new Error('Title cannot exceed 150 characters.');
  }

  if (!slug || typeof slug !== 'string') {
    res.status(400); throw new Error('Slug is required.');
  }
  const normalizedSlug = slug.trim().toLowerCase();
  if (normalizedSlug.length < 3 || normalizedSlug.length > 180) {
    res.status(400); throw new Error('Slug must be between 3 and 180 characters.');
  }
  if (!isValidSlug(normalizedSlug)) {
    res.status(400); throw new Error('Slug must contain only lowercase letters, numbers, and hyphens (e.g. my-project).');
  }

  if (!shortDescription || typeof shortDescription !== 'string' || shortDescription.trim().length < 10) {
    res.status(400); throw new Error('Short description is required and must be at least 10 characters.');
  }
  if (shortDescription.trim().length > 500) {
    res.status(400); throw new Error('Short description cannot exceed 500 characters.');
  }

  // Optional text fields with limits
  if (fullDescription && String(fullDescription).trim().length > 10000) {
    res.status(400); throw new Error('Full description cannot exceed 10000 characters.');
  }
  if (category && String(category).trim().length > 100) {
    res.status(400); throw new Error('Category cannot exceed 100 characters.');
  }
  if (role && String(role).trim().length > 150) {
    res.status(400); throw new Error('Role cannot exceed 150 characters.');
  }
  if (duration && String(duration).trim().length > 100) {
    res.status(400); throw new Error('Duration cannot exceed 100 characters.');
  }

  // Status enum
  if (status !== undefined && !ALLOWED_STATUS.includes(String(status).trim())) {
    res.status(400); throw new Error(`Invalid status. Allowed: completed, in-progress, planned, archived.`);
  }

  // URLs
  if (image && !isValidUrl(image)) { res.status(400); throw new Error('Invalid image URL.'); }
  if (liveDemo && !isValidUrl(liveDemo)) { res.status(400); throw new Error('Invalid liveDemo URL.'); }
  if (github && !isValidUrl(github)) { res.status(400); throw new Error('Invalid GitHub URL.'); }

  // Screenshots — array of URLs
  const cleanScreenshots = sanitizeStringArray(screenshots || [], 20, 500);
  for (const s of cleanScreenshots) {
    if (s && !isValidUrl(s)) {
      res.status(400); throw new Error(`Invalid screenshot URL: ${s}`);
    }
  }

  // Arrays
  const cleanTech = sanitizeStringArray(technologies || [], 50, 100);
  const cleanFeatures = sanitizeStringArray(features || [], 50, 300);
  const cleanTargetUsers = sanitizeStringArray(targetUsers || [], 20, 200);
  const cleanApiDetails = sanitizeStringArray(apiDetails || [], 30, 300);
  const cleanChallenges = sanitizeStringArray(challenges || [], 30, 500);
  const cleanSolutions = sanitizeStringArray(solutions || [], 30, 500);
  const cleanFuture = sanitizeStringArray(futureImprovements || [], 30, 300);

  // Numeric order
  let parsedOrder = 0;
  if (order !== undefined && order !== null && order !== '') {
    parsedOrder = Number(order);
    if (isNaN(parsedOrder) || parsedOrder < 0) {
      res.status(400); throw new Error('Order must be a non-negative number.');
    }
  }

  // Strict booleans
  if (featured !== undefined && typeof featured !== 'boolean') {
    res.status(400); throw new Error('featured must be a strict boolean.');
  }
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    res.status(400); throw new Error('isActive must be a strict boolean.');
  }

  return {
    title: title.trim(),
    slug: normalizedSlug,
    shortDescription: shortDescription.trim(),
    fullDescription: fullDescription ? String(fullDescription).trim() : '',
    category: category ? String(category).trim() : '',
    image: image ? String(image).trim() : '',
    screenshots: cleanScreenshots,
    technologies: cleanTech,
    features: cleanFeatures,
    role: role ? String(role).trim() : '',
    duration: duration ? String(duration).trim() : '',
    status: status ? String(status).trim() : '',
    liveDemo: liveDemo ? String(liveDemo).trim() : '',
    github: github ? String(github).trim() : '',
    problem: problem ? String(problem).trim() : '',
    solution: solution ? String(solution).trim() : '',
    targetUsers: cleanTargetUsers,
    architecture: architecture ? String(architecture).trim() : '',
    databaseDesign: databaseDesign ? String(databaseDesign).trim() : '',
    apiDetails: cleanApiDetails,
    challenges: cleanChallenges,
    solutions: cleanSolutions,
    futureImprovements: cleanFuture,
    order: parsedOrder,
    featured: typeof featured === 'boolean' ? featured : false,
    isActive: typeof isActive === 'boolean' ? isActive : true,
  };
};

// ── CREATE ───────────────────────────────────────────────────────────────────
export const createProject = async (req, res, next) => {
  try {
    const fields = validateProjectPayload(req.body, res);

    // Duplicate slug check
    const exists = await Project.findOne({ slug: fields.slug });
    if (exists) {
      res.status(409); throw new Error('Project slug already exists.');
    }

    const project = new Project(fields);
    const saved = await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: saved },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error('Project slug already exists.'));
    }
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
export const updateProject = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid project ID.');
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404); throw new Error('Project not found.');
    }

    const fields = validateProjectPayload(req.body, res);

    // Duplicate slug check (exclude self)
    const duplicate = await Project.findOne({ slug: fields.slug, _id: { $ne: req.params.id } });
    if (duplicate) {
      res.status(409); throw new Error('Project slug already exists.');
    }

    // Explicit field assignment — no mass assignment
    Object.assign(project, fields);
    const saved = await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project: saved },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error('Project slug already exists.'));
    }
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const deleteProject = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid project ID.');
    }
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404); throw new Error('Project not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ── STATUS ───────────────────────────────────────────────────────────────────
export const updateProjectStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid project ID.');
    }
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      res.status(400); throw new Error('isActive must be a strict boolean.');
    }
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found.'); }

    project.isActive = isActive;
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

// ── FEATURED ─────────────────────────────────────────────────────────────────
export const updateProjectFeatured = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid project ID.');
    }
    const { featured } = req.body;
    if (typeof featured !== 'boolean') {
      res.status(400); throw new Error('featured must be a strict boolean.');
    }
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found.'); }

    project.featured = featured;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project featured status updated',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};
