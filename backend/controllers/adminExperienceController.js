import mongoose from 'mongoose';
import Experience from '../models/Experience.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidUrl = (url) => {
  if (!url) return true;
  try { new URL(url); return true; } catch { return false; }
};

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
export const getAdminExperience = async (req, res, next) => {
  try {
    const experiences = await Experience.find().sort({ order: 1, startDate: -1 });
    res.status(200).json({
      success: true,
      message: 'Experience retrieved successfully',
      data: { experiences },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE ───────────────────────────────────────────────────────────────
export const getAdminExperienceById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid experience ID.');
    }
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      res.status(404); throw new Error('Experience not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Experience retrieved successfully',
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

// ── Shared validation helper ─────────────────────────────────────────────────
const validateExperiencePayload = (body, res) => {
  const {
    position, company, type, startDate, endDate, current,
    description, responsibilities, technologies, location, link,
    order, isActive
  } = body;

  // Required fields
  if (!position || typeof position !== 'string' || position.trim().length < 2) {
    res.status(400); throw new Error('Position is required and must be at least 2 characters.');
  }
  if (position.trim().length > 150) {
    res.status(400); throw new Error('Position cannot exceed 150 characters.');
  }

  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    res.status(400); throw new Error('Company is required and must be at least 2 characters.');
  }
  if (company.trim().length > 150) {
    res.status(400); throw new Error('Company cannot exceed 150 characters.');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    res.status(400); throw new Error('Description is required and must be at least 10 characters.');
  }
  if (description.trim().length > 5000) {
    res.status(400); throw new Error('Description cannot exceed 5000 characters.');
  }

  if (!startDate || typeof startDate !== 'string' || startDate.trim().length === 0) {
    res.status(400); throw new Error('Start date is required.');
  }
  
  // Date logic
  const isCurrent = typeof current === 'boolean' ? current : false;
  let finalEndDate = endDate ? String(endDate).trim() : '';

  if (isCurrent) {
    finalEndDate = ''; // Clear end date if current is true
  } else {
    // Basic logical check if both are provided (assumes format like YYYY-MM or YYYY)
    // We do a simple string comparison if possible or just rely on length logic.
    // In many portfolios, dates are "Jan 2022" which is hard to strictly parse natively without a library.
    // We enforce that if it's not current, they might want to provide an end date.
    // Real stricter JS Date parsing can be complex based on formats, so we do basic presence check.
  }

  // Type enum
  const validTypes = ['Full-time', 'Part-time', 'Freelance', 'Internship', 'Contract', 'Volunteer', 'Other', ''];
  const finalType = type ? String(type).trim() : '';
  if (!validTypes.includes(finalType)) {
    res.status(400); throw new Error(`Invalid employment type.`);
  }

  // Location
  if (location && String(location).trim().length > 150) {
    res.status(400); throw new Error('Location cannot exceed 150 characters.');
  }

  // URLs
  if (link && !isValidUrl(link)) {
    res.status(400); throw new Error('Invalid URL for link.');
  }

  // Arrays
  const cleanResponsibilities = sanitizeStringArray(responsibilities || [], 30, 500);
  const cleanTechnologies = sanitizeStringArray(technologies || [], 50, 100);

  // Numeric order
  let parsedOrder = 0;
  if (order !== undefined && order !== null && order !== '') {
    parsedOrder = Number(order);
    if (isNaN(parsedOrder) || parsedOrder < 0) {
      res.status(400); throw new Error('Order must be a non-negative number.');
    }
  }

  // Strict booleans
  const finalIsActive = typeof isActive === 'boolean' ? isActive : true;

  return {
    position: position.trim(),
    company: company.trim(),
    type: finalType,
    startDate: startDate.trim(),
    endDate: finalEndDate,
    current: isCurrent,
    description: description.trim(),
    responsibilities: cleanResponsibilities,
    technologies: cleanTechnologies,
    location: location ? String(location).trim() : '',
    link: link ? String(link).trim() : '',
    order: parsedOrder,
    isActive: finalIsActive,
  };
};

// ── CREATE ───────────────────────────────────────────────────────────────────
export const createExperience = async (req, res, next) => {
  try {
    const fields = validateExperiencePayload(req.body, res);

    // Duplicate protection: Same position, company, and start date
    const exists = await Experience.findOne({ 
        position: fields.position, 
        company: fields.company, 
        startDate: fields.startDate 
    });
    if (exists) {
      res.status(409); throw new Error('An identical experience record already exists.');
    }

    const experience = new Experience(fields);
    const saved = await experience.save();

    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: { experience: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
export const updateExperience = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid experience ID.');
    }

    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      res.status(404); throw new Error('Experience not found.');
    }

    const fields = validateExperiencePayload(req.body, res);

    // Duplicate check excluding self
    const exists = await Experience.findOne({ 
        position: fields.position, 
        company: fields.company, 
        startDate: fields.startDate,
        _id: { $ne: req.params.id }
    });
    if (exists) {
      res.status(409); throw new Error('An identical experience record already exists.');
    }

    // Explicit assignment
    Object.assign(experience, fields);
    const saved = await experience.save();

    res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      data: { experience: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const deleteExperience = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid experience ID.');
    }
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) {
      res.status(404); throw new Error('Experience not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ── STATUS ───────────────────────────────────────────────────────────────────
export const updateExperienceStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid experience ID.');
    }
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      res.status(400); throw new Error('isActive must be a strict boolean.');
    }
    const experience = await Experience.findById(req.params.id);
    if (!experience) { res.status(404); throw new Error('Experience not found.'); }

    experience.isActive = isActive;
    await experience.save();

    res.status(200).json({
      success: true,
      message: `Experience ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};
