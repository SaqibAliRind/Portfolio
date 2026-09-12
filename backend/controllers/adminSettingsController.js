import Settings from '../models/Settings.js';
import { URL } from 'url';

// Helper to validate URL format safely
const isValidHttpUrl = (string) => {
  if (!string || typeof string !== 'string') return true; // empty is allowed if optional
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const sanitizePayload = (body, res) => {
  const {
    siteTitle, siteDescription, defaultTheme, defaultAccent,
    maintenanceMode, portfolioVisible, contactFormEnabled,
    seoTitle, seoDescription, ogTitle, ogDescription, ogImage,
    twitterCard, robotsIndex, robotsFollow, faviconUrl, customFooterText
  } = body;

  const validThemes = ['dark', 'light', 'system'];
  // Extracted from existing ThemeContext supported accents
  const validAccents = ['blue', 'purple', 'green', 'rose', 'orange'];
  const validTwitterCards = ['summary', 'summary_large_image'];

  if (ogImage && !isValidHttpUrl(ogImage)) {
    res.status(400); throw new Error('ogImage must be a valid HTTP/HTTPS URL.');
  }
  if (faviconUrl && !isValidHttpUrl(faviconUrl)) {
    res.status(400); throw new Error('faviconUrl must be a valid HTTP/HTTPS URL.');
  }

  return {
    siteTitle: siteTitle !== undefined ? String(siteTitle).trim().slice(0, 100) : 'My Portfolio',
    siteDescription: siteDescription !== undefined ? String(siteDescription).trim().slice(0, 300) : 'Welcome to my professional portfolio.',
    defaultTheme: validThemes.includes(defaultTheme) ? defaultTheme : 'dark',
    defaultAccent: validAccents.includes(defaultAccent) ? defaultAccent : 'blue',
    maintenanceMode: typeof maintenanceMode === 'boolean' ? maintenanceMode : false,
    portfolioVisible: typeof portfolioVisible === 'boolean' ? portfolioVisible : true,
    contactFormEnabled: typeof contactFormEnabled === 'boolean' ? contactFormEnabled : true,
    seoTitle: seoTitle !== undefined ? String(seoTitle).trim().slice(0, 100) : '',
    seoDescription: seoDescription !== undefined ? String(seoDescription).trim().slice(0, 300) : '',
    ogTitle: ogTitle !== undefined ? String(ogTitle).trim().slice(0, 100) : '',
    ogDescription: ogDescription !== undefined ? String(ogDescription).trim().slice(0, 300) : '',
    ogImage: ogImage ? String(ogImage).trim() : '',
    twitterCard: validTwitterCards.includes(twitterCard) ? twitterCard : 'summary_large_image',
    robotsIndex: typeof robotsIndex === 'boolean' ? robotsIndex : true,
    robotsFollow: typeof robotsFollow === 'boolean' ? robotsFollow : true,
    faviconUrl: faviconUrl ? String(faviconUrl).trim() : '',
    customFooterText: customFooterText !== undefined ? String(customFooterText).trim().slice(0, 200) : '',
  };
};

// ── GET ADMIN SETTINGS ──────────────────────────────────────────────────────
export const getAdminSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Creates default singleton
    }
    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE SETTINGS (PUT) ───────────────────────────────────────────────────
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const fields = sanitizePayload(req.body, res);
    Object.assign(settings, fields);
    
    const updatedSettings = await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: updatedSettings },
    });
  } catch (error) {
    if (res.statusCode === 200) res.status(400);
    next(error);
  }
};

// ── GET PUBLIC SETTINGS ─────────────────────────────────────────────────────
export const getPublicSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Generate default if none
    }
    
    // Only return safe public fields
    const publicSettings = {
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      defaultTheme: settings.defaultTheme,
      defaultAccent: settings.defaultAccent,
      maintenanceMode: settings.maintenanceMode,
      portfolioVisible: settings.portfolioVisible,
      contactFormEnabled: settings.contactFormEnabled,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      ogTitle: settings.ogTitle,
      ogDescription: settings.ogDescription,
      ogImage: settings.ogImage,
      twitterCard: settings.twitterCard,
      robotsIndex: settings.robotsIndex,
      robotsFollow: settings.robotsFollow,
      faviconUrl: settings.faviconUrl,
      customFooterText: settings.customFooterText,
    };

    res.status(200).json({
      success: true,
      data: { settings: publicSettings },
    });
  } catch (error) {
    next(error);
  }
};
