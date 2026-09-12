import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Site title cannot exceed 100 characters'],
      default: 'My Portfolio',
    },
    siteDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Site description cannot exceed 300 characters'],
      default: 'Welcome to my professional portfolio.',
    },
    defaultTheme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    defaultAccent: {
      type: String,
      trim: true,
      default: 'blue',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    portfolioVisible: {
      type: Boolean,
      default: true,
    },
    contactFormEnabled: {
      type: Boolean,
      default: true,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'SEO title cannot exceed 100 characters'],
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'SEO description cannot exceed 300 characters'],
      default: '',
    },
    ogTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Open Graph title cannot exceed 100 characters'],
      default: '',
    },
    ogDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Open Graph description cannot exceed 300 characters'],
      default: '',
    },
    ogImage: {
      type: String,
      trim: true,
      default: '',
    },
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image'],
      default: 'summary_large_image',
    },
    robotsIndex: {
      type: Boolean,
      default: true,
    },
    robotsFollow: {
      type: Boolean,
      default: true,
    },
    faviconUrl: {
      type: String,
      trim: true,
      default: '',
    },
    customFooterText: {
      type: String,
      trim: true,
      maxlength: [200, 'Footer text cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
