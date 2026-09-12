import Profile from '../models/Profile.js';

// Helper for basic string validation and trimming
const validateString = (str, min, max, required = false, name = 'Field') => {
  if (!str && required) throw new Error(`${name} is required.`);
  if (!str) return undefined;
  
  const trimmed = String(str).trim();
  if (required && trimmed.length === 0) throw new Error(`${name} is required.`);
  if (trimmed.length > 0 && trimmed.length < min) throw new Error(`${name} must be at least ${min} characters.`);
  if (trimmed.length > max) throw new Error(`${name} cannot exceed ${max} characters.`);
  
  return trimmed;
};

// URL validation
const isValidUrl = (url) => {
  if (!url) return true; // optional
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Email validation
const isValidEmail = (email) => {
  if (!email) return true; // optional in Profile model
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const getAdminProfile = async (req, res, next) => {
  try {
    // Return any profile, active or inactive. Assuming only one profile exists.
    const profile = await Profile.findOne();
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminProfile = async (req, res, next) => {
  try {
    // Ensure no profile exists
    const existingCount = await Profile.countDocuments();
    if (existingCount > 0) {
      res.status(409);
      throw new Error('Profile already exists. Please update the existing profile instead.');
    }

    const {
      name, title, shortBio, longBio, profileImage, resumeUrl, email, phone, location,
      availability, githubUrl, linkedinUrl, websiteUrl, yearsOfExperience, isAvailable, isActive
    } = req.body;

    // Validate Required Fields
    const validName = validateString(name, 2, 100, true, 'Name');
    const validTitle = validateString(title, 2, 150, true, 'Title');
    const validShortBio = validateString(shortBio, 10, 500, true, 'Short Bio');
    
    // Validate Optionals
    const validLongBio = validateString(longBio, 0, 5000, false, 'Long Bio');
    const validPhone = validateString(phone, 0, 50, false, 'Phone');
    const validLocation = validateString(location, 0, 150, false, 'Location');
    const validAvailability = validateString(availability, 0, 150, false, 'Availability');

    // URLs and Emails
    if (!isValidEmail(email)) {
      res.status(400); throw new Error('Invalid email format.');
    }
    const urls = { profileImage, resumeUrl, githubUrl, linkedinUrl, websiteUrl };
    for (const [key, val] of Object.entries(urls)) {
      if (val && typeof val === 'string' && val.trim().length > 500) {
        res.status(400); throw new Error(`${key} URL cannot exceed 500 characters.`);
      }
      if (!isValidUrl(val)) {
        res.status(400); throw new Error(`Invalid URL format for ${key}.`);
      }
    }

    let parsedYoe = 0;
    if (yearsOfExperience !== undefined && yearsOfExperience !== null && yearsOfExperience !== '') {
      parsedYoe = Number(yearsOfExperience);
      if (isNaN(parsedYoe) || parsedYoe < 0 || parsedYoe > 100) {
        res.status(400); throw new Error('Years of experience must be a valid number between 0 and 100.');
      }
    }

    const newProfile = new Profile({
      name: validName,
      title: validTitle,
      shortBio: validShortBio,
      longBio: validLongBio || '',
      profileImage: profileImage ? profileImage.trim() : '',
      resumeUrl: resumeUrl ? resumeUrl.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      phone: validPhone || '',
      location: validLocation || '',
      availability: validAvailability || '',
      githubUrl: githubUrl ? githubUrl.trim() : '',
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : '',
      websiteUrl: websiteUrl ? websiteUrl.trim() : '',
      yearsOfExperience: parsedYoe,
      isAvailable: isAvailable === true || isAvailable === 'true',
      isActive: isActive === true || isActive === 'true'
    });

    const savedProfile = await newProfile.save();

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: { profile: savedProfile }
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found. Please create one first.');
    }

    const {
      name, title, shortBio, longBio, profileImage, resumeUrl, email, phone, location,
      availability, githubUrl, linkedinUrl, websiteUrl, yearsOfExperience, isAvailable, isActive
    } = req.body;

    // Validate Required Fields
    const validName = validateString(name, 2, 100, true, 'Name');
    const validTitle = validateString(title, 2, 150, true, 'Title');
    const validShortBio = validateString(shortBio, 10, 500, true, 'Short Bio');
    
    // Validate Optionals
    const validLongBio = validateString(longBio, 0, 5000, false, 'Long Bio');
    const validPhone = validateString(phone, 0, 50, false, 'Phone');
    const validLocation = validateString(location, 0, 150, false, 'Location');
    const validAvailability = validateString(availability, 0, 150, false, 'Availability');

    // URLs and Emails
    if (email !== undefined && !isValidEmail(email)) {
      res.status(400); throw new Error('Invalid email format.');
    }
    const urls = { profileImage, resumeUrl, githubUrl, linkedinUrl, websiteUrl };
    for (const [key, val] of Object.entries(urls)) {
      if (val && typeof val === 'string' && val.trim().length > 500) {
        res.status(400); throw new Error(`${key} URL cannot exceed 500 characters.`);
      }
      if (val !== undefined && !isValidUrl(val)) {
        res.status(400); throw new Error(`Invalid URL format for ${key}.`);
      }
    }

    let parsedYoe = profile.yearsOfExperience;
    if (yearsOfExperience !== undefined && yearsOfExperience !== null && yearsOfExperience !== '') {
      parsedYoe = Number(yearsOfExperience);
      if (isNaN(parsedYoe) || parsedYoe < 0 || parsedYoe > 100) {
        res.status(400); throw new Error('Years of experience must be a valid number between 0 and 100.');
      }
    }

    // Assign explicitly to prevent mass-assignment
    profile.name = validName;
    profile.title = validTitle;
    profile.shortBio = validShortBio;
    if (longBio !== undefined) profile.longBio = validLongBio || '';
    if (profileImage !== undefined) profile.profileImage = profileImage ? profileImage.trim() : '';
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl ? resumeUrl.trim() : '';
    if (email !== undefined) profile.email = email ? email.trim().toLowerCase() : '';
    if (phone !== undefined) profile.phone = validPhone || '';
    if (location !== undefined) profile.location = validLocation || '';
    if (availability !== undefined) profile.availability = validAvailability || '';
    if (githubUrl !== undefined) profile.githubUrl = githubUrl ? githubUrl.trim() : '';
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl ? linkedinUrl.trim() : '';
    if (websiteUrl !== undefined) profile.websiteUrl = websiteUrl ? websiteUrl.trim() : '';
    if (yearsOfExperience !== undefined) profile.yearsOfExperience = parsedYoe;
    if (isAvailable !== undefined) profile.isAvailable = isAvailable === true || isAvailable === 'true';
    if (isActive !== undefined) profile.isActive = isActive === true || isActive === 'true';

    const savedProfile = await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: savedProfile }
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

export const updateAdminProfileStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    // Strict boolean validation
    if (isActive !== true && isActive !== false) {
      res.status(400);
      throw new Error('isActive must be a strict boolean (true or false).');
    }

    const profile = await Profile.findOne();
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found.');
    }

    profile.isActive = isActive;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Profile status updated to ${isActive ? 'Active' : 'Inactive'}`,
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};
