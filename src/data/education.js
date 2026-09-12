/**
 * education.js — Education data
 * Only verified information is included.
 * Uncertain fields (exact dates, CGPA, grades) are left null/empty.
 *
 * Future education object shape:
 * {
 *   id: string,
 *   degree: string,
 *   institution: string,
 *   field: string,
 *   startDate: string | null,
 *   endDate: string | null,
 *   current: boolean,
 *   location: string | null,
 *   description: string,
 *   technologies: string[],
 *   achievements: string[],
 *   status: 'completed' | 'in-progress' | 'planned',
 * }
 */

export const educationData = [
  {
    id: 'bsit-alkawthar',
    degree: 'Bachelor of Science in Information Technology',
    institution: 'Al-Kawthar University',
    field: 'Information Technology',
    startDate: null,
    endDate: null,
    current: true,
    location: null,
    description:
      'Pursuing a Bachelor\'s degree in Information Technology with a focus on software development, programming, and modern computing concepts.',
    technologies: ['JavaScript', 'React.js', 'Node.js', 'MongoDB', 'MySQL', 'C', 'C#', 'PHP'],
    achievements: [],
    status: 'in-progress',
  },
  {
    id: 'diploma-aptech',
    degree: 'Advanced Diploma in Software Engineering',
    institution: 'Aptech',
    field: 'Software Engineering',
    startDate: null,
    endDate: null,
    current: false,
    location: null,
    description:
      'Completed an Advanced Diploma in Software Engineering covering full-stack web development, programming fundamentals, and software engineering principles.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'C', 'C#', 'PHP', 'MySQL'],
    achievements: [],
    status: 'completed',
  },
];
