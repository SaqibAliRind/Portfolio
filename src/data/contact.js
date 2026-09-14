/**
 * contact.js — Contact information
 * Keep contact details separate from JSX.
 * Only verified real information should be placed here.
 * If data is unavailable, use empty strings to indicate configuration is needed.
 */

export const contactInfo = [
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    value: 'saqibrind46@gmail.com',
    href: 'mailto:saqibrind46@gmail.com',
    icon: 'email'
  },
  {
    id: 'location',
    type: 'info',
    label: 'Location',
    value: 'Karachi, Pakistan',
    href: '',
    icon: 'location'
  },
  {
    id: 'github',
    type: 'social',
    label: 'GitHub',
    value: 'github.com/saqib123s',
    href: 'https://github.com/saqib123s',
    icon: 'github'
  },
  {
    id: 'linkedin',
    type: 'social',
    label: 'LinkedIn',
    value: 'linkedin.com/in/saqibrind',
    href: 'https://linkedin.com/',
    icon: 'linkedin'
  }
];

export const availabilityMessage = "Open to Remote & International Opportunities";
