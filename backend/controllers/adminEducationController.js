import mongoose from 'mongoose';
import Education from '../models/Education.js';

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
export const getAdminEducation = async (req, res, next) => {
  try {
    const educationData = await Education.find().sort({ order: 1, startDate: -1 });
    res.status(200).json({
      success: true,
      message: 'Education retrieved successfully',
      data: { education: educationData },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE ───────────────────────────────────────────────────────────────
export const getAdminEducationById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid education ID.');
    }
    const education = await Education.findById(req.params.id);
    if (!education) {
      res.status(404); throw new Error('Education not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Education retrieved successfully',
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};

// ── Shared validation helper ─────────────────────────────────────────────────
const validateEducationPayload = (body, res) => {
  const {
    degree, institution, field, startDate, endDate, current,
    location, description, technologies, achievements,
    status, order, isActive
  } = body;

  // Required fields
  if (!degree || typeof degree !== 'string' || degree.trim().length < 2) {
    res.status(400); throw new Error('Degree is required and must be at least 2 characters.');
  }
  if (degree.trim().length > 150) {
    res.status(400); throw new Error('Degree cannot exceed 150 characters.');
  }

  if (!institution || typeof institution !== 'string' || institution.trim().length < 2) {
    res.status(400); throw new Error('Institution is required and must be at least 2 characters.');
  }
  if (institution.trim().length > 150) {
    res.status(400); throw new Error('Institution cannot exceed 150 characters.');
  }

  if (!startDate || typeof startDate !== 'string' || startDate.trim().length === 0) {
    res.status(400); throw new Error('Start date is required.');
  }

  // Date logic
  const isCurrent = typeof current === 'boolean' ? current : false;
  let finalEndDate = endDate ? String(endDate).trim() : '';

  if (isCurrent) {
    finalEndDate = ''; // Clear end date if current is true
  }

  // Status enum check based on model ['completed', 'in-progress', 'planned', '']
  const validStatus = ['completed', 'in-progress', 'planned', ''];
  const finalStatus = status ? String(status).trim() : '';
  if (!validStatus.includes(finalStatus)) {
    res.status(400); throw new Error(`Invalid academic status.`);
  }

  // Optional string length boundaries
  const finalField = field ? String(field).trim() : '';
  if (finalField.length > 150) {
    res.status(400); throw new Error('Field of study cannot exceed 150 characters.');
  }

  const finalLocation = location ? String(location).trim() : '';
  if (finalLocation.length > 150) {
    res.status(400); throw new Error('Location cannot exceed 150 characters.');
  }

  const finalDescription = description ? String(description).trim() : '';
  if (finalDescription.length > 5000) {
    res.status(400); throw new Error('Description cannot exceed 5000 characters.');
  }

  // Arrays
  const cleanTechnologies = sanitizeStringArray(technologies || [], 30, 100);
  const cleanAchievements = sanitizeStringArray(achievements || [], 30, 500);

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
    degree: degree.trim(),
    institution: institution.trim(),
    field: finalField,
    startDate: startDate.trim(),
    endDate: finalEndDate,
    current: isCurrent,
    location: finalLocation,
    description: finalDescription,
    technologies: cleanTechnologies,
    achievements: cleanAchievements,
    status: finalStatus,
    order: parsedOrder,
    isActive: finalIsActive,
  };
};

// ── CREATE ───────────────────────────────────────────────────────────────────
export const createEducation = async (req, res, next) => {
  try {
    const fields = validateEducationPayload(req.body, res);

    // Duplicate protection: Same degree, institution, and start date
    const exists = await Education.findOne({ 
        degree: fields.degree, 
        institution: fields.institution, 
        startDate: fields.startDate 
    });
    if (exists) {
      res.status(409); throw new Error('An identical education record already exists.');
    }

    const education = new Education(fields);
    const saved = await education.save();

    res.status(201).json({
      success: true,
      message: 'Education created successfully',
      data: { education: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
export const updateEducation = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid education ID.');
    }

    const education = await Education.findById(req.params.id);
    if (!education) {
      res.status(404); throw new Error('Education not found.');
    }

    const fields = validateEducationPayload(req.body, res);

    // Duplicate check excluding self
    const exists = await Education.findOne({ 
        degree: fields.degree, 
        institution: fields.institution, 
        startDate: fields.startDate,
        _id: { $ne: req.params.id }
    });
    if (exists) {
      res.status(409); throw new Error('An identical education record already exists.');
    }

    // Explicit assignment
    Object.assign(education, fields);
    const saved = await education.save();

    res.status(200).json({
      success: true,
      message: 'Education updated successfully',
      data: { education: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const deleteEducation = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid education ID.');
    }
    const education = await Education.findByIdAndDelete(req.params.id);
    if (!education) {
      res.status(404); throw new Error('Education not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Education deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ── STATUS ───────────────────────────────────────────────────────────────────
export const updateEducationStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid education ID.');
    }
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      res.status(400); throw new Error('isActive must be a strict boolean.');
    }
    const education = await Education.findById(req.params.id);
    if (!education) { res.status(404); throw new Error('Education not found.'); }

    education.isActive = isActive;
    await education.save();

    res.status(200).json({
      success: true,
      message: `Education ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};
