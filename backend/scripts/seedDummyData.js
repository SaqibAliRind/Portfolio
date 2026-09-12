import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';
import Certification from '../models/Certification.js';

const DUMMY_PROJECTS = [
  {
    title: "Hotel Management System",
    slug: "1",
    category: "Management Systems",
    shortDescription: "A complete hotel management solution with room booking, guest management, reservations, payments and admin dashboard.",
    fullDescription: "The Hotel Management System is a full-stack web application designed to simplify hotel operations and enhance guest experiences. It allows users to book rooms, manage reservations, handle payments, and provides a powerful admin dashboard to manage rooms, guests, and hotel operations efficiently.\n\nThis project demonstrates my skills in modern web technologies, clean code structure, and real-world application development.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
    ],
    technologies: [
      { name: "React", role: "Frontend", color: "#61dafb", icon: "⚛" },
      { name: "Node.js", role: "Backend", color: "#68a063", icon: "⬡" },
      { name: "MongoDB", role: "Database", color: "#47a248", icon: "🍃" },
    ],
    features: [
      { title: "Room Booking & Reservation", desc: "With date and guest selection", icon: "🏨" },
      { title: "Admin Dashboard", desc: "Manage rooms, bookings, users", icon: "⚙️" },
      { title: "Guest Management", desc: "Add, edit, delete guest details", icon: "👥" },
    ],
    role: "Full Stack Developer",
    duration: "4 Weeks",
    status: "completed",
    liveDemo: "#",
    github: "#",
    featured: true,
  },
  {
    title: "Event Management System",
    slug: "2",
    category: "Management Systems",
    shortDescription: "A complete event management platform for creating, managing and attending events with ticketing and real-time notifications.",
    fullDescription: "The Event Management System enables organizers to create and manage events, sell tickets, and communicate with attendees. Built with the MERN stack, it handles real-time updates, QR code check-in, and detailed analytics for event organizers.\n\nThis project showcases advanced state management, real-time features, and complex database design.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=600&auto=format&fit=crop",
    ],
    technologies: [
      { name: "React", role: "Frontend", color: "#61dafb", icon: "⚛" },
      { name: "Node.js", role: "Backend", color: "#68a063", icon: "⬡" },
      { name: "MongoDB", role: "Database", color: "#47a248", icon: "🍃" },
    ],
    features: [
      { title: "Event Creation", desc: "Create and manage events easily", icon: "🎉" },
      { title: "Ticket Booking", desc: "Secure online ticket purchase", icon: "🎟️" },
    ],
    role: "Full Stack Developer",
    duration: "5 Weeks",
    status: "completed",
    liveDemo: "#",
    github: "#",
    featured: true,
  },
  {
    title: "University Management System",
    slug: "3",
    category: "Management Systems",
    shortDescription: "A comprehensive university portal for managing students, faculty, courses, grades, and attendance with role-based dashboards.",
    fullDescription: "The University Management System centralizes all academic operations into a single modern platform. Admins, teachers, and students each get a dedicated role-based dashboard to manage their workflows.\n\nThis project demonstrates complex database relationships, role-based access control, and scalable full-stack architecture.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop",
    ],
    technologies: [
      { name: "React", role: "Frontend", color: "#61dafb", icon: "⚛" },
      { name: "Node.js", role: "Backend", color: "#68a063", icon: "⬡" },
      { name: "MongoDB", role: "Database", color: "#47a248", icon: "🍃" },
    ],
    features: [
      { title: "Role-Based Dashboards", desc: "Admin, Teacher, Student views", icon: "🎓" },
      { title: "Course Registration", desc: "Students enroll in courses online", icon: "📚" },
    ],
    role: "Full Stack Developer",
    duration: "6 Weeks",
    status: "completed",
    liveDemo: "#",
    github: "#",
    featured: true,
  }
];

