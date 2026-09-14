import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Service from '../models/Service.js';

const DUMMY_SERVICES = [
  {
    title: "Full Stack Development",
    shortDescription: "End-to-end web application development using the MERN stack.",
    description: "I build robust, scalable, and high-performance web applications from scratch. From designing the database architecture to creating interactive frontend interfaces, I handle the complete development lifecycle.",
    icon: "fullstack",
    features: [
      "Custom Web Applications",
      "API Development & Integration",
      "Database Architecture",
      "Responsive UI/UX"
    ],
    technologies: ["React", "Node.js", "Express", "MongoDB"],
    order: 1,
    isActive: true,
  },
  {
    title: "Frontend Development",
    shortDescription: "Creating beautiful, responsive, and interactive user interfaces.",
    description: "I craft pixel-perfect, modern frontend experiences using React.js and modern CSS. My focus is on performance, accessibility, and creating seamless user journeys.",
    icon: "frontend",
    features: [
      "Single Page Applications (SPA)",
      "Interactive Dashboards",
      "Performance Optimization",
      "Mobile-First Design"
    ],
    technologies: ["React", "Redux", "Tailwind CSS", "JavaScript"],
    order: 2,
    isActive: true,
  },
  {
    title: "Backend API Services",
    shortDescription: "Scalable backend architectures and RESTful API development.",
    description: "I design secure and efficient backend systems. Using Node.js and Express, I create robust APIs that serve as the backbone for your web and mobile applications.",
    icon: "backend",
    features: [
      "RESTful API Design",
      "Authentication & Authorization",
      "Server-Side Logic",
      "Cloud Integration"
    ],
    technologies: ["Node.js", "Express", "JWT", "REST API"],
    order: 3,
    isActive: true,
  }
];

const seedServices = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected! Seeding Services...');
    
    await Service.deleteMany({});
    await Service.insertMany(DUMMY_SERVICES);
    
    console.log('Services seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();
