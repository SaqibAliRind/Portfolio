import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';
import Certification from '../models/Certification.js';
import Service from '../models/Service.js';
import Message from '../models/Message.js';
import Profile from '../models/Profile.js';
import Settings from '../models/Settings.js';

export const getDashboardOverview = async (req, res, next) => {
  try {
    // 1. Run all counts concurrently using Promise.all for performance
    const [
      // Projects
      projectsTotal, projectsActive, projectsInactive, projectsFeatured,
      // Skills
      skillsTotal, skillsActive, skillsInactive, skillsFeatured,
      // Experience
      expTotal, expActive, expInactive, expCurrent,
      // Education
      eduTotal, eduActive, eduInactive, eduCurrent,
      // Certifications
      certTotal, certActive, certInactive,
      // Services
      servTotal, servActive, servInactive, servFeatured, servAvailable,
      // Messages
      msgTotal, msgNew, msgRead, msgReplied, msgArchived,
      // Profile
      profileData,
      // Settings
      settingsData,
      // Recent Messages
      recentMessages
    ] = await Promise.all([
      // Projects
      Project.countDocuments(),
      Project.countDocuments({ isActive: true }),
      Project.countDocuments({ isActive: false }),
      Project.countDocuments({ featured: true }),
      
      // Skills
      Skill.countDocuments(),
      Skill.countDocuments({ isActive: true }),
      Skill.countDocuments({ isActive: false }),
      Skill.countDocuments({ featured: true }),

      // Experience
      Experience.countDocuments(),
      Experience.countDocuments({ isActive: true }),
      Experience.countDocuments({ isActive: false }),
      Experience.countDocuments({ current: true }),

      // Education
      Education.countDocuments(),
      Education.countDocuments({ isActive: true }),
      Education.countDocuments({ isActive: false }),
      Education.countDocuments({ current: true }),

      // Certifications
      Certification.countDocuments(),
      Certification.countDocuments({ isActive: true }),
      Certification.countDocuments({ isActive: false }),

      // Services
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: false }),
      Service.countDocuments({ featured: true }),
      Service.countDocuments({ available: true }),

      // Messages
      Message.countDocuments(),
      Message.countDocuments({ status: 'new' }),
      Message.countDocuments({ status: 'read' }),
      Message.countDocuments({ status: 'replied' }),
      Message.countDocuments({ status: 'archived' }),

      // Profile
      Profile.findOne(),

      // Settings
      Settings.findOne(),

      // Recent Messages (limit 5)
      Message.find().sort({ createdAt: -1 }).limit(5).select('_id name email subject projectType status createdAt')
    ]);

    const isDbConnected = mongoose.connection.readyState === 1;

    res.status(200).json({
      success: true,
      message: 'Dashboard overview fetched successfully',
      data: {
        statistics: {
          projects: { total: projectsTotal, active: projectsActive, inactive: projectsInactive, featured: projectsFeatured },
          skills: { total: skillsTotal, active: skillsActive, inactive: skillsInactive, featured: skillsFeatured },
          experience: { total: expTotal, active: expActive, inactive: expInactive, current: expCurrent },
          education: { total: eduTotal, active: eduActive, inactive: eduInactive, current: eduCurrent },
          certifications: { total: certTotal, active: certActive, inactive: certInactive },
          services: { total: servTotal, active: servActive, inactive: servInactive, featured: servFeatured, available: servAvailable },
          messages: { total: msgTotal, new: msgNew, read: msgRead, replied: msgReplied, archived: msgArchived }
        },
        profile: {
          exists: !!profileData,
          isActive: profileData ? !!profileData.isActive : false,
          isAvailable: profileData ? !!profileData.availableForHire : false
        },
        settings: {
          exists: !!settingsData,
          maintenanceMode: settingsData ? !!settingsData.maintenanceMode : false,
          portfolioVisible: settingsData ? !!settingsData.portfolioVisible : true,
          contactFormEnabled: settingsData ? !!settingsData.contactFormEnabled : true
        },
        recentMessages,
        system: {
          database: isDbConnected ? 'connected' : 'disconnected',
          server: 'running'
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
