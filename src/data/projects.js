/**
 * projects.js — Project data
 * Currently empty — will be connected to Admin Panel / backend API.
 *
 * Future project object shape:
 * {
 *   id: string,
 *   title: string,
 *   slug: string,
 *   shortDescription: string,
 *   fullDescription: string,
 *   category: string,
 *   image: string | null,
 *   screenshots: string[],
 *   technologies: string[],
 *   features: string[],
 *   role: string,
 *   duration: string,
 *   status: 'completed' | 'in-progress' | 'planned',
 *   liveDemo: string | null,
 *   github: string | null,
 *   featured: boolean,
 *   problem: string,
 *   solution: string,
 *   targetUsers: string,
 *   architecture: string,
 *   databaseDesign: string,
 *   apiDetails: string,
 *   challenges: string[],
 *   solutions: string[],
 *   futureImprovements: string[],
 * }
 */

export const projects = [];

export const projectCategories = [
  'All',
  'Management System',
  'ERP',
  'Web App',
  'API',
];
