import mongoose from 'mongoose';
import Certification from '../models/Certification.js';

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
export const getAdminCertifications = async (req, res, next) => {
  try {
    const certifications = await Certification.find().sort({ order: 1, issueDate: -1 });
    res.status(200).json({
      success: true,
      message: 'Certifications retrieved successfully',
      data: { certifications },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE ───────────────────────────────────────────────────────────────
export const getAdminCertificationById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid certification ID.');
    }
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      res.status(404); throw new Error('Certification not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Certification retrieved successfully',
      data: { certification },
    });
  } catch (error) {
    next(error);
  }
};

// ── Shared validation helper ─────────────────────────────────────────────────
const validateCertificationPayload = (body, res) => {
  const {
    title, issuer, issueDate, expiryDate, credentialId, credentialUrl,
    description, skills, category, status, image, order, isActive
  } = body;

  // Required fields
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    res.status(400); throw new Error('Title is required and must be at least 2 characters.');
  }
  if (title.trim().length > 150) {
    res.status(400); throw new Error('Title cannot exceed 150 characters.');
  }

  if (!issuer || typeof issuer !== 'string' || issuer.trim().length < 2) {
    res.status(400); throw new Error('Issuer is required and must be at least 2 characters.');
  }
  if (issuer.trim().length > 150) {
    res.status(400); throw new Error('Issuer cannot exceed 150 characters.');
  }

  if (!issueDate || typeof issueDate !== 'string' || issueDate.trim().length === 0) {
    res.status(400); throw new Error('Issue date is required.');
  }

  // URLs
  if (credentialUrl && !isValidUrl(credentialUrl)) {
    res.status(400); throw new Error('Invalid URL for credential link.');
  }
  if (image && !isValidUrl(image)) {
    res.status(400); throw new Error('Invalid URL for image.');
  }

  // Status enum check based on model ['verified', 'in-progress', 'expired', '']
  const validStatus = ['verified', 'in-progress', 'expired', ''];
  const finalStatus = status ? String(status).trim() : '';
  if (!validStatus.includes(finalStatus)) {
    res.status(400); throw new Error(`Invalid certification status.`);
  }

  // Optional string length boundaries
  const finalCategory = category ? String(category).trim() : '';
  if (finalCategory.length > 150) {
    res.status(400); throw new Error('Category cannot exceed 150 characters.');
  }

  const finalCredentialId = credentialId ? String(credentialId).trim() : '';
  if (finalCredentialId.length > 200) {
    res.status(400); throw new Error('Credential ID cannot exceed 200 characters.');
  }

  const finalDescription = description ? String(description).trim() : '';
  if (finalDescription.length > 5000) {
    res.status(400); throw new Error('Description cannot exceed 5000 characters.');
  }
  
  let finalExpiryDate = expiryDate ? String(expiryDate).trim() : '';
  
  if (finalExpiryDate && new Date(finalExpiryDate) < new Date(issueDate)) {
       res.status(400); throw new Error('Expiry date cannot be earlier than issue date.');
  }

  // Arrays
  const cleanSkills = sanitizeStringArray(skills || [], 30, 100);

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
    title: title.trim(),
    issuer: issuer.trim(),
    issueDate: issueDate.trim(),
    expiryDate: finalExpiryDate,
    credentialId: finalCredentialId,
    credentialUrl: credentialUrl ? String(credentialUrl).trim() : '',
    description: finalDescription,
    skills: cleanSkills,
    category: finalCategory,
    status: finalStatus,
    image: image ? String(image).trim() : '',
    order: parsedOrder,
    isActive: finalIsActive,
  };
};

// ── CREATE ───────────────────────────────────────────────────────────────────
export const createCertification = async (req, res, next) => {
  try {
    const fields = validateCertificationPayload(req.body, res);

    // Duplicate protection
    const exists = await Certification.findOne({ 
        title: fields.title, 
        issuer: fields.issuer, 
        issueDate: fields.issueDate 
    });
    if (exists) {
      res.status(409); throw new Error('An identical certification record already exists.');
    }

    const certification = new Certification(fields);
    const saved = await certification.save();

    res.status(201).json({
      success: true,
      message: 'Certification created successfully',
      data: { certification: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
export const updateCertification = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid certification ID.');
    }

    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      res.status(404); throw new Error('Certification not found.');
    }

    const fields = validateCertificationPayload(req.body, res);

    // Duplicate check excluding self
    const exists = await Certification.findOne({ 
        title: fields.title, 
        issuer: fields.issuer, 
        issueDate: fields.issueDate,
        _id: { $ne: req.params.id }
    });
    if (exists) {
      res.status(409); throw new Error('An identical certification record already exists.');
    }

    // Explicit assignment
    Object.assign(certification, fields);
    const saved = await certification.save();

    res.status(200).json({
      success: true,
      message: 'Certification updated successfully',
      data: { certification: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
export const deleteCertification = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid certification ID.');
    }
    const certification = await Certification.findByIdAndDelete(req.params.id);
    if (!certification) {
      res.status(404); throw new Error('Certification not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Certification deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ── STATUS ───────────────────────────────────────────────────────────────────
export const updateCertificationStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid certification ID.');
    }
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      res.status(400); throw new Error('isActive must be a strict boolean.');
    }
    const certification = await Certification.findById(req.params.id);
    if (!certification) { res.status(404); throw new Error('Certification not found.'); }

    certification.isActive = isActive;
    await certification.save();

    res.status(200).json({
      success: true,
      message: `Certification ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { certification },
    });
  } catch (error) {
    next(error);
  }
};
