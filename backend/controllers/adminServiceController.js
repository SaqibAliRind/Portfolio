import mongoose from 'mongoose';
import Service from '../models/Service.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Sanitize string arrays: filter non-strings, trim, drop empty
const sanitizeStringArray = (arr, maxItems = 50, maxItemLen = 500) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= maxItemLen)
    .slice(0, maxItems);
};

// ── GET ALL (admin — active + inactive) ─────────────────────────────────────
export const getAdminServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Services retrieved successfully',
      data: { services },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE ───────────────────────────────────────────────────────────────
export const getAdminServiceById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid service ID.');
    }
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404); throw new Error('Service not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Service retrieved successfully',
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

// ── Shared validation helper ─────────────────────────────────────────────────
const validateServicePayload = (body, res) => {
  const {
    title, shortDescription, description, technologies, features,
    icon, category, available, featured, order, isActive
  } = body;

  // Required fields
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    res.status(400); throw new Error('Title is required and must be at least 2 characters.');
  }
  if (title.trim().length > 150) {
    res.status(400); throw new Error('Title cannot exceed 150 characters.');
  }

  if (!shortDescription || typeof shortDescription !== 'string' || shortDescription.trim().length < 2) {
    res.status(400); throw new Error('Short description is required and must be at least 2 characters.');
  }
  if (shortDescription.trim().length > 300) {
    res.status(400); throw new Error('Short description cannot exceed 300 characters.');
  }

  const finalDescription = description ? String(description).trim() : '';
  if (finalDescription.length > 5000) {
    res.status(400); throw new Error('Description cannot exceed 5000 characters.');
  }

  // Enums based on model
  const validCategories = ['Web Development', 'Frontend', 'Backend', 'Database', 'Security', 'Systems', 'Other', ''];
  const finalCategory = category ? String(category).trim() : '';
  if (!validCategories.includes(finalCategory)) {
    res.status(400); throw new Error('Invalid category.');
  }

  // Strings
  const finalIcon = icon ? String(icon).trim() : '';

  // Arrays
  const cleanTechnologies = sanitizeStringArray(technologies || [], 30, 100);
  const cleanFeatures = sanitizeStringArray(features || [], 30, 200);

  // Numeric order
  let parsedOrder = 0;
  if (order !== undefined && order !== null && order !== '') {
    parsedOrder = Number(order);
    if (isNaN(parsedOrder) || parsedOrder < 0) {
      res.status(400); throw new Error('Order must be a non-negative number.');
    }
  }

  // Strict booleans
  const finalAvailable = typeof available === 'boolean' ? available : true;
  const finalFeatured = typeof featured === 'boolean' ? featured : false;
  const finalIsActive = typeof isActive === 'boolean' ? isActive : true;

  return {
    title: title.trim(),
    shortDescription: shortDescription.trim(),
    description: finalDescription,
    technologies: cleanTechnologies,
    features: cleanFeatures,
    icon: finalIcon,
    category: finalCategory,
    available: finalAvailable,
    featured: finalFeatured,
    order: parsedOrder,
    isActive: finalIsActive,
  };
};

// ── CREATE ───────────────────────────────────────────────────────────────────
export const createService = async (req, res, next) => {
  try {
    const fields = validateServicePayload(req.body, res);

    // Duplicate protection based on title (case-insensitive)
    const exists = await Service.findOne({ title: { $regex: new RegExp(`^${fields.title}$`, 'i') } });
    if (exists) {
      res.status(409); throw new Error('A service with this title already exists.');
    }

    const service = new Service(fields);
    const saved = await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
export const updateService = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid service ID.');
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404); throw new Error('Service not found.');
    }

    const fields = validateServicePayload(req.body, res);

    // Duplicate check excluding self
    const exists = await Service.findOne({ 
        title: { $regex: new RegExp(`^${fields.title}$`, 'i') },
        _id: { $ne: req.params.id }
    });
    if (exists) {
      res.status(409); throw new Error('A service with this title already exists.');
    }

    // Explicit assignment
    Object.assign(service, fields);
    const saved = await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: { service: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const deleteService = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid service ID.');
    }
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      res.status(404); throw new Error('Service not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ── STATUS ───────────────────────────────────────────────────────────────────
export const updateServiceStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid service ID.');
    }
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      res.status(400); throw new Error('isActive must be a strict boolean.');
    }
    const service = await Service.findById(req.params.id);
    if (!service) { res.status(404); throw new Error('Service not found.'); }

    service.isActive = isActive;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

// ── FEATURED ─────────────────────────────────────────────────────────────────
export const updateServiceFeatured = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid service ID.');
    }
    const { featured } = req.body;
    if (typeof featured !== 'boolean') {
      res.status(400); throw new Error('featured must be a strict boolean.');
    }
    const service = await Service.findById(req.params.id);
    if (!service) { res.status(404); throw new Error('Service not found.'); }

    service.featured = featured;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${featured ? 'marked as featured' : 'unfeatured'} successfully`,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

// ── AVAILABILITY ─────────────────────────────────────────────────────────────
export const updateServiceAvailability = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid service ID.');
    }
    const { available } = req.body;
    if (typeof available !== 'boolean') {
      res.status(400); throw new Error('available must be a strict boolean.');
    }
    const service = await Service.findById(req.params.id);
    if (!service) { res.status(404); throw new Error('Service not found.'); }

    service.available = available;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service marked as ${available ? 'available' : 'unavailable'} successfully`,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};