const DUMMY_SKILLS = [
  { name: 'React', icon: '⚛', color: '#61dafb', category: 'Frontend', order: 1 },
  { name: 'Node.js', icon: '⬡', color: '#68a063', category: 'Backend', order: 2 },
  { name: 'Express.js', icon: 'ex', color: '#999999', category: 'Backend', order: 3 },
  { name: 'MongoDB', icon: '🍃', color: '#47a248', category: 'Database', order: 4 },
  { name: 'JavaScript', icon: 'JS', color: '#f7df1e', category: 'Programming', order: 5 },
  { name: 'HTML', icon: 'H5', color: '#e34c26', category: 'Frontend', order: 6 },
  { name: 'CSS', icon: 'C3', color: '#264de4', category: 'Frontend', order: 7 },
  { name: 'Git', icon: 'ᛦ', color: '#f05032', category: 'Tools', order: 8 },
  // Progress bars mapping
  { name: 'Frontend Development', percentage: 90, icon: '⚛', color: '#61dafb', category: 'Other', featured: true, order: 9 },
  { name: 'Backend Development', percentage: 85, icon: '⬡', color: '#68a063', category: 'Other', featured: true, order: 10 },
  { name: 'Database Management', percentage: 80, icon: '🍃', color: '#47a248', category: 'Other', featured: true, order: 11 },
  { name: 'API Development', percentage: 85, icon: '🔌', color: '#06b6d4', category: 'Other', featured: true, order: 12 },
  { name: 'Tools & Others', percentage: 75, icon: '🛠️', color: '#8b5cf6', category: 'Other', featured: true, order: 13 },
];

const DUMMY_EXPERIENCE = [
  {
    position: 'Full Stack MERN Developer',
    company: 'Tech Solutions Global',
    startDate: '2025',
    endDate: 'Present',
    current: true,
    description: 'Leading the development of highly scalable web applications using React, Node.js, Express, and MongoDB. Optimized database queries improving performance by 40%.',
    type: 'Full-time'
  },
  {
    position: 'Frontend React Engineer',
    company: 'Creative Web Agency',
    startDate: '2024',
    endDate: '2025',
    current: false,
    description: 'Built interactive and responsive user interfaces. Implemented complex state management using Redux and integrated RESTful APIs.',
    type: 'Full-time'
  },
  {
    position: 'Junior Web Developer',
    company: 'Startup Innovators',
    startDate: '2023',
    endDate: '2024',
    current: false,
    description: 'Assisted in building responsive websites and internal dashboards. Gained hands-on experience in full-stack development workflows.',
    type: 'Internship'
  }
];

const DUMMY_EDUCATION = [
  {
    degree: 'Bachelor of Computer Science',
    institution: 'University of Technology',
    startDate: '2020',
    endDate: '2024',
    description: 'Graduated with First Class Honors. Specialized in Software Engineering and Database Systems.',
    grade: 'A'
  },
  {
    degree: 'Advanced Web Development Bootcamp',
    institution: 'Tech Academy',
    startDate: '2022',
    endDate: '2023',
    description: 'Intensive 6-month program focusing on modern MERN stack development, DevOps, and agile methodologies.',
    grade: 'Completed'
  }
];

const DUMMY_CERTIFICATIONS = [
  {
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'March 2025',
    credentialId: 'AWS-12345',
    credentialUrl: '#'
  },
  {
    title: 'MongoDB Node.js Developer Path',
    issuer: 'MongoDB University',
    date: 'January 2025',
    credentialId: 'MDB-54321',
    credentialUrl: '#'
  },
  {
    title: 'React Native Expert Certification',
    issuer: 'Meta',
    date: 'November 2024',
    credentialId: 'META-98765',
    credentialUrl: '#'
  }
];

import { connectDB } from '../config/db.js';

async function seedDB() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected!');

    // Clear existing collections
    console.log('Clearing existing data...');
    await Project.deleteMany({});
    await Skill.deleteMany({});
    await Experience.deleteMany({});
    await Education.deleteMany({});
    await Certification.deleteMany({});

    // Seed data
    console.log('Seeding Projects...');
    await Project.insertMany(DUMMY_PROJECTS);
    
    console.log('Seeding Skills...');
    await Skill.insertMany(DUMMY_SKILLS);

    console.log('Seeding Experience...');
    await Experience.insertMany(DUMMY_EXPERIENCE);

    console.log('Seeding Education...');
    await Education.insertMany(DUMMY_EDUCATION);

    console.log('Seeding Certifications...');
    await Certification.insertMany(DUMMY_CERTIFICATIONS);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();
