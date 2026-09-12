/**
 * services.js — Services data
 * Structured for future Admin Panel / backend integration.
 *
 * Future service object shape:
 * {
 *   id: string,
 *   title: string,
 *   shortDescription: string,
 *   description: string,
 *   technologies: string[],
 *   features: string[],
 *   icon: string,          // identifier for inline SVG rendering
 *   category: string,
 *   available: boolean,
 *   featured: boolean,
 * }
 */

export const services = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Development',
    shortDescription: 'End-to-end web applications with modern JavaScript stack.',
    description:
      'Building complete, production-ready web applications from frontend to backend — covering UI design, REST API architecture, database integration, and deployment.',
    technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript'],
    features: [
      'Full application architecture',
      'Frontend & backend integration',
      'RESTful API design',
      'Database modelling',
      'Authentication & authorization',
    ],
    icon: 'fullstack',
    category: 'Development',
    available: true,
    featured: true,
  },
  {
    id: 'frontend',
    title: 'React.js Frontend Development',
    shortDescription: 'Responsive, component-driven user interfaces with React.',
    description:
      'Building clean, responsive, and maintainable frontend applications using React.js — with a focus on reusable components, routing, state management, and API integration.',
    technologies: ['React.js', 'React Router', 'Redux Toolkit', 'Axios', 'CSS3'],
    features: [
      'Reusable component architecture',
      'React Router navigation',
      'Redux Toolkit state management',
      'API integration with Axios',
      'Responsive layouts',
    ],
    icon: 'frontend',
    category: 'Frontend',
    available: true,
    featured: false,
  },
  {
    id: 'backend',
    title: 'Node.js & Express.js Backend',
    shortDescription: 'Scalable REST APIs and server-side application logic.',
    description:
      'Designing and building structured, secure, and maintainable backend APIs using Node.js and Express.js — with proper middleware, validation, error handling, and database integration.',
    technologies: ['Node.js', 'Express.js', 'REST APIs', 'JWT', 'MongoDB'],
    features: [
      'RESTful API architecture',
      'Middleware & validation',
      'JWT authentication',
      'Error handling',
      'MongoDB integration',
    ],
    icon: 'backend',
    category: 'Backend',
    available: true,
    featured: false,
  },
  {
    id: 'database',
    title: 'MongoDB Database Integration',
    shortDescription: 'Schema design, Mongoose models, and efficient data management.',
    description:
      'Designing and integrating MongoDB databases using Mongoose — including schema modelling, CRUD operations, data relationships, and cloud deployment via MongoDB Atlas.',
    technologies: ['MongoDB', 'Mongoose', 'MongoDB Atlas', 'MySQL'],
    features: [
      'Schema & model design',
      'CRUD operations',
      'Data relationships',
      'MongoDB Atlas cloud setup',
      'Query optimization',
    ],
    icon: 'database',
    category: 'Database',
    available: true,
    featured: false,
  },
  {
    id: 'auth',
    title: 'Authentication & Authorization',
    shortDescription: 'Secure JWT-based authentication systems and protected routes.',
    description:
      'Implementing secure user authentication and role-based access control — using JWT, password hashing, protected route middleware, and session management patterns.',
    technologies: ['JWT', 'bcrypt', 'Express.js', 'Node.js', 'MongoDB'],
    features: [
      'JWT authentication',
      'Password hashing',
      'Protected routes',
      'Role-based authorization',
      'Auth middleware',
    ],
    icon: 'auth',
    category: 'Security',
    available: true,
    featured: false,
  },
  {
    id: 'management-systems',
    title: 'Business & Management Systems',
    shortDescription: 'Custom web-based management and ERP-style applications.',
    description:
      'Developing web-based business and management systems — including university portals, ERP-style platforms, hotel management, and event management applications, using the MERN stack.',
    technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    features: [
      'University management systems',
      'ERP-style platforms',
      'Hotel management systems',
      'Event management systems',
      'Custom admin dashboards',
    ],
    icon: 'management',
    category: 'Systems',
    available: true,
    featured: true,
  },
];
