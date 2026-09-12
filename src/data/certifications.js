/**
 * certifications.js — Certifications & Professional Learning data
 * Currently empty — no verified certifications have been provided.
 * Will be populated via Admin Panel / backend once real credentials are available.
 *
 * Future certification object shape:
 * {
 *   id: string,
 *   title: string,              // e.g. 'The Web Developer Bootcamp'
 *   issuer: string,             // e.g. 'Udemy', 'Coursera', 'freeCodeCamp'
 *   issueDate: string | null,   // e.g. 'Oct 2023'
 *   expiryDate: string | null,  // null if no expiry
 *   credentialId: string | null,
 *   credentialUrl: string | null,
 *   description: string,
 *   skills: string[],
 *   category: string,           // e.g. 'Web Development', 'Programming', 'Database'
 *   status: 'verified' | 'in-progress' | 'expired',
 *   image: string | null,       // certificate image URL
 * }
 */

export const certifications = [];

export const certificationCategories = [
  'All',
  'Web Development',
  'Programming',
  'Database',
  'Cloud',
  'Professional Development',
];
