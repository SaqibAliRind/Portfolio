import mongoose from 'mongoose';
import Skill from '../models/Skill.js';

const ALLOWED_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert', ''];
const ALLOWED_CATEGORIES = ['Frontend', 'Backend', 'Database', 'Programming', 'Tools', 'Deployment', 'Other'];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── GET ALL SKILLS (admin view — active + inactive) ─────────────────────────
export const getAdminSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ order: 1, name: 1 });
    res.status(200).json({
      success: true,
      message: 'Skills retrieved successfully',
      data: { skills },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE SKILL ────────────────────────────────────────────────────────
export const getAdminSkillById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Invalid skill ID.');
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      res.status(404);
      throw new Error('Skill not found.');
    }

    res.status(200).json({
      success: true,
      message: 'Skill retrieved successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

// ── CREATE SKILL ─────────────────────────────────────────────────────────────
export const createSkill = async (req, res, next) => {
  try {
    const {
      name, category, subCategory, description, icon,
      level, order, featured, isActive,
    } = req.body;

    // Required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400); throw new Error('Skill name is required and must be at least 2 characters.');
    }
    if (name.trim().length > 100) {
      res.status(400); throw new Error('Skill name cannot exceed 100 characters.');
    }

    if (!category || typeof category !== 'string' || category.trim().length < 2) {
      res.status(400); throw new Error('Category is required.');
    }
    if (!ALLOWED_CATEGORIES.includes(category.trim())) {
      res.status(400); throw new Error(`Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}.`);
    }

    // Optional validations
    if (subCategory && String(subCategory).trim().length > 100) {
      res.status(400); throw new Error('Subcategory cannot exceed 100 characters.');
    }
    if (description && String(description).trim().length > 1000) {
      res.status(400); throw new Error('Description cannot exceed 1000 characters.');
    }
    if (icon && String(icon).trim().length > 200) {
      res.status(400); throw new Error('Icon identifier cannot exceed 200 characters.');
    }

    if (level !== undefined && level !== null && level !== '') {
      if (!ALLOWED_LEVELS.includes(String(level).trim())) {
        res.status(400); throw new Error(`Invalid level. Allowed: ${ALLOWED_LEVELS.filter(Boolean).join(', ')}.`);
      }
    }

    let parsedOrder = 0;
    if (order !== undefined && order !== null && order !== '') {
      parsedOrder = Number(order);
      if (isNaN(parsedOrder) || parsedOrder < 0) {
        res.status(400); throw new Error('Order must be a non-negative number.');
      }
    }

    if (featured !== undefined && featured !== null && typeof featured !== 'boolean') {
      res.status(400); throw new Error('featured must be a strict boolean.');
    }
    if (isActive !== undefined && isActive !== null && typeof isActive !== 'boolean') {
      res.status(400); throw new Error('isActive must be a strict boolean.');
    }

    // Case-insensitive duplicate check
    const normalizedName = name.trim().toLowerCase();
    const existing = await Skill.findOne({
      name: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (existing) {
      res.status(409); throw new Error('Skill already exists.');
    }

    // Explicit field assignment — no mass assignment
    const skill = new Skill({
      name: name.trim(),
      category: category.trim(),
      subCategory: subCategory ? String(subCategory).trim() : '',
      description: description ? String(description).trim() : '',
      icon: icon ? String(icon).trim() : '',
      level: level ? String(level).trim() : '',
      order: parsedOrder,
      featured: typeof featured === 'boolean' ? featured : false,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    const saved = await skill.save();

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: { skill: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── UPDATE SKILL ─────────────────────────────────────────────────────────────
export const updateSkill = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid skill ID.');
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      res.status(404); throw new Error('Skill not found.');
    }

    const {
      name, category, subCategory, description, icon,
      level, order, featured, isActive,
    } = req.body;

    // Required validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400); throw new Error('Skill name is required and must be at least 2 characters.');
    }
    if (name.trim().length > 100) {
      res.status(400); throw new Error('Skill name cannot exceed 100 characters.');
    }
    if (!category || !ALLOWED_CATEGORIES.includes(String(category).trim())) {
      res.status(400); throw new Error(`Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}.`);
    }
    if (subCategory && String(subCategory).trim().length > 100) {
      res.status(400); throw new Error('Subcategory cannot exceed 100 characters.');
    }
    if (description && String(description).trim().length > 1000) {
      res.status(400); throw new Error('Description cannot exceed 1000 characters.');
    }
    if (icon && String(icon).trim().length > 200) {
      res.status(400); throw new Error('Icon identifier cannot exceed 200 characters.');
    }
    if (level !== undefined && level !== null && level !== '' && !ALLOWED_LEVELS.includes(String(level).trim())) {
      res.status(400); throw new Error(`Invalid level. Allowed: ${ALLOWED_LEVELS.filter(Boolean).join(', ')}.`);
    }

    let parsedOrder = skill.order;
    if (order !== undefined && order !== null && order !== '') {
      parsedOrder = Number(order);
      if (isNaN(parsedOrder) || parsedOrder < 0) {
        res.status(400); throw new Error('Order must be a non-negative number.');
      }
    }

    if (featured !== undefined && typeof featured !== 'boolean') {
      res.status(400); throw new Error('featured must be a strict boolean.');
    }
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      res.status(400); throw new Error('isActive must be a strict boolean.');
    }

    // Duplicate name check (excluding the current document)
    const normalizedName = name.trim().toLowerCase();
    const duplicate = await Skill.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (duplicate) {
      res.status(409); throw new Error('Another skill with this name already exists.');
    }

    // Explicit field assignment
    skill.name = name.trim();
    skill.category = category.trim();
    if (subCategory !== undefined) skill.subCategory = String(subCategory).trim();
    if (description !== undefined) skill.description = String(description).trim();
    if (icon !== undefined) skill.icon = String(icon).trim();
    if (level !== undefined) skill.level = String(level).trim();
    skill.order = parsedOrder;
    if (typeof featured === 'boolean') skill.featured = featured;
    if (typeof isActive === 'boolean') skill.isActive = isActive;

    const saved = await skill.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: { skill: saved },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── DELETE SKILL ──────────────────────────────────────────────────────────────
export const deleteSkill = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid skill ID.');
    }

    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      res.status(404); throw new Error('Skill not found.');
    }

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE STATUS ──────────────────────────────────────────────────────────────
export const updateSkillStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid skill ID.');
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      res.status(400); throw new Error('isActive must be a strict boolean (true or false).');
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      res.status(404); throw new Error('Skill not found.');
    }

    skill.isActive = isActive;
    await skill.save();

    res.status(200).json({
      success: true,
      message: `Skill ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE FEATURED ───────────────────────────────────────────────────────────
export const updateSkillFeatured = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid skill ID.');
    }

    const { featured } = req.body;
    if (typeof featured !== 'boolean') {
      res.status(400); throw new Error('featured must be a strict boolean (true or false).');
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      res.status(404); throw new Error('Skill not found.');
    }

    skill.featured = featured;
    await skill.save();

    res.status(200).json({
      success: true,
      message: `Skill featured status updated`,
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};
